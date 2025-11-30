import { db } from "@/database";
import type { DB } from "@/database/database.types";
import { sql, type Kysely, type Updateable } from "kysely";
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
};

interface StudentRepository {
  getStudents(): Promise<Student[]>;
  getVerboseStudents(
    params: getVerboseStudentsParams
  ): Promise<VerboseStudent[]>;
  createStudent(p: InsertableStudent): Promise<Student>;
  updateStudent(id: number, input: UpdateableStudent): Promise<Student>;
  deleteStudent(id: number): Promise<boolean>;
}

class SQLiteStudentRepository implements StudentRepository {
  private db: Kysely<DB>;

  constructor(db: Kysely<DB>) {
    this.db = db;
  }
  async getStudents(): Promise<Student[]> {
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
        eb.fn.coalesce("s.date_of_birth", sql<string>`0`).as("date_of_birth"),
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
        nim: input.nim,
        blood_type: input.blood_type,
        group_id: input.group_id,
        address: input.address,
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

  async deleteStudent(id: number): Promise<boolean> {
    const result = await db
      .deleteFrom("students")
      .where("id", "=", id)
      .executeTakeFirst();

    const success = Number(result.numDeletedRows) === 0;
    return success;
  }
}

export function newStudentRepo(): StudentRepository {
  return new SQLiteStudentRepository(db);
}
