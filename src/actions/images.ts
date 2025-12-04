import { newImageRepo, newStudentRepo } from "@/repositories";
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

      const { error } = await imageRepo.uploadStudentImage(
        input.image,
        filename,
        student.id
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
