# Attachment Logic Plan

This document outlines the required steps to successfully implement an attachment pipeline for both the chat and quote systems in the Zaaro application.

## 1. Supabase Infrastructure & Database Updates

### Storage Bucket Setup
- **Action**: Create a new storage bucket in Supabase named `chat_attachments`.
- **Policies**: Set up Row Level Security (RLS) on the bucket so that:
  - Users can **insert** (upload) files if they are authenticated.
  - Users can **select** (download) files if they are participants in the associated conversation/quote. (Alternatively, use signed URLs if strict privacy is required, or standard public URLs with obscured UUID paths).

### Table Migration
- **Action**: Create a new migration file (e.g., `supabase/migrations/[TIMESTAMP]_add_message_attachments.sql`).
- **SQL Execution**:
  ```sql
  ALTER TABLE "public"."messages" 
  ADD COLUMN "attachments" jsonb DEFAULT '[]'::jsonb;
  ```
- *Optional Function Update*: If required, update the `search_messages` Postgres function to optionally index attachment names for text search.

### Types Update
- **File**: [src/lib/database.types.ts](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/lib/database.types.ts)
- **Action**: Update the [Message](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/lib/database.types.ts#972-982) interface to include the `attachments` array.
  ```typescript
  export interface MessageAttachment {
      name: string;
      url: string;
      type: string;
      size: number;
  }

  export interface Message {
      // existing fields...
      attachments?: MessageAttachment[];
  }
  ```

## 2. API & Service Layer ([src/lib/supabase-chat.ts](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/lib/supabase-chat.ts))

- **Action**: Update the [sendMessage](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/lib/supabase-chat.ts#82-112) function to accept and persist attachments.
- **Change**:
  ```typescript
  export async function sendMessage(
      id: string, 
      senderId: string, 
      content: string, 
      type: 'conversation' | 'quote' = 'conversation',
      attachments?: MessageAttachment[]
  ) {
      const payload: any = { sender_id: senderId, content };
      if (attachments && attachments.length > 0) payload.attachments = attachments;
      // ... existing logic
  }
  ```
- **Helper Function**: Add a new exported helper function `uploadChatAttachment(file: File, conversationId: string): Promise<MessageAttachment>` that pushes the file to the Supabase `chat_attachments` bucket and returns the generated `MessageAttachment` object.

## 3. Frontend UI Implementation

### Chat Input Component ([src/components/chat/ChatInput.tsx](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/components/chat/ChatInput.tsx))
- **State**: Add `const [pendingAttachments, setPendingAttachments] = useState<File[]>([])`.
- **UI Element**: 
  - Wire up the existing `<Paperclip />` icon to open a hidden `<input type="file" multiple />`.
  - Add a "Staging Area" view above the `<Textarea />` that renders the files currently in `pendingAttachments` along with a remove/cancel ("X") button.
- **Callback**: Update the `onSend` prop signature to [(message: string, attachments: File[]) => void](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/lib/database.types.ts#883-892).
- **Send Logic**: Ensure hitting Enter or clicking Send processes both the text logic and the pending attachments, then clears the staging area.

### Chat Window Component ([src/components/chat/ChatWindow.tsx](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/components/chat/ChatWindow.tsx))
- **Action**: Update the [handleSend](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/components/chat/ChatInput.tsx#20-28) function logic to handle the new `attachments` parameter coming from [ChatInput](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/components/chat/ChatInput.tsx#16-85).
- **Upload Flow**:
  1. If attachments exist, map through them and call `uploadChatAttachment(...)` continuously using `Promise.all()`.
  2. Maintain a local state (or adjust optimistic message injection) to show a "Loading/Uploading" spinner for the message segment while files are actively uploading to the bucket.
  3. Once all uploads yield URLs, pass the mapped `MessageAttachment[]` to [sendMessage()](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/lib/supabase-chat.ts#82-112).

### Message Bubble Component ([src/components/chat/MessageBubble.tsx](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/components/chat/MessageBubble.tsx))
- **Action**: Update the component to dynamically render attachments if they are present on the message.
- **UI Logic**:
  - Iterate safely through `message.attachments`.
  - If `type.startsWith('image/')`, render a smaller image thumbnail preview (click to view full screen or download).
  - Otherwise, render a sleek file-attachment card displaying the file's icon, `name`, and formatted `size`, acting as a hyperlink to the `url` using `target="_blank"`.
