export function getCollegeLocation(location?: string | null, state?: string | null): string {
  if (location && location !== "Not specified" && location !== state) return state ? `${location}, ${state}` : location;
  return state || location || "Not available";
}

export function formatCurrency(value?: number | null): string {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? `₹${new Intl.NumberFormat("en-IN").format(value)}`
    : "Not available";
}

export function formatRating(value?: number | null): string {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value.toFixed(1) : "No rating";
}

export function getPlacementLabel(placement?: number | null): string {
  return typeof placement === "number" && Number.isFinite(placement) && placement > 0 ? `${placement} LPA` : "Not available";
}

export function getDegreeLabel(degree?: string | null): string {
  if (!degree?.trim()) return "Not available";
  return degree.trim().toLowerCase() === "engineering" ? "B.Tech" : degree.trim();
}

export function getCollegeSearchUrl(name: string, state: string): string {
  const query = encodeURIComponent(`${name} ${state} official website placement reviews`);
  return `https://www.google.com/search?q=${query}`;
}