export type FavoritePlace = {
  id: string;
  districtRaw: string;
  label: string;
  alias: string;
  coords: { lat: number; lon: number };
  createdAt: number;
};

