import { db } from "@/database";
import type { DB } from "@/database/database.types";
import { AppError } from "@/errors";
import type { Group, GroupImage, InsertableGroup } from "@/types";
import { sql, Kysely } from "kysely";

type VerboseGroup = {
  id: number;
  name: string;
  student_count: number;
  bonded_count: number;
  percentage: number;
  image_filename: string | null;
};

interface GroupRepository {
  getGroup(id: number): Promise<Group>;
  getGroups(query?: string): Promise<Group[]>;
  createGroup(data: InsertableGroup): Promise<Group>;

  /**
   * get groups with image, student count, and bonding stats
   * */
  getVerboseGroups(): Promise<VerboseGroup[]>;
  uploadImage(group_id: number, filename: string): Promise<GroupImage>;
}

class SQLiteGroupRepository implements GroupRepository {
  db: Kysely<DB>;

  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async createGroup(data: InsertableGroup): Promise<Group> {
    const result = await this.db
      .insertInto("groups")
      .values(data)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      throw new AppError(
        "failed when creating new group",
        "GROUP_INSERT_ERROR"
      );
    }

    return result;
  }

  async getVerboseGroups(): Promise<VerboseGroup[]> {
    const query = this.db
      .with("bonded", (qb) =>
        qb
          .selectFrom("groups as g")
          .leftJoin("students as s", "g.id", "s.group_id")
          .select((eb) => [
            "g.id as group_id",
            eb.fn.count("s.id").as("bonded_count"),
          ])
          .where("s.has_bonded_with", "=", Number(true))
          .groupBy("g.id")
      )
      .with("no_bonded", (qb) =>
        qb
          .selectFrom("groups as g")
          .leftJoin("students as s", "g.id", "s.group_id")
          .select((eb) => [
            "g.id as group_id",
            eb.fn.count("s.id").as("total_count"),
          ])
          .groupBy("g.id")
      )
      .selectFrom("groups as g")
      .leftJoin("no_bonded", "g.id", "no_bonded.group_id")
      .leftJoin("bonded", "g.id", "bonded.group_id")
      .leftJoin("group_images as gi", "gi.group_id", "g.id")
      .select(({ fn, lit }) => [
        "g.id",
        "g.name",
        fn.coalesce("bonded.bonded_count", lit(0)).as("bonded_count"),
        fn.coalesce("no_bonded.total_count", lit(0)).as("student_count"),
        sql<number>`coalesce(100 * bonded.bonded_count / no_bonded.total_count, 0)`.as(
          "percentage"
        ),
        "gi.filename as image_filename",
      ])
      .where("g.name", "not like", "None")
      .orderBy("g.name", "asc");

    const results = await query.execute();
    return results as VerboseGroup[];
  }

  async getGroup(id: number): Promise<Group> {
    const result = await this.db
      .selectFrom("groups")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirstOrThrow();

    if (!result) {
      throw new AppError("error when getting group", "GROUP_SELECT_ERROR");
    }

    return result;
  }

  async getGroups(search?: string): Promise<Group[]> {
    let query = this.db
      .selectFrom("groups")
      .selectAll()
      .orderBy("groups.name", "asc");

    if (search) {
      query = query.where("name", "like", search);
    }

    const groups = await query.execute();
    return groups;
  }

  async uploadImage(group_id: number, filename: string): Promise<GroupImage> {
    const groupImage = await this.db
      .insertInto("group_images")
      .values({ group_id: group_id, filename: filename })
      .onConflict((oc) =>
        oc.doUpdateSet({ group_id: group_id, filename: filename })
      )
      .returningAll()
      .executeTakeFirst();

    if (!groupImage) {
      throw new AppError(
        "failed when uploading group image",
        "GROUP_IMAGE_UPSERT_ERROR"
      );
    }

    return groupImage;
  }
}

export function newGroupRepo(): GroupRepository {
  return new SQLiteGroupRepository(db);
}
