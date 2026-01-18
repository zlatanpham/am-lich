import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  DEFAULT_ANCESTOR_TEMPLATE,
  DEFAULT_MONG1_TEMPLATE,
  DEFAULT_RAM15_TEMPLATE,
} from "@/lib/prayer-templates";

export const prayersRouter = createTRPCRouter({
  // Petitioners
  getPetitioners: protectedProcedure.query(({ ctx }) => {
    return ctx.db.petitioner.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: [{ isHead: "desc" }, { order: "asc" }],
    });
  }),

  createPetitioner: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        birthYear: z.number().int().min(1900).max(2100),
        buddhistName: z.string().optional().nullable(),
        isHead: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.isHead) {
        await ctx.db.petitioner.updateMany({
          where: { userId: ctx.session.user.id, isHead: true },
          data: { isHead: false },
        });
      }

      const count = await ctx.db.petitioner.count({
        where: { userId: ctx.session.user.id },
      });

      return ctx.db.petitioner.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          order: count,
        },
      });
    }),

  updatePetitioner: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        birthYear: z.number().int().min(1900).max(2100),
        buddhistName: z.string().optional().nullable(),
        isHead: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      if (input.isHead) {
        await ctx.db.petitioner.updateMany({
          where: { userId: ctx.session.user.id, isHead: true, id: { not: id } },
          data: { isHead: false },
        });
      }

      return ctx.db.petitioner.update({
        where: { id, userId: ctx.session.user.id },
        data,
      });
    }),

  deletePetitioner: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.petitioner.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
    }),

  // Templates
  getTemplates: protectedProcedure.query(({ ctx }) => {
    return ctx.db.prayerTemplate.findMany({
      where: { userId: ctx.session.user.id },
    });
  }),

  updateTemplate: protectedProcedure
    .input(
      z.object({
        type: z.enum(["mong1", "ram15", "ancestor"]),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.prayerTemplate.upsert({
        where: {
          userId_type: {
            userId: ctx.session.user.id,
            type: input.type,
          },
        },
        update: { content: input.content },
        create: {
          userId: ctx.session.user.id,
          type: input.type,
          content: input.content,
        },
      });
    }),

  resetTemplate: protectedProcedure
    .input(z.object({ type: z.enum(["mong1", "ram15", "ancestor"]) }))
    .mutation(async ({ ctx, input }) => {
      let content = "";
      switch (input.type) {
        case "mong1":
          content = DEFAULT_MONG1_TEMPLATE;
          break;
        case "ram15":
          content = DEFAULT_RAM15_TEMPLATE;
          break;
        case "ancestor":
          content = DEFAULT_ANCESTOR_TEMPLATE;
          break;
      }

      return ctx.db.prayerTemplate.upsert({
        where: {
          userId_type: {
            userId: ctx.session.user.id,
            type: input.type,
          },
        },
        update: { content },
        create: {
          userId: ctx.session.user.id,
          type: input.type,
          content,
        },
      });
    }),

  // Settings
  getSettings: protectedProcedure.query(({ ctx }) => {
    return ctx.db.prayerSettings.findUnique({
      where: { userId: ctx.session.user.id },
    });
  }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        familySurname: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.prayerSettings.upsert({
        where: { userId: ctx.session.user.id },
        update: input,
        create: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Get prayer data for a shared event owner (verify share relationship)
  getSharedPrayerData: protectedProcedure
    .input(z.object({ ownerUserId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userEmail = ctx.session.user.email?.toLowerCase();

      // Verify there's an accepted share relationship
      const share = await ctx.db.eventShare.findFirst({
        where: {
          ownerId: input.ownerUserId,
          status: "ACCEPTED",
          OR: [
            { recipientId: userId },
            { recipientEmail: userEmail, recipientId: null },
          ],
        },
      });

      if (!share) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bạn không có quyền xem thông tin này",
        });
      }

      // Fetch the owner's prayer data
      const [petitioners, settings, templates] = await Promise.all([
        ctx.db.petitioner.findMany({
          where: { userId: input.ownerUserId },
          orderBy: [{ isHead: "desc" }, { order: "asc" }],
        }),
        ctx.db.prayerSettings.findUnique({
          where: { userId: input.ownerUserId },
        }),
        ctx.db.prayerTemplate.findMany({
          where: { userId: input.ownerUserId },
        }),
      ]);

      return { petitioners, settings, templates };
    }),
});
