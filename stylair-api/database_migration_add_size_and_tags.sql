-- Migration script to add 'size' and 'tags' columns to closet_items table
-- Run this script in your Supabase SQL Editor or PostgreSQL client

-- Add 'size' column (optional text)
ALTER TABLE closet_items 
ADD COLUMN IF NOT EXISTS size TEXT;

-- Add 'tags' column (JSONB for storing array of tags)
ALTER TABLE closet_items 
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- Verify the columns were added (optional - you can run this to check)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'closet_items' 
-- AND column_name IN ('size', 'tags');

