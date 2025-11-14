-- Add new columns for detailed feedback to analysis_results table
ALTER TABLE analysis_results 
ADD COLUMN IF NOT EXISTS strengths jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS weaknesses jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS suggested_changes jsonb DEFAULT '[]'::jsonb;