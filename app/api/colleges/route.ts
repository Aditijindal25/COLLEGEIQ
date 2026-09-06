import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        courses: true,
        reviews: true,
      },
      orderBy: {
        rating: "desc",
      },
    });

    return NextResponse.json(colleges);
  }  catch (error) {
  console.error("Failed to fetch colleges:", error);

  return NextResponse.json(
    {
      error: "Failed to fetch colleges",
      details: error instanceof Error ? error.message : String(error),
    },
    { status: 500 }
  );
  }
}
