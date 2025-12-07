import type {
  Images,
  Students,
  Groups,
  GroupImages,
} from "@/database/database.types";
import type { Updateable } from "kysely";
import type { Insertable } from "kysely";
import type { Selectable } from "kysely";

export type Image = Selectable<Images>;
export type UpdateableImage = Updateable<Images>;

export interface Group {
  id: number;
  name: string;
}

export type Student = Selectable<Students>;
export type InsertableStudent = Insertable<Students>;
export type UpdateableStudent = Updateable<Students>;

export type InsertableGroup = Insertable<Groups>;

export type GroupImage = Selectable<GroupImages>;
