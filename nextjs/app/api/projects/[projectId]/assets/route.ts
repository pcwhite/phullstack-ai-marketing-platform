import { db } from "@/server/db";
import { assetTable } from "@/server/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";

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

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const assetId = searchParams.get("assetId");

  if (!assetId) {
    return NextResponse.json(
      { error: "Asset ID is required" },
      { status: 400 }
    );
  }

  // Auth check
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete the asset
    const deletedAsset = await db
      .delete(assetTable)
      .where(eq(assetTable.id, assetId))
      .returning();

    if (deletedAsset.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    await del(deletedAsset[0].fileUrl);

    return NextResponse.json(
      { message: "Asset deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting asset", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
