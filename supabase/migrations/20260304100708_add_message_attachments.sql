-- Add attachments column to messages table
ALTER TABLE "public"."messages" 
ADD COLUMN "attachments" jsonb DEFAULT '[]'::jsonb;

-- Create storage bucket for chat attachments
INSERT INTO "storage"."buckets" (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
    'chat_attachments',
    'chat_attachments',
    true,
    10485760, -- 10MB limit
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed'
    ],
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for chat_attachments bucket (storage.objects is managed by Supabase)
-- Policy: Authenticated users can upload files
CREATE POLICY "Authenticated users can upload chat attachments"
ON "storage"."objects" FOR INSERT
TO "authenticated"
WITH CHECK (
    bucket_id = 'chat_attachments' 
    AND auth.uid() IS NOT NULL
);

-- Policy: Users can read attachments
CREATE POLICY "Authenticated users can view chat attachments"
ON "storage"."objects" FOR SELECT
TO "authenticated"
USING (
    bucket_id = 'chat_attachments' 
    AND auth.uid() IS NOT NULL
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update own chat attachments"
ON "storage"."objects" FOR UPDATE
TO "authenticated"
USING (
    bucket_id = 'chat_attachments' 
    AND auth.uid() IS NOT NULL
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own chat attachments"
ON "storage"."objects" FOR DELETE
TO "authenticated"
USING (
    bucket_id = 'chat_attachments' 
    AND auth.uid() IS NOT NULL
);
