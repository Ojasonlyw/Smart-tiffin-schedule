// ============ src/redux/slices/chatSlice.js ============
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatApi } from '../../api/chatApi';

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatApi.getConversations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, params }, { rejectWithValue }) => {
    try {
      const response = await chatApi.getMessages(conversationId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (data, { rejectWithValue }) => {
    try {
      const response = await chatApi.sendMessage(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    messages: [],
    currentConversation: null,
    loading: false,
    error: null,
    unreadCount: 0,
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateConversation: (state, action) => {
      const index = state.conversations.findIndex(
        (conv) => conv.conversationId === action.payload.conversationId
      );
      if (index !== -1) {
        state.conversations[index] = action.payload;
      }
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.conversations;
        state.unreadCount = action.payload.conversations.reduce(
          (sum, conv) => sum + conv.unreadCount,
          0
        );
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload.messages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload.message);
      });
  },
});

export const {
  addMessage,
  updateConversation,
  setCurrentConversation,
  incrementUnreadCount,
  resetUnreadCount,
} = chatSlice.actions;
export default chatSlice.reducer;

