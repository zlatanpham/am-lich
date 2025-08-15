import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const eventRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().nullable().optional(),
        date: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.create({
        data: {
          title: input.title,
          description: input.description,
          date: input.date,
          userId: ctx.session.user.id,
        },
      });
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.event.findMany({
      where: {
        userId: ctx.session.user.id,
        isActive: true,
      },
      orderBy: {
        date: "asc",
      },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
        date: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      // Verify the event belongs to the user
      const event = await ctx.db.event.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!event) {
        throw new Error("Event not found or you don't have permission to update it");
      }

      return ctx.db.event.update({
        where: { id },
        data: updateData,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify the event belongs to the user
      const event = await ctx.db.event.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!event) {
        throw new Error("Event not found or you don't have permission to delete it");
      }

      return ctx.db.event.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.event.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
          isActive: true,
        },
      });
    }),
});