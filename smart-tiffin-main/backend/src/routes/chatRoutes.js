// ============ src/routes/chatRoutes.js ============
const express = require('express');
const {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  reportMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:conversationId', getMessages);
router.post('/send', sendMessage);
router.delete('/:messageId', deleteMessage);
router.put('/:messageId/report', reportMessage);

module.exports = router;

