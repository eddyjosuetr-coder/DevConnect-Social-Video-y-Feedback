import { createRouter, authedQuery } from "./middleware";
import { sendMessageSchema, getThreadSchema, markReadSchema } from "@contracts/schemas";
import { sendMessage, getThread, getConversations, markRead, getTotalUnread } from "./queries/messages";

export const messagesRouter = createRouter({
  send: authedQuery.input(sendMessageSchema).mutation(({ ctx, input }) =>
    sendMessage(ctx.user.id, input.receiverId, input.content)
  ),

  thread: authedQuery.input(getThreadSchema).query(({ ctx, input }) =>
    getThread(ctx.user.id, input.otherId)
  ),

  conversations: authedQuery.query(({ ctx }) =>
    getConversations(ctx.user.id)
  ),

  markRead: authedQuery.input(markReadSchema).mutation(({ ctx, input }) =>
    markRead(ctx.user.id, input.otherId)
  ),

  totalUnread: authedQuery.query(({ ctx }) =>
    getTotalUnread(ctx.user.id)
  ),
});
