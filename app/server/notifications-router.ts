import { createRouter, authedQuery } from "./middleware";
import { listNotifications, markAllRead, getUnreadNotifCount } from "./queries/notifications";

export const notificationsRouter = createRouter({
  list: authedQuery.query(({ ctx }) => listNotifications(ctx.user.id)),
  markRead: authedQuery.mutation(({ ctx }) => markAllRead(ctx.user.id)),
  unreadCount: authedQuery.query(({ ctx }) => getUnreadNotifCount(ctx.user.id)),
});
