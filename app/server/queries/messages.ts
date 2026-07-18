import { eq, or, and, desc, inArray, isNull } from "drizzle-orm";
import { getDb } from "./connection";
import { messages, users } from "@db/schema";
import { mockUserById } from "./users";

const isMock = !process.env.DATABASE_URL;

type MockMsg = {
  id: number; senderId: number; receiverId: number;
  content: string; readAt: Date | null; createdAt: Date;
};
const mockMessages: MockMsg[] = [];
let nextMsgId = 1;

// ── Types ─────────────────────────────────────────────────────────────────────
export type ConversationRow = {
  partnerId: number;
  partnerName: string | null;
  partnerAvatar: string | null;
  lastContent: string;
  lastAt: Date;
  lastSenderId: number;
  unreadCount: number;
};

export type MessageRow = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  readAt: Date | null;
  createdAt: Date;
};

// ── sendMessage ───────────────────────────────────────────────────────────────
export async function sendMessage(senderId: number, receiverId: number, content: string): Promise<{ id: number }> {
  if (isMock) {
    const id = nextMsgId++;
    mockMessages.push({ id, senderId, receiverId, content, readAt: null, createdAt: new Date() });
    return { id };
  }
  const db = getDb();
  const [result] = await db.insert(messages).values({ senderId, receiverId, content });
  return { id: result.insertId };
}

// ── getThread ─────────────────────────────────────────────────────────────────
export async function getThread(userId: number, otherId: number, limit = 60): Promise<MessageRow[]> {
  if (isMock) {
    return mockMessages
      .filter((m) =>
        (m.senderId === userId && m.receiverId === otherId) ||
        (m.senderId === otherId && m.receiverId === userId)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(-limit);
  }
  const db = getDb();
  const rows = await db.select()
    .from(messages)
    .where(
      or(
        and(eq(messages.senderId, userId), eq(messages.receiverId, otherId)),
        and(eq(messages.senderId, otherId), eq(messages.receiverId, userId))
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit);
  return rows.reverse();
}

// ── getConversations ──────────────────────────────────────────────────────────
export async function getConversations(userId: number): Promise<ConversationRow[]> {
  if (isMock) {
    const involved = mockMessages.filter(
      (m) => m.senderId === userId || m.receiverId === userId
    );
    const convMap = new Map<number, { lastMsg: MockMsg; unread: number }>();
    for (const msg of involved.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!convMap.has(partnerId)) convMap.set(partnerId, { lastMsg: msg, unread: 0 });
      if (msg.receiverId === userId && msg.readAt === null) convMap.get(partnerId)!.unread++;
    }
    return [...convMap.entries()].map(([partnerId, { lastMsg, unread }]) => {
      const u = mockUserById.get(partnerId);
      return {
        partnerId, partnerName: u?.name ?? null, partnerAvatar: u?.avatar ?? null,
        lastContent: lastMsg.content, lastAt: lastMsg.createdAt,
        lastSenderId: lastMsg.senderId, unreadCount: unread,
      };
    });
  }

  const db = getDb();
  // Load recent messages involving userId, aggregate in JS
  const rows = await db.select()
    .from(messages)
    .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
    .orderBy(desc(messages.createdAt))
    .limit(500);

  const convMap = new Map<number, { lastMsg: typeof rows[0]; unread: number }>();
  for (const msg of rows) {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!convMap.has(partnerId)) convMap.set(partnerId, { lastMsg: msg, unread: 0 });
    if (msg.receiverId === userId && msg.readAt === null) convMap.get(partnerId)!.unread++;
  }

  if (convMap.size === 0) return [];

  const partnerIds = [...convMap.keys()];
  const partners = await db.select({ id: users.id, name: users.name, avatar: users.avatar })
    .from(users)
    .where(inArray(users.id, partnerIds));

  return partners
    .map((u) => {
      const conv = convMap.get(u.id)!;
      return {
        partnerId: u.id, partnerName: u.name, partnerAvatar: u.avatar,
        lastContent: conv.lastMsg.content, lastAt: conv.lastMsg.createdAt,
        lastSenderId: conv.lastMsg.senderId, unreadCount: conv.unread,
      };
    })
    .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
}

// ── markRead ──────────────────────────────────────────────────────────────────
export async function markRead(userId: number, otherId: number): Promise<void> {
  if (isMock) {
    mockMessages
      .filter((m) => m.senderId === otherId && m.receiverId === userId && m.readAt === null)
      .forEach((m) => { m.readAt = new Date(); });
    return;
  }
  const db = getDb();
  await db.update(messages)
    .set({ readAt: new Date() })
    .where(and(eq(messages.senderId, otherId), eq(messages.receiverId, userId), isNull(messages.readAt)));
}

// ── getTotalUnread ────────────────────────────────────────────────────────────
export async function getTotalUnread(userId: number): Promise<number> {
  if (isMock) {
    return mockMessages.filter((m) => m.receiverId === userId && m.readAt === null).length;
  }
  const db = getDb();
  const rows = await db.select({ id: messages.id })
    .from(messages)
    .where(and(eq(messages.receiverId, userId), isNull(messages.readAt)));
  return rows.length;
}
