import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, DollarSign, ExternalLink, Star } from "lucide-react";
import { motion } from "framer-motion";

interface JobMatch {
  company: string;
  position: string;
  match: number;
  location: string;
  salary: string;
}

interface JobMatchWidgetProps {
  jobs: JobMatch[];
}

export function JobMatchWidget({ jobs }: JobMatchWidgetProps) {
  const topJobs = jobs.slice(0, 3);
  const avgMatch = jobs.length > 0
    ? Math.round(jobs.reduce((acc, j) => acc + j.match, 0) / jobs.length)
    : 0;

  const getMatchColor = (match: number) => {
    if (match >= 85) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    if (match >= 70) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
  };

  return (
    <Card className="shadow-soft hover:shadow-medium transition-smooth">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Top Job Matches
            </CardTitle>
            <CardDescription>Recommended positions for you</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{avgMatch}%</p>
            <p className="text-xs text-muted-foreground">Avg match</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {topJobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Upload a resume to see job matches</p>
          </div>
        ) : (
          <>
            {topJobs.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border border-border hover:border-primary/50 transition-smooth group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {job.position}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      {job.company}
                      {index === 0 && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                    </p>
                  </div>
                  <Badge className={`ml-2 ${getMatchColor(job.match)}`}>
                    {job.match}%
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {job.salary}
                  </span>
                </div>
              </motion.div>
            ))}

            <Button variant="outline" className="w-full" size="sm">
              View All Matches <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
