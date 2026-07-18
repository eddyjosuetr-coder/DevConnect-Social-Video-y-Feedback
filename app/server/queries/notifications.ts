import { eq, isNull, and, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { notifications, users } from "@db/schema";
import { mockUserById } from "./users";

const isMock = !process.env.DATABASE_URL;

export type NotifType = "like" | "comment" | "repost" | "follow";

export type NotifRow = {
  id: number;
  type: NotifType;
  postId: number | null;
  readAt: Date | null;
  createdAt: Date;
  actorId: number;
  actorName: string | null;
  actorAvatar: string | null;
};

type MockNotif = {
  id: number;
  recipientId: number;
  actorId: number;
  type: NotifType;
  postId: number | null;
  readAt: Date | null;
  createdAt: Date;
};

const mockNotifs: MockNotif[] = [];
let nextNotifId = 1;

export async function createNotification(
  actorId: number,
  recipientId: number,
  type: NotifType,
  postId?: number
): Promise<void> {
  if (actorId === recipientId) return;

  if (isMock) {
    mockNotifs.push({
      id: nextNotifId++,
      recipientId, actorId, type,
      postId: postId ?? null,
      readAt: null,
      createdAt: new Date(),
    });
    return;
  }

  const db = getDb();
  await db.insert(notifications).values({
    recipientId, actorId, type,
    postId: postId ?? null,
  });
}

export async function listNotifications(userId: number): Promise<NotifRow[]> {
  if (isMock) {
    return mockNotifs
      .filter((n) => n.recipientId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50)
      .map((n) => {
        const actor = mockUserById.get(n.actorId);
        return {
          id: n.id,
          type: n.type,
          postId: n.postId,
          readAt: n.readAt,
          createdAt: n.createdAt,
          actorId: n.actorId,
          actorName: actor?.name ?? null,
          actorAvatar: actor?.avatar ?? null,
        };
      });
  }

  const db = getDb();
  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      postId: notifications.postId,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
      actorId: notifications.actorId,
      actorName: users.name,
      actorAvatar: users.avatar,
    })
    .from(notifications)
    .leftJoin(users, eq(notifications.actorId, users.id))
    .where(eq(notifications.recipientId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return rows as NotifRow[];
}

export async function markAllRead(userId: number): Promise<void> {
  if (isMock) {
    mockNotifs
      .filter((n) => n.recipientId === userId && n.readAt === null)
      .forEach((n) => { n.readAt = new Date(); });
    return;
  }
  const db = getDb();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.recipientId, userId), isNull(notifications.readAt)));
}

export async function getUnreadNotifCount(userId: number): Promise<number> {
  if (isMock) {
    return mockNotifs.filter((n) => n.recipientId === userId && n.readAt === null).length;
  }
  const db = getDb();
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.recipientId, userId), isNull(notifications.readAt)));
  return rows.length;
}
