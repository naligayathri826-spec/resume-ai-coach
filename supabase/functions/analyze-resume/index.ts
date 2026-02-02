import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileContent, fileName, fileType } = await req.json();
    
    // Get JWT token from Authorization header (already verified by Supabase)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Extract user ID from JWT token
    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    if (!userId) {
      throw new Error('Invalid token');
    }

    console.log('Analyzing resume for user:', userId);

    // Create Supabase client with service role for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    

    // Call Lovable AI to analyze the resume
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert resume analyzer specializing in all career fields including IT, Software, Civil Services (IAS, IPS), Engineering, Healthcare, Education, Finance, and more. 

Analyze the provided resume text and return a comprehensive analysis in JSON format with:
1. field_category: Identify the primary field/sector (e.g., "IT & Software", "Civil Services", "Healthcare", etc.)
2. overall_score: A percentage score from 0-100 representing how strong this resume is for job applications
3. strengths: Array of 3-5 specific things that are GOOD about this resume (what they did well)
4. weaknesses: Array of 3-5 specific things that are NOT GOOD about this resume (what needs improvement)
5. suggested_changes: Array of 5-7 detailed, actionable changes the candidate should make to improve their resume
6. skills: Array of detected skills with name and proficiency level (0-100)
7. job_matches: Array of 3-5 relevant job recommendations with company, position, match percentage (0-100), location, and salary
8. improvement_tips: Array of 3-5 quick tips for immediate improvements

Be specific and constructive in your feedback. Focus on actionable insights that will help the candidate improve their resume and land better jobs.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this resume:\n\nFile: ${fileName}\n\n${fileContent}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI analysis failed");
    }

    const aiResponse = await response.json();
    
    // Extract content and clean markdown code blocks if present
    let content = aiResponse.choices[0].message.content;
    
    // Remove markdown code blocks (```json...``` or ```...```)
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    console.log('Raw AI response:', content);
    
    const analysisResult = JSON.parse(content);
    console.log('AI Analysis completed:', analysisResult);

    // Store the resume in database
    const { data: resume, error: resumeError } = await supabaseClient
      .from('resumes')
      .insert({
        user_id: userId,
        file_name: fileName,
        file_type: fileType,
        file_content: fileContent
      })
      .select()
      .single();

    if (resumeError) {
      console.error('Error storing resume:', resumeError);
      throw resumeError;
    }

    // Store the analysis results
    const { data: analysis, error: analysisError } = await supabaseClient
      .from('analysis_results')
      .insert({
        resume_id: resume.id,
        user_id: userId,
        field_category: analysisResult.field_category || 'General',
        overall_score: analysisResult.overall_score || 75,
        strengths: analysisResult.strengths || [],
        weaknesses: analysisResult.weaknesses || [],
        suggested_changes: analysisResult.suggested_changes || [],
        skills: analysisResult.skills || [],
        job_matches: analysisResult.job_matches || [],
        improvement_tips: analysisResult.improvement_tips || []
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Error storing analysis:', analysisError);
      throw analysisError;
    }

    // Send email notification (fire and forget - don't block on this)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    try {
      // Get user email from profiles
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (profile?.email) {
        const analysisUrl = `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/results?analysisId=${analysis.id}`;
        
        fetch(`${supabaseUrl}/functions/v1/send-analysis-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            email: profile.email,
            resumeName: fileName,
            overallScore: analysisResult.overall_score || 75,
            fieldCategory: analysisResult.field_category || 'General',
            topStrengths: analysisResult.strengths?.slice(0, 3) || [],
            analysisUrl,
          }),
        }).catch((err) => console.log('Email notification failed (non-blocking):', err));
      }
    } catch (emailErr) {
      console.log('Email notification skipped:', emailErr);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        analysisId: analysis.id,
        resumeId: resume.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});