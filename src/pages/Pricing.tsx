import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, X, Sparkles, Zap, Building2 } from "lucide-react";
import Footer from "@/components/Footer";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Free",
      icon: Sparkles,
      description: "Perfect for getting started",
      price: { monthly: 0, yearly: 0 },
      features: [
        { name: "3 resume analyses per month", included: true },
        { name: "Basic ATS score", included: true },
        { name: "General improvement tips", included: true },
        { name: "AI recommendations", included: false },
        { name: "LinkedIn sharing", included: false },
        { name: "Hiring mode", included: false },
        { name: "Bulk processing", included: false },
        { name: "Priority support", included: false },
      ],
      cta: "Get Started",
      popular: false,
      gradient: false,
    },
    {
      name: "Pro",
      icon: Zap,
      description: "For serious job seekers & recruiters",
      price: { monthly: 199, yearly: 1990 },
      features: [
        { name: "Unlimited resume analyses", included: true },
        { name: "Advanced ATS scoring", included: true },
        { name: "AI-powered recommendations", included: true },
        { name: "Keyword optimization", included: true },
        { name: "LinkedIn sharing", included: true },
        { name: "Hiring mode (10 jobs)", included: true },
        { name: "Candidate ranking", included: true },
        { name: "Email support", included: true },
      ],
      cta: "Start Pro Trial",
      popular: true,
      gradient: true,
    },
    {
      name: "Enterprise",
      icon: Building2,
      description: "For teams and organizations",
      price: { monthly: 499, yearly: 4990 },
      features: [
        { name: "Everything in Pro", included: true },
        { name: "Unlimited job postings", included: true },
        { name: "Bulk resume processing", included: true },
        { name: "Advanced AI filtering", included: true },
        { name: "Team collaboration", included: true },
        { name: "API access", included: true },
        { name: "Custom integrations", included: true },
        { name: "Priority support 24/7", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
      gradient: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              Simple, transparent pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Choose the perfect plan for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                your needs
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Whether you're a job seeker or hiring manager, we have a plan that fits your goals
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm ${!isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <span className={`text-sm ${isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                Yearly
              </span>
              {isYearly && (
                <Badge variant="outline" className="border-primary/50 text-primary">
                  Save 17%
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`relative h-full ${
                    plan.popular 
                      ? "border-2 border-primary shadow-large scale-105" 
                      : "border border-border"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="gradient-primary text-primary-foreground px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                      plan.gradient ? "gradient-primary" : "bg-muted"
                    }`}>
                      <plan.icon className={`w-7 h-7 ${plan.gradient ? "text-primary-foreground" : "text-foreground"}`} />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Price */}
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-foreground">
                          ₹{isYearly ? plan.price.yearly : plan.price.monthly}
                        </span>
                        <span className="text-muted-foreground">
                          /{isYearly ? "year" : "month"}
                        </span>
                      </div>
                      {isYearly && plan.price.monthly > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          ₹{Math.round(plan.price.yearly / 12)}/month billed annually
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-center gap-3">
                          {feature.included ? (
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                              <X className="w-3 h-3 text-muted-foreground" />
                            </div>
                          )}
                          <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground"}`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button 
                      className={`w-full ${plan.gradient ? "gradient-primary" : ""}`}
                      variant={plan.gradient ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-20 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="font-semibold mb-2">Can I switch plans anytime?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground text-sm">
                  We accept all major credit cards, UPI, and net banking. Enterprise customers can also pay via invoice.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="font-semibold mb-2">Is there a free trial for Pro?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes! Pro plan comes with a 7-day free trial. No credit card required to start.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;