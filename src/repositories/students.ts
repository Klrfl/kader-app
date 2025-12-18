import { db } from "@/database";
import type { DB } from "@/database/database.types";
import { sql, UpdateResult, type Kysely } from "kysely";
import { AppError } from "@/errors";
import type { InsertableStudent, Student, UpdateableStudent } from "@/types";

type VerboseStudent = Student & {
  image_filename: string | null;
  group_name: string | null;
};

type getVerboseStudentsParams = {
  query?: string | null;
  nim?: string | null;
  groupName?: string | null;
  withTrashed?: boolean;
  showPrinted?: "printed" | "not_printed";
  showBondedOnly?: boolean;
};

interface StudentRepository {
  getVerboseStudent(id: number): Promise<VerboseStudent>;
  getStudents(withTrashed: boolean): Promise<Student[]>;
  getVerboseStudents(
    params: getVerboseStudentsParams
  ): Promise<VerboseStudent[]>;
  createStudent(p: InsertableStudent): Promise<Student>;
  updateStudent(id: number, input: UpdateableStudent): Promise<Student>;
  deleteStudent(id: number, soft?: boolean): Promise<boolean>;
}

class SQLiteStudentRepository implements StudentRepository {
  private db: Kysely<DB>;

  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getVerboseStudent(id: number): Promise<VerboseStudent> {
    const student = await db
      .selectFrom("students as s")
      .leftJoin("images as i", "i.student_id", "s.id")
      .leftJoin("groups as g", "g.id", "s.group_id")
      .where("s.id", "=", Number(id))
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
        eb.fn.coalesce("s.date_of_birth", sql<string>`0`).as("date_of_birth"),
        "s.blood_type",
        "s.address",
        "deleted_at",

        "g.name as group_name",
        "i.filename as image_filename",
      ])
      .executeTakeFirst();

    if (!student) {
      throw new AppError("error when getting student", "STUDENT_SELECT_ERROR");
    }

    return student;
  }

  async getStudents(withTrashed = false): Promise<Student[]> {
    let query = this.db.selectFrom("students").selectAll();

    if (!withTrashed) {
      query = query.where("students.deleted_at", "is", null);
    }

    const students = await query.execute();
    return students;
  }

  async getVerboseStudents({
    query: q,
    nim,
    groupName,
    withTrashed = false,
    showPrinted,
    showBondedOnly,
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
        eb.fn.coalesce("s.date_of_birth", sql<string>`0`).as("date_of_birth"),
        "s.blood_type",
        "s.address",
        "s.deleted_at",

        "i.filename as image_filename",
        "g.name as group_name",
      ])
      .orderBy("s.nim", "asc");

    if (!withTrashed) {
      dbQuery = dbQuery.where("deleted_at", "is", null);
    }

    if (showBondedOnly !== undefined) {
      dbQuery = dbQuery.where("s.has_bonded_with", "=", Number(showBondedOnly));
    }

    if (showPrinted === "printed") {
      dbQuery = dbQuery.where("i.has_been_printed", "=", Number(true));
    } else if (showPrinted === "not_printed") {
      dbQuery = dbQuery.where("i.has_been_printed", "=", Number(false));
    }

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

  async createStudent(input: InsertableStudent): Promise<Student> {
    const parsed_dob = input.date_of_birth
      ? new Date(input.date_of_birth).toISOString()
      : null;

    const results = await db
      .insertInto("students")
      .values({ ...input, date_of_birth: parsed_dob })
      .returningAll()
      .executeTakeFirst();

    if (!results) {
      throw new AppError(
        "Error when inserting new student ",
        "STUDENT_INSERT_ERROR"
      );
    }

    return results;
  }

  async updateStudent(id: number, input: UpdateableStudent): Promise<Student> {
    const student = await db
      .updateTable("students")
      .set({
        name: input.name,
        nickname: input.nickname,
        hobby: input.hobby,
        blood_type: input.blood_type,
        group_id: input.group_id,
        address: input.address,
        instagram_handle: input.instagram_handle,
        place_of_birth: input.place_of_birth,
        date_of_birth: sql`datetime(${input.date_of_birth})`,
        has_bonded_with: Number(input.has_bonded_with),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    if (!student) {
      throw new AppError("error when updating student", "STUDENT_UPDATE_ERROR");
    }

    return student;
  }

  async deleteStudent(id: number, soft = true): Promise<boolean> {
    let query = soft
      ? db
          .updateTable("students")
          .set("deleted_at", new Date().toISOString())
          .where("id", "=", id)
      : db.deleteFrom("students").where("id", "=", id);
    const result = await query.executeTakeFirst();

    let success: boolean;

    if (result instanceof UpdateResult) {
      success = Number(result.numUpdatedRows) === 1;
    } else {
      success = Number(result.numDeletedRows) === 0;
    }

    return success;
  }
}

export function newStudentRepo(): StudentRepository {
  return new SQLiteStudentRepository(db);
}
