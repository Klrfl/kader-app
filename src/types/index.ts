import type { Students } from "@/database/database.types";
import type { Selectable } from "kysely";

export interface Image {
  created_at: string | null;
  filename: string | null;
  id: number;
  student_id: number;
}

export interface Group {
  id: number;
  name: string;
}

export type Student = Selectable<Students>;
