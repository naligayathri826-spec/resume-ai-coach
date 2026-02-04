import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { jobId } = await req.json();

    if (!jobId) {
      throw new Error("Job ID is required");
    }

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from("hiring_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      throw new Error("Job not found");
    }

    // Fetch unanalyzed candidates
    const { data: candidates, error: candidatesError } = await supabase
      .from("candidates")
      .select("*")
      .eq("job_id", jobId)
      .is("ai_score", null);

    if (candidatesError) {
      throw new Error("Failed to fetch candidates");
    }

    if (!candidates || candidates.length === 0) {
      return new Response(
        JSON.stringify({ message: "No candidates to analyze" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Analyze each candidate
    for (const candidate of candidates) {
      try {
        const prompt = `You are an expert HR recruiter AI. Analyze this resume against the job requirements and provide a detailed assessment.

JOB REQUIREMENTS:
- Company: ${job.company_name}
- Position: ${job.job_title}
- Seniority: ${job.seniority_level || "Not specified"}
- Required Skills: ${JSON.stringify(job.required_skills || [])}
- Nice-to-Have Skills: ${JSON.stringify(job.nice_to_have_skills || [])}
- Experience Required: ${job.years_experience_min || 0} - ${job.years_experience_max || "N/A"} years
- Education: ${job.education_requirements || "Not specified"}
- Location: ${job.location || "Not specified"} ${job.remote_allowed ? "(Remote OK)" : ""}
- Deal Breakers: ${JSON.stringify(job.deal_breakers || [])}

RESUME CONTENT:
${candidate.resume_content}

Analyze this candidate and respond with a JSON object (no markdown, just raw JSON):
{
  "candidate_name": "extracted full name or null if not found",
  "candidate_email": "extracted email or null if not found",
  "parsed_skills": ["array", "of", "skills", "found"],
  "years_experience": estimated years as number or null,
  "education": "highest education level found or null",
  "ai_score": number from 0-100 based on overall fit,
  "skill_match_percentage": number from 0-100,
  "experience_match_percentage": number from 0-100,
  "fit_category": "strong_fit" or "medium_fit" or "reject",
  "ai_reasoning": "2-3 sentences explaining the score and fit category"
}

Scoring guidelines:
- strong_fit (70-100): Meets most requirements, has required skills, appropriate experience
- medium_fit (40-69): Meets some requirements, missing some skills or experience
- reject (0-39): Does not meet minimum requirements or has deal breakers`;

        let analysisResult;

        if (lovableApiKey) {
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: "You are an expert HR recruiter AI. Always respond with valid JSON only, no markdown." },
                { role: "user", content: prompt }
              ],
            }),
          });

          if (!aiResponse.ok) {
            throw new Error("AI analysis failed");
          }

          const aiData = await aiResponse.json();
          const content = aiData.choices[0]?.message?.content || "{}";
          
          // Clean the response - remove markdown if present
          const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          analysisResult = JSON.parse(cleanedContent);
        } else {
          // Fallback mock analysis if no API key
          analysisResult = {
            candidate_name: null,
            candidate_email: null,
            parsed_skills: [],
            years_experience: null,
            education: null,
            ai_score: 50,
            skill_match_percentage: 50,
            experience_match_percentage: 50,
            fit_category: "medium_fit",
            ai_reasoning: "Analysis unavailable - API key not configured"
          };
        }

        // Update candidate with analysis results
        await supabase
          .from("candidates")
          .update({
            candidate_name: analysisResult.candidate_name,
            candidate_email: analysisResult.candidate_email,
            parsed_skills: analysisResult.parsed_skills,
            years_experience: analysisResult.years_experience,
            education: analysisResult.education,
            ai_score: analysisResult.ai_score,
            skill_match_percentage: analysisResult.skill_match_percentage,
            experience_match_percentage: analysisResult.experience_match_percentage,
            fit_category: analysisResult.fit_category,
            ai_reasoning: analysisResult.ai_reasoning,
            analyzed_at: new Date().toISOString(),
          })
          .eq("id", candidate.id);

      } catch (candidateError) {
        console.error(`Error analyzing candidate ${candidate.id}:`, candidateError);
        // Continue with next candidate
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Analyzed ${candidates.length} candidates`,
        jobId 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in analyze-candidates function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});