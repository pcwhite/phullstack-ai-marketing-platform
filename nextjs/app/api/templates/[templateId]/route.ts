import { db } from "@/server/db";
import { templatesTable } from "@/server/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  console.log("PATCH request");
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { templateId } = params;

  if (!templateId) {
    return NextResponse.json(
      { error: "Template ID is required" },
      { status: 400 }
    );
  }
  try {
    const { title } = await request.json();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const updatedTemplate = await db
      .update(templatesTable)
      .set({ title })
      .where(
        and(
          eq(templatesTable.id, templateId),
          eq(templatesTable.userId, userId)
        )
      )
      .returning();

    return NextResponse.json(updatedTemplate[0]);
  } catch (error) {
    console.error("Error updating template", error);
    return NextResponse.json(
      { error: "Failed to update template. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { templateId } = params;

  console.log("templateId", templateId);
  if (!templateId) {
    return NextResponse.json(
      { error: "Template ID is required" },
      { status: 400 }
    );
  }

  try {
    const deletedTemplate = await db
      .delete(templatesTable)
      .where(
        and(
          eq(templatesTable.id, templateId),
          eq(templatesTable.userId, userId)
        )
      )
      .returning();

    if (deletedTemplate.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedTemplate[0]);
  } catch (error) {
    console.error("Error deleting template", error);
    return NextResponse.json(
      { error: "Failed to delete template. Please try again." },
      { status: 500 }
    );
  }
}
