
-- Add feedback column to interviews table
ALTER TABLE public.interviews ADD COLUMN feedback TEXT;
ALTER TABLE public.interviews ADD COLUMN rating INTEGER;
