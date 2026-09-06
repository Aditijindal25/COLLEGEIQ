import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const cookie = cookieStore.get("collegeiq_user");

    if (!cookie?.value) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    const userId = Number(cookie.value);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return NextResponse.json(
      {
        user: null,
        error: "Unable to get current user.",
      },
      { status: 500 }
    );
  }
}