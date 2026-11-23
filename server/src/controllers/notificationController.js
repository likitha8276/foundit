const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.status(200).json({ success: true, notification });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead
};
