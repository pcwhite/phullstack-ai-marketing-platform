import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// TODO: Add public and private routes
const isPublicRoute = createRouteMatcher(['/', '/pricing']);

export default clerkMiddleware(async (auth, req) => {
    // if a user is not authenticated and they are trying to
    // access a private route, redirect to Clerk login page
  if (!(await auth()).userId && !isPublicRoute(req)) {
    await (await auth()).redirectToSignIn();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};