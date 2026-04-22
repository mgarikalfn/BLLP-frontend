import { create } from "zustand";
import { api } from "@/lib/api";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./authStore";

export interface P2PUser {
  _id: string;
  username: string;
  avatarUrl?: string;
  level: number;
  bio?: string;
}

export interface P2PMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface P2PConversation {
  _id: string;
  participants: P2PUser[];
  lastMessageAt: string;
}

interface P2PChatState {
  socket: Socket | null;
  isConnected: boolean;
  isMatching: boolean;
  conversations: P2PConversation[];
  activeConversation: P2PConversation | null;
  messages: P2PMessage[];
  error: string | null;

  connectSocket: () => void;
  disconnectSocket: () => void;
  findMatch: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  setActiveConversation: (conv: P2PConversation | null) => Promise<void>;
  sendMessage: (text: string) => void;
  reportUser: (reportedUserId: string, messageId: string, reason: string) => Promise<boolean>;
}

export const useP2PChatStore = create<P2PChatState>((set, get) => ({
  socket: null,
  isConnected: false,
  isMatching: false,
  conversations: [],
  activeConversation: null,
  messages: [],
  error: null,

  connectSocket: () => {
    const currentSocket = get().socket;
    if (currentSocket) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const url = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
    
    const socket = io(url, {
      transports: ["websocket"],
      auth: { token }
    });

    socket.on("connect", () => {
      set({ isConnected: true, socket });
      
      const activeConv = get().activeConversation;
      if (activeConv) {
        socket.emit("join_conversation", activeConv._id);
      }
    });

    socket.on("disconnect", () => {
      set({ isConnected: false });
    });

    socket.on("receive_message", (message: P2PMessage) => {
      const { activeConversation, messages } = get();
      if (activeConversation && message.conversationId === activeConversation._id) {
        // Prevent duplicates
        if (!messages.find(m => m._id === message._id)) {
          set({ messages: [...messages, message] });
        }
      }
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, conversations: [], activeConversation: null });
    }
  },

  findMatch: async () => {
    set({ isMatching: true, error: null });
    try {
      const res = await api.get<{ conversation: P2PConversation }>("/chat/match");
      const conversation = res.data.conversation;
      
      const { conversations } = get();
      if (!conversations.find(c => c._id === conversation._id)) {
        set({ conversations: [conversation, ...conversations] });
      }
      
      await get().setActiveConversation(conversation);
      set({ isMatching: false });
    } catch (error: any) {
      set({ 
        isMatching: false, 
        error: error.response?.data?.message || "Could not find a match right now." 
      });
    }
  },

  fetchConversations: async () => {
    try {
      const res = await api.get<{ conversations: P2PConversation[] }>("/chat/conversations");
      set({ conversations: res.data.conversations });
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  },

  setActiveConversation: async (conv: P2PConversation | null) => {
    if (!conv) {
      set({ activeConversation: null, messages: [] });
      return;
    }

    set({ activeConversation: conv, messages: [] });
    
    const socket = get().socket;
    if (socket && get().isConnected) {
      socket.emit("join_conversation", conv._id);
    } else {
      get().connectSocket();
    }

    try {
      const res = await api.get<{ messages: P2PMessage[] }>(`/chat/conversations/${conv._id}/messages`);
      set({ messages: res.data.messages });
    } catch (error) {
      console.error("Failed to fetch messages for conversation", error);
    }
  },

  sendMessage: (text: string) => {
    const { socket, activeConversation } = get();
    const token = localStorage.getItem("token");
    
    if (!socket || !activeConversation || !token) return;

    // decode token to get senderId
    let senderId = "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      senderId = payload.id;
    } catch (e) {
      console.error("Failed to decode token");
      return;
    }

    // Optimistic UI could be implemented here, but relying on broadcast is safer for now
    socket.emit("send_message", {
      conversationId: activeConversation._id,
      senderId,
      text
    });
  },

  reportUser: async (reportedUserId: string, messageId: string, reason: string) => {
    try {
      await api.post("/reports", {
        reportedUserId,
        messageId,
        reason
      });
      return true;
    } catch (error) {
      console.error("Failed to report user", error);
      return false;
    }
  }
}));
