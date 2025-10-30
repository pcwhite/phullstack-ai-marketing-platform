import { templatesTable } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const templates = await db
      .select()
      .from(templatesTable)
      .where(eq(templatesTable.userId, userId))
      .orderBy(templatesTable.updatedAt);
    if (!templates) {
      return NextResponse.json(
        { error: "No templates found" },
        { status: 404 }
      );
    }
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates: ", error);
    return NextResponse.json(
      { error: "Failed to fetch templates. Please try again." },
      { status: 500 }
    );
  }
}
