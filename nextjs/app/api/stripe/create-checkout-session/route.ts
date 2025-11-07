import stripe from "@/lib/stripe";
import { db } from "@/server/db";
import { stripeCustomersTable } from "@/server/db/schema";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const baseUrl = process.env.APP_URL;
    if (!baseUrl) {
      throw new Error("APP_URL environment variable is not set");
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "STRIPE_PRICE_ID environment variable is not set" },
        { status: 500 }
      );
    }

    // Validate that it's a price ID, not a product ID
    if (!priceId.startsWith("price_")) {
      return NextResponse.json(
        {
          error: `Invalid STRIPE_PRICE_ID: "${priceId}". It should start with "price_" not "prod_". Please check your Stripe dashboard for the correct Price ID.`,
        },
        { status: 500 }
      );
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;

    const stripeCustomerId = await getOrCreateStripeCustomer(userId, email);

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/settings?success=true`,
      cancel_url: `${baseUrl}/settings?canceled=true`,
      client_reference_id: userId,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Error creating checkout session", error);

    // Provide more helpful error messages for common Stripe errors
    if (error instanceof Error) {
      if (error.message.includes("No such price")) {
        return NextResponse.json(
          {
            error: `Invalid price ID. Please verify STRIPE_PRICE_ID in your environment variables matches a valid price in your Stripe dashboard.`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
}

async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  // Check if we already have a Stripe customer for this user
  const existingCustomer = await db.query.stripeCustomersTable.findFirst({
    where: eq(stripeCustomersTable.userId, userId),
  });

  if (existingCustomer) {
    // If we have a customer, return their Stripe customer ID
    return existingCustomer.stripeCustomerId;
  }

  // If we don't have a customer, create one
  const customer = await stripe.customers.create({
    email: email,
    metadata: { userId: userId },
  });

  // Save the new Stripe customer ID to our database
  await db.insert(stripeCustomersTable).values({
    userId: userId,
    stripeCustomerId: customer.id,
  });

  return customer.id;
}
