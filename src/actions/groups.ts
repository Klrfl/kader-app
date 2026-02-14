import { newGroupRepo } from "@/repositories";
import { newStorage } from "@/services/storage";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const groupCreate = defineAction({
  accept: "form",
  input: z.object({ name: z.string() }),

  handler: async (input) => {
    const groupRepo = newGroupRepo();
    await groupRepo.createGroup(input);

    return { success: true };
  },
});

export const groupUploadImage = defineAction({
  accept: "form",
  input: z.object({
    group_id: z.coerce.number({ message: "number is required" }).positive(),
    image: z.instanceof(File, { message: "image is required" }),
  }),

  handler: async (input) => {
    const groupRepo = newGroupRepo();
    const group = await groupRepo.getGroup(input.group_id);
    const [_, ext] = input.image.type.split("/");
    const filename = `${group.id}-${group.name}.${ext}`;

    const storage = newStorage("local");
    storage.upload(input.image, filename);

    const result = await groupRepo.uploadImage(input.group_id, filename);
    console.log(
      `${new Date(result.created_at).toString()} successfully uploaded group image for ${group.name}`
    );

    return { success: true };
  },
});
