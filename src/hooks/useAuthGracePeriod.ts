import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const GRACE_PERIOD_DAYS = 7;
const FIRST_VISIT_KEY = "first_visit_timestamp";

export const useAuthGracePeriod = (requireAuth: boolean = false) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthRequirement = async () => {
      // Check if user is already logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user is logged in, no need to check grace period
      if (session) {
        return;
      }

      // Get or set first visit timestamp
      let firstVisit = localStorage.getItem(FIRST_VISIT_KEY);
      
      if (!firstVisit) {
        // First time visiting, store current timestamp
        const now = Date.now().toString();
        localStorage.setItem(FIRST_VISIT_KEY, now);
        firstVisit = now;
      }

      // Calculate days since first visit
      const firstVisitTime = parseInt(firstVisit);
      const now = Date.now();
      const daysSinceFirstVisit = (now - firstVisitTime) / (1000 * 60 * 60 * 24);

      // If more than 7 days have passed and user is not logged in, redirect to auth
      if (daysSinceFirstVisit > GRACE_PERIOD_DAYS) {
        navigate("/auth", { 
          state: { 
            message: "Your 7-day trial period has ended. Please sign in to continue." 
          } 
        });
      }
    };

    checkAuthRequirement();
  }, [navigate, requireAuth]);
};
