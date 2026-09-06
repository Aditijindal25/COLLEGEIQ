import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type Ranking = {
  name: string;
  rank: number;
  score: number | null;
};

function parseCsvLine(line: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (const character of line) {
    if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else value += character;
  }

  values.push(value.trim());
  return values;
}

export async function GET() {
  try {
    const file = await readFile(path.join(process.cwd(), "data", "NIRF_2025_Scores_with_Rank.csv"), "utf8");
    const lines = file.split(/\r?\n/).filter(Boolean);
    const headers = parseCsvLine(lines[0]);
    const nameIndex = headers.indexOf("College Name");
    const rankIndex = headers.indexOf("Rank");
    const scoreIndex = headers.indexOf("Overall Weighted Index (Out Of 1000)");

    const rankings: Ranking[] = lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      const rank = Number(values[rankIndex]);
      const score = scoreIndex >= 0 ? Number(values[scoreIndex]) : null;
      return {
        name: values[nameIndex],
        rank,
        score: Number.isFinite(score) ? score : null,
      };
    }).filter((item) => item.name && Number.isFinite(item.rank));

    return NextResponse.json({ year: 2025, source: "NIRF", rankings });
  } catch (error) {
    console.error("Failed to load rankings:", error);
    return NextResponse.json({ error: "Ranking data is temporarily unavailable." }, { status: 500 });
  }
}
