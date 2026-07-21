import { eq, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { reports } from "@db/schema";

export type ReportRow = {
  id: number;
  reporterId: number;
  postId: number | null;
  targetUserId: number | null;
  reason: string;
  status: "pending" | "resolved";
  createdAt: Date;
};

const isMock = !process.env.DATABASE_URL;
const mockReports: ReportRow[] = [];
let nextReportId = 1;

export async function createReport(data: {
  reporterId: number;
  postId?: number | null;
  targetUserId?: number | null;
  reason: string;
}): Promise<{ success: boolean }> {
  if (isMock) {
    mockReports.push({
      id: nextReportId++,
      reporterId: data.reporterId,
      postId: data.postId ?? null,
      targetUserId: data.targetUserId ?? null,
      reason: data.reason,
      status: "pending",
      createdAt: new Date(),
    });
    return { success: true };
  }
  const db = getDb();
  await db.insert(reports).values({
    reporterId: data.reporterId,
    postId: data.postId ?? null,
    targetUserId: data.targetUserId ?? null,
    reason: data.reason,
  });
  return { success: true };
}

export async function listReports(): Promise<ReportRow[]> {
  if (isMock) return [...mockReports].reverse();
  const db = getDb();
  const rows = await db
    .select()
    .from(reports)
    .orderBy(desc(reports.createdAt))
    .limit(100);
  return rows as ReportRow[];
}

export async function resolveReport(reportId: number): Promise<{ success: boolean }> {
  if (isMock) {
    const r = mockReports.find((r) => r.id === reportId);
    if (r) r.status = "resolved";
    return { success: true };
  }
  const db = getDb();
  await db.update(reports).set({ status: "resolved" }).where(eq(reports.id, reportId));
  return { success: true };
}
