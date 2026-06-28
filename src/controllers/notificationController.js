import Notification from '../models/Notification.js';

// GET ALL NOTIFICATIONS FOR USER
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user.id })
      .populate('sender', 'username profilePic')
      .populate('post', 'caption')
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// MARK NOTIFICATIONS AS READ
export const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ receiver: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};