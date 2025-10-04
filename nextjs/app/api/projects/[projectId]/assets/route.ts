import { db } from "@/server/db";
import { assetTable } from "@/server/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;

  // Auth check
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const assets = await db
      .select()
      .from(assetTable)
      .where(eq(assetTable.projectId, projectId))
      .execute();

    return NextResponse.json(assets);
  } catch (error) {
    console.error("Error fetching assets", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}
