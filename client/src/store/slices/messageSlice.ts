import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface MessageUser {
  id: number;
  username: string;
}

interface Message {
  id: number;
  content: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  User: MessageUser;
}

interface MessageState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  messages: [],
  isLoading: false,
  error: null,
};

export const fetchMessages = createAsyncThunk(
  'messages/fetch',
  async (token: string) => {
    const response = await axios.get(`${API_URL}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }
);

export const sendMessage = createAsyncThunk(
  'messages/send',
  async ({ content, token }: { content: string; token: string }) => {
    const response = await axios.post(
      `${API_URL}/messages`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data;
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload || [];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const { addMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;