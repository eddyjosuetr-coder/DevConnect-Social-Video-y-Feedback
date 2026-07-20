import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  mediumtext,
  timestamp,
  bigint,
  int,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: mediumtext("avatar"),
  bio: text("bio"),
  banner: mediumtext("banner"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Posts ──
export const posts = mysqlTable("posts", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  code: text("code"),
  codeLanguage: varchar("codeLanguage", { length: 50 }),
  tags: varchar("tags", { length: 500 }),
  mediaUrl: text("mediaUrl"),
  mediaType: varchar("mediaType", { length: 10 }),
  likesCount: int("likesCount").default(0).notNull(),
  commentsCount: int("commentsCount").default(0).notNull(),
  repostsCount: int("repostsCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ── Post Likes ──
export const postLikes = mysqlTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userPostUnique: uniqueIndex('post_likes_user_post_idx').on(table.postId, table.userId),
}));

// ── Comments ──
export const comments = mysqlTable("comments", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ── Reposts ──
export const reposts = mysqlTable("reposts", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  quoteText: text("quoteText"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userPostUnique: uniqueIndex("reposts_user_post_idx").on(table.postId, table.userId),
}));

// ── Messages ──
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  senderId: bigint("senderId", { mode: "number", unsigned: true }).notNull(),
  receiverId: bigint("receiverId", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Message = typeof messages.$inferSelect;

// ── Notifications ──
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  recipientId: bigint("recipientId", { mode: "number", unsigned: true }).notNull(),
  actorId: bigint("actorId", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["like", "comment", "repost", "follow"]).notNull(),
  postId: bigint("postId", { mode: "number", unsigned: true }),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ── Bookmarks ──
export const bookmarks = mysqlTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userPostUnique: uniqueIndex("bookmarks_user_post_idx").on(table.userId, table.postId),
}));

// ── Follows ──
export const follows = mysqlTable("follows", {
  id: serial("id").primaryKey(),
  followerId: bigint("followerId", { mode: "number", unsigned: true }).notNull(),
  followingId: bigint("followingId", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniqueFollow: uniqueIndex("follows_follower_following_idx").on(table.followerId, table.followingId),
}));
