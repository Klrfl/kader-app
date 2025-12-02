import { newStudentRepo } from "@/repositories/";
import type { InsertableStudent, UpdateableStudent } from "@/types";
import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";

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
  }),
  handler: async (input) => {
    // TODO: handle errors
    let parsed_dob = input.date_of_birth
      ? new Date(input.date_of_birth).toISOString()
      : null;

    const student_data: UpdateableStudent = {
      name: input.name,
      nickname: input.nickname,
      nim: input.nim,
      blood_type: input.blood_type,
      group_id: input.group_id,
      address: input.address,
      date_of_birth: parsed_dob,
      has_bonded_with: Number(input.has_bonded_with),
    };

    const studentRepo = newStudentRepo();
    const student = await studentRepo.updateStudent(input.id, student_data);

    if (!student) {
      throw new ActionError({
        message: "failed to update student",
        code: "INTERNAL_SERVER_ERROR",
      });
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

    const student_data: InsertableStudent = {
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

    const studentRepo = newStudentRepo();
    const results = studentRepo.createStudent(student_data);

    return results;
  },
});

export const studentDelete = defineAction({
  accept: "form",
  input: z.object({ id: z.number().positive() }),
  handler: async ({ id }) => {
    const studentRepo = newStudentRepo();
    const success = studentRepo.deleteStudent(id);

    return { success };
  },
});
