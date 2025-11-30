import { db } from "@/database";
import type { Students } from "@/database/database.types";
import { newImageRepo } from "@/repositories/images";
import { ActionError } from "astro/actions/runtime/shared.js";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { sql, type Insertable } from "kysely";

export const studentUpdate = defineAction({
  accept: "form",
  input: z.object({
    // hidden fields
    id: z.number().int().positive(),
    redirectTo: z.string().nullable().optional(),

    name: z.string().trim(),
    nickname: z.string().trim().optional(),
    nim: z.string().optional(),
    blood_type: z.string().optional(),
    instagram_handle: z.string().trim().optional(),
    date_of_birth: z.coerce.date().optional(),
    group_id: z.number().int().positive(),
    has_bonded_with: z.boolean(),
    address: z.string().optional(),
    image: z.instanceof(File).optional().nullable(),
  }),
  handler: async (input) => {
    // TODO: handle errors
    let parsed_dob = input.date_of_birth
      ? new Date(input.date_of_birth).toISOString()
      : null;

    const student = await db
      .updateTable("students")
      .set({
        id: input.id,
        name: input.name,
        nickname: input.nickname,
        nim: input.nim,
        blood_type: input.blood_type,
        group_id: input.group_id,
        address: input.address,
        date_of_birth: sql`datetime(${parsed_dob})`,
        has_bonded_with: Number(input.has_bonded_with),
      })
      .where("id", "=", input.id)
      .returningAll()
      .executeTakeFirst();

    if (!student) {
      throw new ActionError({
        message: "failed to update student",
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    if (input.image && input.image.size > 0) {
      const group = await db
        .selectFrom("groups")
        .select(["name"])
        .where("id", "=", input.group_id)
        .executeTakeFirstOrThrow();

      const trimmedNim = student.nim!.slice(student.nim!.length - 3);
      const [_, ext] = input.image.type.split("/");
      const filename = `${group.name}.${trimmedNim}-${input.nickname}.${ext}`;

      const imageRepo = newImageRepo();
      const { error } = await imageRepo.uploadStudentImage(
        input.image,
        filename.toLowerCase(),
        student.id
      );

      if (error) throw error;
    }

    return { redirectTo: input.redirectTo };
  },
});

export const studentCreate = defineAction({
  accept: "form",
  input: z.object({
    name: z.string(),
    nickname: z.string().optional(),
    nim: z.string().optional(),
    blood_type: z.string().optional(),
    instagram_handle: z.string().optional(),
    hobby: z.string().optional(),
    date_of_birth: z.coerce.date().optional(),
    place_of_birth: z.string().optional(),
    address: z.string().optional(),
    group_id: z.number().int().positive(),
    image: z.instanceof(File).optional(),
  }),
  handler: async (input) => {
    const parsed_dob = input.date_of_birth
      ? new Date(input.date_of_birth).toISOString()
      : null;

    // TODO: abstract this type
    const student_data: Insertable<Students> = {
      name: input.name,
      nickname: input.nickname,
      nim: input.nim,
      group_id: input.group_id,
      blood_type: input.blood_type,
      address: input.address,
      hobby: input.hobby,
      date_of_birth: parsed_dob,
      place_of_birth: input.place_of_birth,
    };

    const results = await db
      .insertInto("students")
      .values(student_data)
      .returningAll()
      .executeTakeFirst();

    console.log(results);
  },
});

export const studentDelete = defineAction({
  accept: "form",
  input: z.object({ id: z.number().positive() }),
  handler: async ({ id }) => {
    const result = await db
      .deleteFrom("students")
      .where("id", "=", id)
      .executeTakeFirst();
    const success = Number(result.numDeletedRows) === 0;

    return { success };
  },
});
