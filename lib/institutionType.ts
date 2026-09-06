export type InstitutionType = "government" | "private" | "other";

const governmentSignals = [
  "indian institute of technology",
  "national institute of technology",
  "indian institute of information technology",
  "government",
  "govt",
  "university of",
  "central university",
  "state university",
  "anna university",
  "college of engineering",
];

const privateSignals = [
  "private",
  "bits pilani",
  "vellore institute of technology",
  "srm",
  "amity",
  "manipal",
  "lovely professional",
  "chandigarh university",
  "chitkara",
  "ashoka",
  "shiv nadar",
  "bennett",
  "symbiosis",
];

export function getInstitutionType(name: string): InstitutionType {
  const normalized = name.toLowerCase();

  if (privateSignals.some((signal) => normalized.includes(signal))) return "private";
  if (governmentSignals.some((signal) => normalized.includes(signal))) return "government";
  return "other";
}
