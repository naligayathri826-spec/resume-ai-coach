import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Calendar, Target } from "lucide-react";
import { motion } from "framer-motion";

interface WeeklyProgressProps {
  currentWeekScore: number;
  previousWeekScore: number;
  weeklyGoal: number;
  resumesThisWeek: number;
  weeklyTarget: number;
}

export function WeeklyProgress({
  currentWeekScore,
  previousWeekScore,
  weeklyGoal,
  resumesThisWeek,
  weeklyTarget,
}: WeeklyProgressProps) {
  const scoreDiff = currentWeekScore - previousWeekScore;
  const goalProgress = Math.min((currentWeekScore / weeklyGoal) * 100, 100);
  const targetProgress = Math.min((resumesThisWeek / weeklyTarget) * 100, 100);

  const getTrendIcon = () => {
    if (scoreDiff > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (scoreDiff < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (scoreDiff > 0) return "text-green-500";
    if (scoreDiff < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <Card className="shadow-soft hover:shadow-medium transition-smooth">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Weekly Progress
            </CardTitle>
            <CardDescription>Your performance this week</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {scoreDiff > 0 ? "+" : ""}{scoreDiff}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Score */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Average Score</span>
            <span className="font-semibold">{currentWeekScore}%</span>
          </div>
          <Progress value={currentWeekScore} className="h-2" />
        </motion.div>

        {/* Goal Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" /> Goal: {weeklyGoal}%
            </span>
            <span className="font-semibold">{Math.round(goalProgress)}% achieved</span>
          </div>
          <Progress 
            value={goalProgress} 
            className={`h-2 ${goalProgress >= 100 ? "[&>div]:bg-green-500" : ""}`}
          />
        </motion.div>

        {/* Resumes Analyzed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-4 border-t border-border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{resumesThisWeek}</p>
              <p className="text-xs text-muted-foreground">Resumes analyzed</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{targetProgress >= 100 ? "🎯" : ""} {weeklyTarget} target</p>
              <p className="text-xs text-muted-foreground">
                {resumesThisWeek >= weeklyTarget ? "Goal reached!" : `${weeklyTarget - resumesThisWeek} more to go`}
              </p>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
