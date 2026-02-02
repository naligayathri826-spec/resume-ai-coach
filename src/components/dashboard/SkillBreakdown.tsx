import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface Skill {
  name: string;
  level: number;
}

interface SkillBreakdownProps {
  skills: Skill[];
}

export function SkillBreakdown({ skills }: SkillBreakdownProps) {
  // Transform skills data for radar chart
  const radarData = skills.slice(0, 6).map((skill) => ({
    skill: skill.name.length > 12 ? skill.name.substring(0, 12) + "..." : skill.name,
    value: skill.level,
    fullName: skill.name,
  }));

  // Categorize skills by level
  const expertSkills = skills.filter((s) => s.level >= 80);
  const proficientSkills = skills.filter((s) => s.level >= 60 && s.level < 80);
  const developingSkills = skills.filter((s) => s.level < 60);

  const avgLevel = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + s.level, 0) / skills.length)
    : 0;

  return (
    <Card className="shadow-soft hover:shadow-medium transition-smooth">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Skill Breakdown
        </CardTitle>
        <CardDescription>Analysis of your technical proficiency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        {radarData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-48"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }}
                />
                <Radar
                  name="Skill Level"
                  dataKey="value"
                  stroke="hsl(220, 90%, 56%)"
                  fill="hsl(220, 90%, 56%)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Average Score */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">Average Skill Level</span>
          <span className="text-xl font-bold">{avgLevel}%</span>
        </div>

        {/* Skill Categories */}
        <div className="space-y-3">
          {expertSkills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Expert Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {expertSkills.slice(0, 4).map((skill) => (
                  <Badge key={skill.name} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {skill.name} ({skill.level}%)
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {developingSkills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Needs Improvement</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {developingSkills.slice(0, 4).map((skill) => (
                  <Badge key={skill.name} variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                    {skill.name} ({skill.level}%)
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
