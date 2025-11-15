import { db } from "@/database";
import type { DB, Students } from "@/database/database.types";
import { sql, type Kysely } from "kysely";
import type { Selectable } from "kysely";

type VerboseStudent = Selectable<Students> & {
  image_filename: string | null;
  group_name: string | null;
};

type getVerboseStudentsParams = {
  query?: string | null;
  nim?: string | null;
  groupName?: string | null;
};

interface StudentRepository {
  getStudents(): Promise<Selectable<Students>[]>;
  getVerboseStudents(
    params: getVerboseStudentsParams
  ): Promise<VerboseStudent[]>;
}

class SQLiteStudentRepository implements StudentRepository {
  private db: Kysely<DB>;

  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getStudents(): Promise<Selectable<Students>[]> {
    const students = await this.db.selectFrom("students").selectAll().execute();
    return students;
  }

  async getVerboseStudents({
    query: q,
    nim,
    groupName,
  }: getVerboseStudentsParams): Promise<VerboseStudent[]> {
    let dbQuery = this.db
      .selectFrom("students as s")
      .leftJoin("groups as g", "s.group_id", "g.id")
      .leftJoin("images as i", "student_id", "s.id")
      .select((eb) => [
        "s.id",
        "s.group_id",
        "s.nim",
        "s.name",
        "s.nickname",
        "s.instagram_handle",
        "s.has_bonded_with",
        "s.hobby",
        "s.place_of_birth",
        eb.fn.coalesce<string>("s.date_of_birth", sql`0`).as("date_of_birth"),
        "s.blood_type",
        "s.address",
        "i.filename as image_filename",
        "g.name as group_name",
      ])
      .orderBy("s.nim", "asc");
    if (q) {
      dbQuery = dbQuery.where((eb) =>
        eb.or([
          eb("s.name", "like", `%${q}%`),
          eb("s.nickname", "like", `%${q}%`),
        ])
      );
    }

    if (nim) {
      dbQuery = dbQuery.where("s.nim", "like", `%${nim}`);
    }

    if (groupName && groupName !== "") {
      dbQuery = dbQuery.where("g.name", "=", groupName);
    }

    const students = await dbQuery.execute();
    return students;
  }
}

export function newStudentRepo(): StudentRepository {
  return new SQLiteStudentRepository(db);
}
