import type { Images, Students } from "@/database/database.types";
import type { Selectable } from "kysely";

export type Image = Selectable<Images>;

export interface Group {
  id: number;
  name: string;
}

export type Student = Selectable<Students>;
