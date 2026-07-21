import { createRouter, authedQuery } from "./middleware";
import { createReport, listReports, resolveReport } from "./queries/reports";
import { createReportSchema, resolveReportSchema } from "@contracts/schemas";
import { TRPCError } from "@trpc/server";

export const reportsRouter = createRouter({
  create: authedQuery.input(createReportSchema).mutation(({ ctx, input }) =>
    createReport({
      reporterId: ctx.user.id,
      postId: input.postId ?? null,
      targetUserId: input.targetUserId ?? null,
      reason: input.reason,
    })
  ),

  list: authedQuery.query(({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Solo administradores" });
    }
    return listReports();
  }),

  resolve: authedQuery.input(resolveReportSchema).mutation(({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Solo administradores" });
    }
    return resolveReport(input.reportId);
  }),
});
