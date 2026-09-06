import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getUserId() {
  const cookieStore = await cookies();
  const value = cookieStore.get("collegeiq_user")?.value;
  const userId = Number(value);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

export async function GET() {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const saved = await prisma.savedCollege.findMany({
    where: { userId },
    include: { college: { include: { courses: true } } },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(saved.map((item) => item.college));
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  const { collegeId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!Number.isInteger(collegeId)) {
    return NextResponse.json({ error: "A valid college is required." }, { status: 400 });
  }

  const saved = await prisma.savedCollege.upsert({
    where: { userId_collegeId: { userId, collegeId } },
    create: { userId, collegeId },
    update: {},
  });

  return NextResponse.json({ saved: true, id: saved.id }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId();
  const { collegeId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  await prisma.savedCollege.deleteMany({
    where: { userId, collegeId },
  });

  return NextResponse.json({ saved: false });
}
