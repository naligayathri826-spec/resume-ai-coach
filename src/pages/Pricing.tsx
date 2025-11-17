import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plans = [
  {
    name: "Basic",
    price: "₹99",
    tier: "basic",
    features: [
      "Enhanced AI Analysis",
      "Detailed Feedback",
      "10 Resume Uploads/month",
      "Basic Job Matching",
    ],
  },
  {
    name: "Pro",
    price: "₹199",
    tier: "pro",
    features: [
      "Advanced AI Analysis",
      "Comprehensive Feedback",
      "50 Resume Uploads/month",
      "Advanced Job Matching",
      "Priority Support",
    ],
    popular: true,
  },
  {
    name: "Light",
    price: "₹299",
    tier: "light",
    features: [
      "Premium AI Analysis",
      "Expert-level Feedback",
      "Unlimited Resume Uploads",
      "Premium Job Matching",
      "24/7 Priority Support",
      "Resume Templates",
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };

    checkAuth();
  }, [navigate]);

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(tier);

    try {
      // Update user's subscription in the database
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: tier,
          subscription_status: "active",
          subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Subscription Activated!",
        description: `You've successfully subscribed to the ${tier} plan.`,
      });

      // Navigate back to upload page
      navigate("/upload");
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to activate subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">
            You've reached your free upload limit. Upgrade to continue with enhanced analysis!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.tier}
              className={`relative ${
                plan.popular ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={loading !== null}
                >
                  {loading === plan.tier ? "Processing..." : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Note: This is a demo implementation. In production, integrate with a payment gateway.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
