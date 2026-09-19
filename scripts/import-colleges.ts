import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CourseSeed = {
  name: string;
  degree: string;
  duration: string;
};

type CollegeRow = {
  name: string;
  location: string;
  state: string;
  fees: number;
  pgFees?: number;
  rating: number;
  placement: number;
  academicScore?: number;
  accommodationScore?: number;
  facultyScore?: number;
  infrastructureScore?: number;
  placementScore?: number;
  socialLifeScore?: number;
  nirfRank?: number;
  nirfScore?: number;
  description: string;
  website?: string;
  dataSource: string;
  courses: CourseSeed[];
};

type ImportStats = {
  filesProcessed: number;
  rowsScanned: number;
  validRows: number;
  skippedRows: number;
  duplicatesMerged: number;
  uniqueColleges: number;
};

function normalizeText(value: string | undefined) {
  return value ? value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim() : "";
}

function normalizeHeader(value: string | undefined) {
  return normalizeText(value).toLowerCase();
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current.trim());
  return values;
}

function parseNumber(value: string | undefined) {
  if (!value) return undefined;
  const cleaned = normalizeText(String(value)).replace(/[^0-9.\-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseInteger(value: string | undefined) {
  const parsed = parseNumber(value);
  if (parsed === undefined) return undefined;
  return Number.isInteger(parsed) ? parsed : Math.round(parsed);
}

function parseAmount(value: string | undefined) {
  const parsed = parseNumber(value);
  return parsed === undefined ? 0 : Math.round(parsed);
}

function normalizeRating(value: string | undefined) {
  const parsed = parseNumber(value);
  if (parsed === undefined) return undefined;
  const normalized = parsed > 5 ? parsed / 2 : parsed;
  return Math.round(normalized * 100) / 100;
}

function titleCase(value: string | undefined) {
  const text = normalizeText(value);
  if (!text) return "";
  return text.toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
}

function getField(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = row[normalizeHeader(key)];
    if (typeof value === "string") {
      const trimmed = normalizeText(value);
      if (trimmed) return trimmed;
    }
  }
  return "";
}

function canonicalizeCollegeKey(name: string, state: string, website?: string) {
  const rawName = normalizeText(name).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const rawState = normalizeText(state).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const rawWebsite = normalizeText(website).toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `${rawName}|${rawState}|${rawWebsite}`;
}

function mergeUniqueCourses(courses: CourseSeed[] = []) {
  const merged = new Map<string, CourseSeed>();

  for (const course of courses) {
    const key = `${course.name}|${course.degree}|${course.duration}`.toLowerCase();
    if (!course.name) continue;
    if (!merged.has(key)) {
      merged.set(key, {
        name: normalizeText(course.name),
        degree: normalizeText(course.degree) || "Program",
        duration: normalizeText(course.duration) || "4 Years",
      });
    }
  }

  return [...merged.values()];
}

function parseCourses(rawValue: string | undefined, fallbackDegree = "Program", fallbackDuration = "4 Years") {
  if (!rawValue) return [];

  return rawValue
    .split(/[;|,]/)
    .map((piece) => piece.trim())
    .filter(Boolean)
    .slice(0, 20)
    .flatMap((piece) => {
      const [name, degree = fallbackDegree, duration = fallbackDuration] = piece.split("~").map((part) => part.trim());
      const cleanedName = normalizeText(name);
      if (!cleanedName) return [];
      return [{
        name: cleanedName,
        degree: normalizeText(degree) || fallbackDegree,
        duration: normalizeText(duration) || fallbackDuration,
      }];
    });
}

function mergeCollegeRows(existing: CollegeRow, candidate: CollegeRow): CollegeRow {
  const merged: CollegeRow = { ...existing };

  merged.name = normalizeText(merged.name) || normalizeText(candidate.name);
  merged.location = normalizeText(merged.location) || normalizeText(candidate.location) || merged.state || candidate.state || "Unknown";
  merged.state = normalizeText(merged.state) || normalizeText(candidate.state) || "Unknown";
  merged.rating = merged.rating > 0 ? ((merged.rating > candidate.rating) ? merged.rating : candidate.rating) : candidate.rating;
  merged.fees = merged.fees > 0 ? merged.fees : candidate.fees;
  merged.pgFees = merged.pgFees && merged.pgFees > 0 ? merged.pgFees : candidate.pgFees ?? merged.pgFees;
  merged.placement = merged.placement > candidate.placement ? merged.placement : candidate.placement;
  merged.academicScore = merged.academicScore ?? candidate.academicScore;
  merged.accommodationScore = merged.accommodationScore ?? candidate.accommodationScore;
  merged.facultyScore = merged.facultyScore ?? candidate.facultyScore;
  merged.infrastructureScore = merged.infrastructureScore ?? candidate.infrastructureScore;
  merged.placementScore = merged.placementScore ?? candidate.placementScore;
  merged.socialLifeScore = merged.socialLifeScore ?? candidate.socialLifeScore;
  merged.nirfRank = merged.nirfRank && merged.nirfRank > 0 ? Math.min(merged.nirfRank, candidate.nirfRank ?? merged.nirfRank) : candidate.nirfRank ?? merged.nirfRank;
  merged.nirfScore = merged.nirfScore && merged.nirfScore > 0 ? Math.max(merged.nirfScore, candidate.nirfScore ?? merged.nirfScore) : candidate.nirfScore ?? merged.nirfScore;
  merged.description = merged.description && merged.description.length > candidate.description.length ? merged.description : candidate.description || merged.description;
  merged.website = normalizeText(merged.website) || normalizeText(candidate.website) || undefined;
  merged.courses = mergeUniqueCourses([...merged.courses, ...candidate.courses]);
  merged.dataSource = Array.from(new Set([merged.dataSource, candidate.dataSource].filter(Boolean))).join(" | ");
  return merged;
}

function compileCollegeRowFromRecord(record: Record<string, string>, source: string): CollegeRow | null {
  const rawName = getField(record, ["college_name", "college name", "college", "college_name ", "College_Name", "College Name"]);
  const rawState = getField(record, ["state", "State"]);
  const rawLocation = getField(record, ["city", "district", "location"]);
  const rawRating = getField(record, ["rating", "Rating", "collegeiq_score", "review_score_5", "overall_rating"]);
  const rawFees = getField(record, ["ug_fee_inr", "annual_ug_fee_inr", "UG_fee", "ug_fee", "fees"]);
  const rawPgFees = getField(record, ["pg_fee_inr", "PG_fee", "pg_fee"]);

  const name = normalizeText(rawName);
  const state = titleCase(rawState) || "Unknown";
  const location = titleCase(rawLocation) || state;

  if (!name) {
    return null;
  }

  const rating = normalizeRating(rawRating);
  if (rating === undefined && !rawRating && !(source.toLowerCase().includes("nirf"))) {
    return null;
  }

  const row: CollegeRow = {
    name,
    location,
    state,
    fees: parseAmount(rawFees),
    pgFees: parseNumber(rawPgFees) ? Math.round(parseNumber(rawPgFees)!) : undefined,
    rating: rating ?? 0,
    placement: parseAmount(getField(record, ["average_package_lpa", "average_package", "placement_lpa", "Placement", "placement"])) || 0,
    academicScore: parseNumber(getField(record, ["academic", "Academic", "academic_score"])),
    accommodationScore: parseNumber(getField(record, ["accommodation", "Accommodation", "accommodation_score"])),
    facultyScore: parseNumber(getField(record, ["faculty", "Faculty", "faculty_score"])),
    infrastructureScore: parseNumber(getField(record, ["infrastructure", "Infrastructure", "infrastructure_score"])),
    placementScore: parseNumber(getField(record, ["placement_score", "Placement", "placement"])),
    socialLifeScore: parseNumber(getField(record, ["social_life", "social life", "Social_Life", "social_life_score"])),
    nirfRank: parseInteger(getField(record, ["nirf_2025_rank", "rank", "Rank"])),
    nirfScore: parseNumber(getField(record, ["nirf_2025_ss", "ss", "SS"])),
    description: normalizeText(getField(record, ["college_description", "review_summary", "description", "pros"])) || `College data imported from ${source}.`,
    website: normalizeText(getField(record, ["official_website", "website", "official website"])) || undefined,
    dataSource: source,
    courses: parseCourses(getField(record, ["courses", "courses_offered", "popular_branches", "branch_name", "branch"]), getField(record, ["degree_types", "degree", "degree type"]) || "Program", getField(record, ["course_duration", "duration"]) || "4 Years"),
  };

  if (source.toLowerCase().includes("nirf")) {
    row.description = row.description || `NIRF ranked college imported from ${source}.`;
    row.location = row.location || "Unknown";
    row.state = row.state || "Unknown";
  }

  return row;
}

function parseCsvFile(csv: string, source: string): CollegeRow[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const rows: CollegeRow[] = [];

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    const record: Record<string, string> = {};

    headers.forEach((header, index) => {
      const key = normalizeHeader(header);
      if (!key) return;
      const value = values[index] ?? "";
      if (!record[key]) {
        record[key] = value;
      }
    });

    const row = compileCollegeRowFromRecord(record, source);
    if (row) {
      rows.push(row);
    }
  }

  return rows;
}

async function resolveImportSources(explicitPath?: string) {
  if (explicitPath) {
    const fullPath = path.resolve(process.cwd(), explicitPath);
    const resolved = (await readdir(path.dirname(fullPath))).includes(path.basename(fullPath)) ? fullPath : null;
    if (resolved) return [resolved];
    return [fullPath];
  }

  const dataDirectory = path.resolve(process.cwd(), "data");
  const entries = await readdir(dataDirectory, { withFileTypes: true });
  const csvFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".csv"))
    .map((entry) => path.join(dataDirectory, entry.name))
    .sort();

  if (!csvFiles.length) {
    throw new Error("No CSV datasets were found inside the data folder. Add at least one real college dataset before running import:colleges.");
  }

  return csvFiles;
}

async function main() {
  const sourceFiles = await resolveImportSources(process.argv[2]);
  const merged = new Map<string, CollegeRow>();
  const stats: ImportStats = {
    filesProcessed: 0,
    rowsScanned: 0,
    validRows: 0,
    skippedRows: 0,
    duplicatesMerged: 0,
    uniqueColleges: 0,
  };

  for (const filePath of sourceFiles) {
    const fileName = path.basename(filePath);
    const csv = await readFile(filePath, "utf8");
    const rows = parseCsvFile(csv, fileName);
    stats.filesProcessed += 1;
    stats.rowsScanned += rows.length;

    for (const row of rows) {
      const key = canonicalizeCollegeKey(row.name, row.state, row.website);
      const existing = merged.get(key);
      if (existing) {
        merged.set(key, mergeCollegeRows(existing, row));
        stats.duplicatesMerged += 1;
      } else {
        merged.set(key, row);
      }
      stats.validRows += 1;
    }
  }

  stats.uniqueColleges = merged.size;

  for (const [key, row] of merged) {
    const existing = await prisma.college.findFirst({
      where: {
        OR: [
          { name: row.name, state: row.state },
          ...(row.website ? [{ website: row.website }] : []),
        ],
      },
      select: { id: true },
    });

    const college = existing
      ? await prisma.college.update({
          where: { id: existing.id },
          data: {
            name: row.name,
            location: row.location,
            state: row.state,
            fees: row.fees,
            pgFees: row.pgFees,
            rating: row.rating,
            placement: row.placement,
            academicScore: row.academicScore,
            accommodationScore: row.accommodationScore,
            facultyScore: row.facultyScore,
            infrastructureScore: row.infrastructureScore,
            placementScore: row.placementScore,
            socialLifeScore: row.socialLifeScore,
            nirfRank: row.nirfRank,
            nirfScore: row.nirfScore,
            dataSource: row.dataSource,
            description: row.description,
            website: row.website,
          },
        })
      : await prisma.college.create({
          data: {
            name: row.name,
            location: row.location,
            state: row.state,
            fees: row.fees,
            pgFees: row.pgFees,
            rating: row.rating,
            placement: row.placement,
            academicScore: row.academicScore,
            accommodationScore: row.accommodationScore,
            facultyScore: row.facultyScore,
            infrastructureScore: row.infrastructureScore,
            placementScore: row.placementScore,
            socialLifeScore: row.socialLifeScore,
            nirfRank: row.nirfRank,
            nirfScore: row.nirfScore,
            dataSource: row.dataSource,
            description: row.description,
            website: row.website,
          },
        });

    await prisma.course.deleteMany({
      where: { collegeId: college.id },
    });

    if (row.courses.length) {
      await prisma.course.createMany({
        data: row.courses.map((course) => ({
          name: course.name,
          degree: course.degree,
          duration: course.duration,
          collegeId: college.id,
        })),
      });
    }
  }

  console.log(JSON.stringify({
    filesProcessed: stats.filesProcessed,
    rowsScanned: stats.rowsScanned,
    validRows: stats.validRows,
    duplicatesMerged: stats.duplicatesMerged,
    uniqueColleges: stats.uniqueColleges,
    skippedRows: stats.skippedRows,
    sources: sourceFiles.map((file) => path.basename(file)),
  }, null, 2));

  console.log(`Imported and merged ${stats.uniqueColleges} unique colleges into MongoDB.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
