import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  description: string;
  website?: string;
  dataSource?: string;
  courses?: string;
};

function parseCsvLine(line: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }

  values.push(value.trim());
  return values;
}

function parseAmount(value: string) {
  return Number(value.replace(/[^0-9.]/g, ""));
}

function parseOptionalNumber(value: string | undefined) {
  if (!value || value === "--") return undefined;
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseCourses(value: string | undefined, numberOfPrograms: string | undefined) {
  if (!value?.trim()) return undefined;

  const names = value.split(/[;,|]/).map((course) => course.trim()).filter(Boolean);
  const fallbackCount = parseOptionalNumber(numberOfPrograms);
  return names.slice(0, fallbackCount || names.length).map((name) => `${name}~Program~`).join("|");
}

function normalizeRating(value: string | undefined) {
  const rating = parseOptionalNumber(value);
  if (rating === undefined) return undefined;
  return Math.round((rating > 5 ? rating / 2 : rating) * 100) / 100;
}

function parseRows(csv: string): CollegeRow[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  if (headers.includes("college_name") && headers.includes("annual_ug_fee_inr")) {
    return lines.slice(1).map((line, lineIndex): CollegeRow | null => {
      const values = parseCsvLine(line);
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
      const name = row.college_name?.trim();
      const state = row.state?.trim();
      const rating = normalizeRating(row.overall_rating || row.student_review_rating || row.collegeiq_score);

      if (!name || !state) {
        console.warn(`Skipping standardized CSV line ${lineIndex + 2}: missing college name or state.`);
        return null;
      }

      const courseNames = parseCourses(row.courses_offered || row.popular_branches, row.number_of_programs);
      const description = row.review_summary?.trim() || `College data record. Verification status: ${row.online_verification_status || "not verified"}.`;
      return {
        name,
        location: row.city?.trim() || row.district?.trim() || state,
        state,
        fees: Math.round(parseOptionalNumber(row.annual_ug_fee_inr) || 0),
        rating: rating || 0,
        placement: parseOptionalNumber(row.average_package_lpa) || 0,
        description,
        website: row.official_website?.trim() || undefined,
        dataSource: "CollegeIQ_Standardized_Colleges.csv",
        courses: courseNames,
      };
    }).filter((row): row is CollegeRow => row !== null);
  }

  if (headers.includes("college_name")) {
    return lines.slice(1).map((line, lineIndex): CollegeRow | null => {
      const values = parseCsvLine(line);
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
      const name = row.college_name?.trim();
      const state = row.state?.trim();
      const rating = parseOptionalNumber(row.Rating);

      if (!name || !state || rating === undefined) {
        console.warn(`Skipping enriched CSV line ${lineIndex + 2}: missing college name, state, or rating.`);
        return null;
      }

      const courseNames = (row.courses || "").split(",").map((course: string) => course.trim()).filter(Boolean);
      return {
        name,
        location: row.city?.trim() || state,
        state,
        fees: parseOptionalNumber(row.ug_fee_inr) || 0,
        pgFees: parseOptionalNumber(row.pg_fee_inr),
        rating: Math.round((rating / 2) * 100) / 100,
        placement: parseOptionalNumber(row.average_package_lpa) || 0,
        academicScore: parseOptionalNumber(row.Academic),
        accommodationScore: parseOptionalNumber(row.Accommodation),
        facultyScore: parseOptionalNumber(row.Faculty),
        infrastructureScore: parseOptionalNumber(row.Infrastructure),
        placementScore: parseOptionalNumber(row.Placement),
        socialLifeScore: parseOptionalNumber(row.Social_Life),
        dataSource: row.existing_dataset_source || "CollegeIQ Enriched Master.csv",
        description: row.college_description?.trim() || `College data record. Verification status: ${row.online_verification_status || "not verified"}.`,
        website: row.official_website?.trim() || undefined,
        courses: courseNames.map((course: string) => `${course}~${row.degree_types || "Program"}~${row.course_duration || ""}`).join("|"),
      };
    }).filter((row): row is CollegeRow => row !== null);
  }

  if (headers.includes("College_Name")) {
    return lines.slice(1).map((line, lineIndex): CollegeRow | null => {
      const values = parseCsvLine(line);
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
      const rating = Number(row.Rating);

      if (!row.College_Name || !row.State || !Number.isFinite(rating)) {
        console.warn(`Skipping engineering CSV line ${lineIndex + 2}: missing college name, state, or rating.`);
        return null;
      }

      return {
        name: row.College_Name.trim(),
        state: row.State.trim(),
        location: row.State.trim(),
        fees: parseAmount(row.UG_fee),
        pgFees: parseAmount(row.PG_fee),
        rating: Math.round((rating / 2) * 100) / 100,
        placement: 0,
        academicScore: Number(row.Academic) || undefined,
        accommodationScore: Number(row.Accommodation) || undefined,
        facultyScore: Number(row.Faculty) || undefined,
        infrastructureScore: Number(row.Infrastructure) || undefined,
        placementScore: Number(row.Placement) || undefined,
        socialLifeScore: Number(row.Social_Life) || undefined,
        dataSource: "Indian Engineering Colleges Dataset",
        description: `Engineering college dataset record. Academic score: ${row.Academic || "not available"}/10; faculty score: ${row.Faculty || "not available"}/10; infrastructure score: ${row.Infrastructure || "not available"}/10; placement score: ${row.Placement || "not available"}/10.`,
        courses: "Engineering~Engineering~4 Years",
      };
    }).filter((row): row is CollegeRow => row !== null);
  }

  const requiredHeaders = ["name", "location", "state", "fees", "rating", "placement", "description"];
  const missing = requiredHeaders.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Missing CSV columns: ${missing.join(", ")}`);

  return lines.slice(1).map((line, lineIndex) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    const parsed = {
      name: row.name,
      location: row.location,
      state: row.state,
      fees: Number(row.fees),
      rating: Number(row.rating),
      placement: Number(row.placement),
      description: row.description,
      website: row.website || undefined,
      courses: row.courses || undefined,
    };

    if (!parsed.name || !parsed.location || !parsed.state || !Number.isFinite(parsed.fees) || !Number.isFinite(parsed.rating) || !Number.isFinite(parsed.placement) || !parsed.description) {
      throw new Error(`Invalid college data on CSV line ${lineIndex + 2}.`);
    }

    return parsed;
  });
}

async function main() {
  const filePath = process.argv[2] || "data/colleges.csv";
  const csv = await readFile(filePath, "utf8");
  const rows = parseRows(csv);
  let imported = 0;

  for (const row of rows) {
    const existing = await prisma.college.findFirst({
      where: { name: row.name, state: row.state },
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
            dataSource: row.dataSource,
            description: row.description,
            website: row.website,
          },
        });

    if (row.courses) {
      const courses = row.courses.split("|").map((course) => {
        const [name, degree = "", duration = ""] = course.split("~").map((part) => part.trim());
        return { name, degree, duration };
      }).filter((course) => course.name);

      await prisma.course.deleteMany({ where: { collegeId: college.id } });
      if (courses.length) await prisma.course.createMany({ data: courses.map((course) => ({ ...course, collegeId: college.id })) });
    }

    imported += 1;
  }

  console.log(`Imported or updated ${imported} colleges from ${filePath}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
