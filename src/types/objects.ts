export type ObjectType = "RENT" | "SALE";
export type ObjectCategory =
  | "OFFICE"
  | "RETAIL"
  | "WAREHOUSE"
  | "FREE_PURPOSE"
  | "PRODUCTION";

export interface ObjectListItem {
  id: string;
  type: ObjectType;
  category: ObjectCategory;
  title: string;
  address: string;
  metro: string | null;
  areaTotal: number;
  areaMin: number | null;
  price: number;
  pricePerSqm: number | null;
  photos: string[];
  featured: boolean;
}

export interface ObjectsResponse {
  items: ObjectListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const TYPE_LABELS: Record<ObjectType, string> = {
  RENT: "Аренда",
  SALE: "Продажа",
};

export const CATEGORY_LABELS: Record<ObjectCategory, string> = {
  OFFICE: "Офис",
  RETAIL: "Торговое",
  WAREHOUSE: "Склад",
  FREE_PURPOSE: "Свободное назначение",
  PRODUCTION: "Производство",
};
