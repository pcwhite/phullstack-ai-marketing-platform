"use server";

import { redirect } from "next/navigation";
import { db } from "./db";
import { projectsTable, templatesTable } from "./db/schema";
import { auth } from "@clerk/nextjs/server";

export async function createProject() {
  // Figure out who the current user is
  const { userId } = await auth();
  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }
  // Create a new project in the database
  const [newProject] = await db
    .insert(projectsTable)
    .values({
      title: "New Project",
      userId,
    })
    .returning();

  // Redirect to the new project page detail view
  redirect(`/projects/${newProject.id}`);
}

export async function createTemplate() {
  // Figure out who the current user is
  const { userId } = await auth();
  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }
  // Create a new template in the database
  const [newTemplate] = await db
    .insert(templatesTable)
    .values({
      title: "New Template",
      userId,
    })
    .returning();

  redirect(`/template/${newTemplate.id}`);
}
