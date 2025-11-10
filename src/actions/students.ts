import { db } from "@/database";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const studentUpdate = defineAction({
  accept: "form",
  input: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    group_id: z.number().int().positive(),
    has_bonded_with: z.boolean(),
  }),
  handler: async (input) => {
    const result = await db
      .updateTable("students")
      .set({
        id: input.id,
        name: input.name,
        group_id: input.group_id,
        has_bonded_with: Number(input.has_bonded_with),
      })
      .where("id", "=", input.id)
      .returningAll()
      .execute();

    return result;
  },
});
