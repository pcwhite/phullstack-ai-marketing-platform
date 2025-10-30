import { db } from "@/server/db";
import { promptsTable, templatePromptsTable } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { projectId } = params;
  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }
  try {
    const { templateId } = await request.json();
    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Fetch the template prompts
    const templatePrompts = await db
      .select()
      .from(templatePromptsTable)
      .where(eq(templatePromptsTable.templateId, templateId))
      .orderBy(templatePromptsTable.order);

    // Fetch the existing project prompts
    const existingPrompts = await db
      .select()
      .from(promptsTable)
      .where(eq(promptsTable.projectId, projectId));

    const startOrder = existingPrompts.length;

    const newProjectPrompts = await db
      .insert(promptsTable)
      .values(
        templatePrompts.map((templatePrompt, index) => ({
          projectId,
          name: templatePrompt.name,
          prompt: templatePrompt.prompt,
          order: startOrder + index,
        }))
      )
      .returning();
    return NextResponse.json(newProjectPrompts);
  } catch (error) {
    console.error("Error importing template: ", error);
    return NextResponse.json(
      { error: "Failed to import template" },
      { status: 500 }
    );
  }
}
