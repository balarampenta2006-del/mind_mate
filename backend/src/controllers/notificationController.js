import { db } from '../data/store.js';
import { isMongoConnected } from '../config/database.js';
import { NotificationModel } from '../models/index.js';
import { resolveReadUserId, resolveWriteUserId } from '../middleware/auth.js';

export async function getNotifications(req, res) {
  try {
    const targetUserId = resolveReadUserId(req);
    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (isMongoConnected()) {
      let list = await NotificationModel.find({ userId: targetUserId })
        .sort({ createdAt: -1 })
        .lean();

      if (list.length === 0) {
        list = db.notifications.filter((n) => n.userId === targetUserId);
      }
      return res.status(200).json(list);
    }

    const list = db.notifications
      .filter((n) => n.userId === targetUserId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(list);
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ message: 'Unable to load notifications. Please try again.' });
  }
}

export async function getUnreadCount(req, res) {
  try {
    const targetUserId = resolveReadUserId(req);
    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (isMongoConnected()) {
      const count = await NotificationModel.countDocuments({
        userId: targetUserId,
        isRead: false,
      });
      return res.status(200).json(count);
    }

    const count = db.notifications.filter((n) => n.userId === targetUserId && !n.isRead).length;
    res.status(200).json(count);
  } catch (error) {
    console.error('getUnreadCount error:', error);
    res.status(500).json({ message: 'Unable to load the unread count. Please try again.' });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';

    if (isMongoConnected()) {
      const filter = isAdmin ? { notificationId: id } : { notificationId: id, userId: req.user?.userId };
      const result = await NotificationModel.updateOne(filter, { $set: { isRead: true } });
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Notification not found.' });
      }
      const cached = db.notifications.find((n) => n.notificationId === id);
      if (cached && (isAdmin || cached.userId === req.user?.userId)) cached.isRead = true;
      return res.status(200).json({ success: true, message: 'Notification marked as read.' });
    }

    const notification = db.notifications.find((n) => n.notificationId === id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    if (!isAdmin && notification.userId !== req.user?.userId) {
      return res.status(403).json({ message: 'You do not have access to this notification.' });
    }

    notification.isRead = true;
    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ message: 'Unable to update the notification. Please try again.' });
  }
}

export async function markAllAsRead(req, res) {
  try {
    const targetUserId = resolveWriteUserId(req);
    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (isMongoConnected()) {
      await NotificationModel.updateMany(
        { userId: targetUserId },
        { $set: { isRead: true } }
      );
    }

    db.notifications.forEach((n) => {
      if (n.userId === targetUserId) {
        n.isRead = true;
      }
    });

    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    res.status(500).json({ message: 'Unable to update notifications. Please try again.' });
  }
}
