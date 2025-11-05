import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { generatedContentTable, projectsTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import z from "zod";

export const maxDuration = 60; // seconds

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }
  try {
    const generatedContent = await db
      .select()
      .from(generatedContentTable)
      .where(eq(generatedContentTable.projectId, projectId))
      .orderBy(generatedContentTable.order);
    return NextResponse.json(generatedContent);
  } catch (error) {
    console.error("Error fetching generated content", error);
    return NextResponse.json(
      { error: "Failed to fetch generated content" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }
  try {
    const project = await db.query.projectsTable.findFirst({
      where: eq(projectsTable.id, projectId),
      with: {
        assets: true,
        prompts: true,
      },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const { assets, prompts } = project;

    const contentFromAssets = assets.map((asset) => asset.content).join("\n\n");

    const models = ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"];

    const generatedContentPromises = prompts.map(async (prompt) => {
      let text = "";
      let success = false;

      for (const model of models) {
        try {
          const response = await generateText({
            model: openai(model),
            system: `You are a helpful assistant that generates content for a project. The project has the following assets: ${contentFromAssets}. The project has the following prompts: ${prompt.prompt}.`,
            prompt: `
            Use the following prompt abd content from the assets to generate new content
            ** PROMPT:
            ${prompt.prompt}

            --------------------------------
            ** SUMMARY:
            ${contentFromAssets}

            `,
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
          });
          text = response.text;
          success = true;
          console.log(`Generated content with model ${model} successfully`);
          break;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error(
            `Error generating content with model ${model}: ${error}`
          );

          // Check if retrying will help
          if (
            error.statusCode === 429 ||
            error.statusCode === 503 ||
            error.message.includes("overloaded")
          ) {
            continue;
          } else {
            throw error;
          }
        }
      }
      if (!success) {
        throw new Error(
          `Failed to generate content with any model for prompt ${prompt.name}`
        );
      }

      const insertedContent = await db
        .insert(generatedContentTable)
        .values({
          projectId,
          name: prompt.name,
          result: text,
          order: prompt.order,
        })
        .returning();

      return insertedContent;
    });

    const insertedContentList = await Promise.all(generatedContentPromises);

    return NextResponse.json(insertedContentList, { status: 201 });
  } catch (error) {
    console.error("Error generating content", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(generatedContentTable)
        .where(eq(generatedContentTable.projectId, projectId));
    });

    return NextResponse.json(
      { message: "Generated content deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting generated content", error);
    return NextResponse.json(
      { error: "Failed to delete generated content" },
      { status: 500 }
    );
  }
}

const updateGeneratedContentSchema = z.object({
  id: z.string().uuid(),
  result: z.string().min(1, "Result is required"),
});

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const parsedResults = updateGeneratedContentSchema.safeParse(body);
  if (!parsedResults.success) {
    return NextResponse.json(
      { error: parsedResults.error.issues },
      { status: 400 }
    );
  }
  try {
    const { id, result } = parsedResults.data;
    const updatedContent = await db
      .update(generatedContentTable)
      .set({ result })
      .where(eq(generatedContentTable.id, id))
      .returning();
    if (updatedContent.length === 0) {
      return NextResponse.json(
        { error: "Generated content not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(updatedContent[0]);
  } catch (error) {
    console.error("Error updating generated content", error);
    return NextResponse.json(
      { error: "Failed to update generated content" },
      { status: 500 }
    );
  }
}
