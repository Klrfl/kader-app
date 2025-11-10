import { db } from "@/database";
import type { DB } from "@/database/database.types";
import type { Group } from "@/types";
import type { Kysely } from "kysely";

interface GroupRepository {
  getGroups(query?: string): Promise<Group[]>;
}

class SQLiteGroupRepository implements GroupRepository {
  db: Kysely<DB>;

  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getGroups(search?: string): Promise<Group[]> {
    let query = this.db.selectFrom("groups").selectAll();

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
