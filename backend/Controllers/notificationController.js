import Notification from "../models/NotificationSchema.js";

export const notify = async (recipient, recipientModel, type, message, booking) => {
  try {
    await Notification.create({ recipient, recipientModel, type, message, booking });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .sort("-createdAt")
      .limit(50);
    res.status(200).json({ success: true, message: "Notifications found", data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, message: "Marked as read", data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.userId, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update notifications" });
  }
};
