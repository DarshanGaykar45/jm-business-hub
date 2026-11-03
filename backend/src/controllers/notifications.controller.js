const prisma = require('../config/db');

async function getNotifications(req, res) {
  try {
    const { division, unreadOnly } = req.query;
    const where = {};
    if (division && division !== 'all') {
      where.OR = [
        { businessDivision: division },
        { businessDivision: null }
      ];
    }
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.notification.count({
        where: { ...where, isRead: false }
      })
    ]);

    return res.json({ success: true, unreadCount, count: notifications.length, notifications });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to retrieve notifications' });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark As Read Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to update notification' });
  }
}

async function markAllAsRead(req, res) {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark All As Read Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to mark all as read' });
  }
}

async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    await prisma.notification.delete({ where: { id } });
    return res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete Notification Error:', error);
    return res.status(500).json({ error: 'ServerError', message: 'Failed to delete notification' });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
