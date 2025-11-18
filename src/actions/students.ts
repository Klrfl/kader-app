import { db } from "@/database";
import type { Students } from "@/database/database.types";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { sql, type Insertable } from "kysely";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const studentUpdate = defineAction({
  accept: "form",
  input: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    nickname: z.string().optional(),
    nim: z.string().optional(),
    blood_type: z.string().optional(),
    instagram_handle: z.string().optional(),
    date_of_birth: z.coerce.date().optional(),
    group_id: z.number().int().positive(),
    has_bonded_with: z.boolean(),
    address: z.string().optional(),
    image: z.instanceof(File).optional(),
  }),
  handler: async (input) => {
    // TODO: handle errors
    let parsed_dob = input.date_of_birth
      ? new Date(input.date_of_birth).toISOString()
      : null;

    const result = await db.transaction().execute(async (tx) => {
      const [student] = await tx
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
        .execute();

      if (input.image) {
        const group = await tx
          .selectFrom("groups")
          .select(["name"])
          .where("id", "=", input.group_id)
          .executeTakeFirstOrThrow();

        const wd = path.dirname(fileURLToPath(import.meta.url));
        const imagesBase = path.join(wd, "../../public/images/");

        const buf = Buffer.from(await input.image.arrayBuffer());

        const trimmedNim = student.nim!.slice(student.nim!.length - 3);
        const [_, ext] = input.image.type.split("/");
        const filename = `${group.name}.${trimmedNim}-${input.nickname}.${ext}`;

        const absFilename = path.join(imagesBase, filename);

        await fs.writeFile(absFilename, buf);

        console.log("successfully written file to ", absFilename);

        const imageResult = await tx
          .updateTable("images")
          .set({ filename: filename, student_id: student.id })
          .where("student_id", "=", student.id)
          .execute();
      }

      return student;
    });

    return result;
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
