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
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Analyzing resume for user:', user.id);

    // Call Lovable AI to analyze the resume
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert resume analyzer specializing in all career fields including IT, Software, Civil Services (IAS, IPS), Engineering, Healthcare, Education, Finance, and more. 

Analyze the provided resume text and return a comprehensive analysis in JSON format with:
1. field_category: Identify the primary field/sector (e.g., "IT & Software", "Civil Services", "Healthcare", etc.)
2. overall_score: A score from 0-100 representing resume quality
3. skills: Array of detected skills with name and proficiency level (0-100)
4. job_matches: Array of 3-5 relevant job recommendations with company, position, match percentage (0-100), location, and salary
5. improvement_tips: Array of 5-7 actionable improvement suggestions

Be specific to the detected field. For civil services resumes, focus on relevant experience and qualifications. For IT, focus on technical skills and projects.`;

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
    const analysisResult = JSON.parse(aiResponse.choices[0].message.content);

    console.log('AI Analysis completed:', analysisResult);

    // Store the resume in database
    const { data: resume, error: resumeError } = await supabaseClient
      .from('resumes')
      .insert({
        user_id: user.id,
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
        user_id: user.id,
        field_category: analysisResult.field_category || 'General',
        overall_score: analysisResult.overall_score || 75,
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