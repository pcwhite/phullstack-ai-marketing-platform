"use server";

import { db } from "./db";
import { projectsTable } from "./db/schema";
import { auth } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";

export async function createProject() {
    // Figure out who the current user is
    const { userId } = await auth();
    // Verify the user exists
    if (!userId) {
        throw new Error("User not found");
    }
    // Create a new project in the database
    const newProject = await db.insert(projectsTable).values({
        title: "New Project",
        userId
    })
    .returning();

    // Redirect to the new project page detail view
    // redirect(`/projects/${newProject[0].id}`);
}