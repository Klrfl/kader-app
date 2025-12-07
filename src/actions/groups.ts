import { newGroupRepo } from "@/repositories";
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
