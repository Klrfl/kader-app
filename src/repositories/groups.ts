import { db } from "@/database";
import type { DB } from "@/database/database.types";
import type { Group } from "@/types";
import type { Kysely } from "kysely";
import { sql } from "kysely";

type VerboseGroup = {
  id: number;
  name: string;
  student_count: number;
  bonded_count: number;
  percentage: number;
};

interface GroupRepository {
  getGroups(query?: string): Promise<Group[]>;

  /**
   * get groups with student count and bonding stats
   * */
  getVerboseGroups(): Promise<VerboseGroup[]>;
}

class SQLiteGroupRepository implements GroupRepository {
  db: Kysely<DB>;

  constructor(db: Kysely<DB>) {
    this.db = db;
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
      .selectFrom("bonded")
      .leftJoin("no_bonded", "no_bonded.group_id", "bonded.group_id")
      .rightJoin("groups as g", "g.id", "bonded.group_id")
      .select(({ fn, lit }) => [
        "g.id",
        "g.name",
        fn.coalesce("bonded.bonded_count", lit(0)).as("bonded_count"),
        fn.coalesce("no_bonded.total_count", lit(0)).as("student_count"),
        sql<number>`coalesce(100 * bonded.bonded_count / no_bonded.total_count, 0)`.as(
          "percentage"
        ),
      ]);

    const results = await query.execute();
    return results as VerboseGroup[];
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
}

export function newGroupRepo(): GroupRepository {
  return new SQLiteGroupRepository(db);
}
