export type DistrictEntry = {
  raw: string;
  label: string;
  searchText: string;
  parts: string[];
};

export function normalizeDistrictText(text: string) {
  return text.replaceAll("-", "").replaceAll(" ", "").toLowerCase();
}

export function toDistrictLabel(raw: string) {
  return raw.replaceAll("-", " ");
}

export function buildDistrictIndex(list: string[]): DistrictEntry[] {
  return list.map((raw) => {
    const parts = raw.split("-").filter(Boolean);
    return {
      raw,
      label: toDistrictLabel(raw),
      searchText: normalizeDistrictText(raw),
      parts,
    };
  });
}

export function searchDistricts(
  index: DistrictEntry[],
  query: string,
  limit = 8,
): DistrictEntry[] {
  const normalizedQuery = normalizeDistrictText(query.trim());
  if (!normalizedQuery) return [];

  const startsWith: DistrictEntry[] = [];
  const includes: DistrictEntry[] = [];

  for (const entry of index) {
    if (entry.searchText.startsWith(normalizedQuery)) {
      startsWith.push(entry);
      continue;
    }
    if (entry.searchText.includes(normalizedQuery)) {
      includes.push(entry);
    }
  }

  return [...startsWith, ...includes].slice(0, limit);
}
