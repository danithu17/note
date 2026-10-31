export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  contextChips?: string[];
  isStreaming?: boolean;
}

export interface AssistantConversation {
  id: string;
  noteId?: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}
