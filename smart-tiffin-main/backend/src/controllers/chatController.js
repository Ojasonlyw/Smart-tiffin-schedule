// ============ src/controllers/chatController.js ============
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const TiffinProvider = require('../models/TiffinProvider');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get chat conversations
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  // Get all unique conversations for the user
  const messages = await ChatMessage.aggregate([
    {
      $match: {
        $or: [
          { sender: req.user._id },
          { receiver: req.user._id }
        ],
        isDeleted: false
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [
                { $eq: ['$receiver', req.user._id] },
                { $eq: ['$isRead', false] }
              ]},
              1,
              0
            ]
          }
        }
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);

  // Populate user details
  const conversations = await Promise.all(
    messages.map(async (msg) => {
      const otherUserId = msg.lastMessage.sender.toString() === req.user._id.toString()
        ? msg.lastMessage.receiver
        : msg.lastMessage.sender;

      const otherUser = await User.findById(otherUserId).select('name avatar role');

      return {
        conversationId: msg._id,
        otherUser,
        lastMessage: msg.lastMessage,
        unreadCount: msg.unreadCount
      };
    })
  );

  res.status(200).json(
    new ApiResponse(200, { conversations }, 'Conversations retrieved successfully')
  );
});

// @desc    Get messages in a conversation
// @route   GET /api/chat/:conversationId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Verify user is part of this conversation
  const userIds = conversationId.split('_');
  if (!userIds.includes(req.user._id.toString())) {
    throw new ApiError(403, 'Not authorized to access this conversation');
  }

  const messages = await ChatMessage.find({
    conversationId,
    deletedBy: { $ne: req.user._id }
  })
    .populate('sender receiver', 'name avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ChatMessage.countDocuments({
    conversationId,
    deletedBy: { $ne: req.user._id }
  });

  // Mark messages as read
  await ChatMessage.updateMany(
    {
      conversationId,
      receiver: req.user._id,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  res.status(200).json(
    new ApiResponse(200, {
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Messages retrieved successfully')
  );
});

// @desc    Send message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, message, messageType, attachments } = req.body;

  // Verify receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new ApiError(404, 'Receiver not found');
  }

  const conversationId = ChatMessage.createConversationId(req.user._id, receiverId);

  const chatMessage = await ChatMessage.create({
    sender: req.user._id,
    receiver: receiverId,
    conversationId,
    message,
    messageType: messageType || 'text',
    attachments: attachments || []
  });

  await chatMessage.populate('sender receiver', 'name avatar role');

  res.status(201).json(
    new ApiResponse(201, { message: chatMessage }, 'Message sent successfully')
  );
});

// @desc    Delete message
// @route   DELETE /api/chat/:messageId
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await ChatMessage.findById(req.params.messageId);

  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  // Check if user is sender or receiver
  if (
    message.sender.toString() !== req.user._id.toString() &&
    message.receiver.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'Not authorized to delete this message');
  }

  // Add user to deletedBy array
  if (!message.deletedBy.includes(req.user._id)) {
    message.deletedBy.push(req.user._id);
  }

  // If both users deleted, mark as deleted
  if (message.deletedBy.length >= 2) {
    message.isDeleted = true;
  }

  await message.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Message deleted successfully')
  );
});

// @desc    Report message
// @route   PUT /api/chat/:messageId/report
// @access  Private
const reportMessage = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const message = await ChatMessage.findById(req.params.messageId);

  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  message.isReported = true;
  message.reportedBy = req.user._id;
  message.reportReason = reason;

  await message.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Message reported successfully')
  );
});

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  reportMessage
};

