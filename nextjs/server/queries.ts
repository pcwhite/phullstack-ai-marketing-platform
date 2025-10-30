"server-only";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { projectsTable, Project, Template, templatesTable } from "./db/schema";
import { eq } from "drizzle-orm";

export async function getProjectsForUser(): Promise<Project[]> {
  // Figure out who the current user is
  const { userId } = await auth();
  console.log("userId: ", userId);
  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }

  // Fetch projects from the database
  const projects = db.query.projectsTable.findMany({
    where: eq(projectsTable.userId, userId),
    orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
  });

  return await projects;
}

export async function getProject(projectId: string) {
  // Figure out who the current user is
  const { userId } = await auth();
  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }

  const project = await db.query.projectsTable.findFirst({
    where: (project, { eq, and }) =>
      and(eq(project.id, projectId), eq(project.userId, userId)),
  });

  return project;
}

export async function getTemplatesForUser(): Promise<Template[]> {
  // Figure out who the current user is
  const { userId } = await auth();
  console.log("userId: ", userId);
  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }

  // Fetch templates from database
  const projects = await db.query.templatesTable.findMany({
    where: eq(templatesTable.userId, userId),
    orderBy: (templates, { desc }) => [desc(templates.updatedAt)],
  });

  return projects;
}

export async function getTemplate(id: string): Promise<Template | undefined> {
  // Figure out who the current user is
  const { userId } = await auth();
  // Verify the user exists
  if (!userId) {
    return undefined;
  }
  // Fetch the template from the database
  const template = await db.query.templatesTable.findFirst({
    where: (template, { eq, and }) =>
      and(eq(template.id, id), eq(template.userId, userId)),
  });
  if (!template) {
    return undefined;
  }
  return template;
}
