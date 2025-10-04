import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// TODO: Add public and private routes
const isPublicRoute = createRouteMatcher(["/", "/pricing", "/api/upload"]);

export default clerkMiddleware(async (auth, request) => {
  // if a user is not authenticated and they are trying to
  // access a private route, redirect to Clerk login page
  const { userId, redirectToSignIn } = await auth();
  if (!userId && !isPublicRoute(request)) {
    return redirectToSignIn();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
