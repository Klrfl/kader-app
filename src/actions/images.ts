import { newImageRepo, newStudentRepo } from "@/repositories";
import { newStorage } from "@/services/storage";
import type { UpdateableImage } from "@/types";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const uploadStudentImage = defineAction({
  accept: "form",
  input: z.object({
    image: z.instanceof(File).optional(),
    student_id: z.coerce.number(),
    has_been_printed: z.coerce.boolean().default(false),
  }),

  handler: async (input) => {
    const imageRepo = newImageRepo();

    const { result: existingImage, error } = await imageRepo.getImage(
      input.student_id
    );
    if (error) {
      console.log("no existing image found");
    }

    const newImageData: UpdateableImage = {
      has_been_printed: Number(input.has_been_printed),
    };

    if (input.image && input.image.size > 0) {
      const studentRepo = newStudentRepo();
      const student = await studentRepo.getVerboseStudent(input.student_id);

      const trimmedNim = student.nim
        ? student.nim.slice(student.nim!.length - 3)
        : "xxx";

      const [_, ext] = input.image.type.split("/");
      const filename =
        `${student.group_name?.trim()}.${trimmedNim}-${student.nickname?.trim()}.${ext}`.toLowerCase();

      newImageData.filename = encodeURIComponent(filename);

      const storage = newStorage("local");
      if (existingImage !== null) {
        storage.delete(existingImage.filename!); // TODO: handle error when deleting
      }

      storage.upload(input.image, filename);

      const { error } = await imageRepo.uploadStudentImage(
        student.id,
        filename
      );

      if (error) throw error;
    }

    const { result, error: updateError } = await imageRepo.updateImage(
      input.student_id,
      newImageData
    );

    // TODO: proper error handling
    if (updateError) throw updateError;

    return result;
  },
});

export const deleteStudentImage = defineAction({
  accept: "form",
  input: z.object({
    student_id: z.number().positive(),
  }),
  handler: async ({ student_id }) => {
    const imageRepo = newImageRepo();
    const { result, error } = await imageRepo.deleteImage(student_id);

    if (error) throw error;

    const storage = newStorage("local");
    storage.delete(result?.filename!);

    return { success: true };
  },
});
