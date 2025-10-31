import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { generatedContentTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";

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
