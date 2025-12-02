import { newImageRepo, newStudentRepo } from "@/repositories";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const uploadStudentImage = defineAction({
  accept: "form",
  input: z.object({
    image: z.instanceof(File).optional(),
    student_id: z.coerce.number(),
    has_been_printed: z.boolean().default(false).optional(),
  }),

  handler: async (input) => {
    console.log(input.image);

    if (input.image && input.image.size > 0) {
      const studentRepo = newStudentRepo();
      const student = await studentRepo.getVerboseStudent(input.student_id);

      const trimmedNim = student.nim
        ? student.nim.slice(student.nim!.length - 3)
        : "xxx";

      const [_, ext] = input.image.type.split("/");
      const filename = `${student.group_name}.${trimmedNim}-${student.nickname}.${ext}`;

      const imageRepo = newImageRepo();
      const { error } = await imageRepo.uploadStudentImage(
        input.image,
        filename.toLowerCase(),
        student.id
      );

      if (error) throw error;
    }
  },
});
