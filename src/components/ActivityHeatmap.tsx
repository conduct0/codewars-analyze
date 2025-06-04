import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  fetchAllCompletedChallenges,
  type Challenge,
  type ChallengesResponse,
} from "@/lib/services";
import { useTheme } from "@/components/ThemeProvider";
import {
  calculateYearStats,
  getAvailableYears,
  processDataForHeatmap,
} from "@/lib/utils";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import Heatmap from "./Heatmap";

export interface DayData {
  date: string;
  challenges: number;
  day: number;
  month: number;
}

interface ActivityHeatmapProps {
  username: string;
  height?: number;
}
function ActivityHeatmap({ username }: ActivityHeatmapProps) {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const {
    data: challengesData,
    isLoading,
    error,
  } = useQuery<ChallengesResponse, Error>({
    queryKey: ["challenges", username],
    queryFn: () => fetchAllCompletedChallenges(username),
    enabled: Boolean(username),
    retry: 1,
  });

  const availableYears = useMemo(
    () => getAvailableYears(challengesData),
    [challengesData],
  );

  const yearStats = useMemo(
    () => calculateYearStats(challengesData, selectedYear),
    [challengesData, selectedYear],
  );

  const heatmapData = useMemo(
    () => processDataForHeatmap(selectedYear, challengesData?.data || []),
    [selectedYear, challengesData?.data],
  );

  const isRecentlyActive = useMemo(() => {
    if (!challengesData?.data?.length) return false;

    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    return challengesData.data.some((challenge: Challenge) => {
      const challengeDate = new Date(challenge.completedAt);
      return challengeDate >= threeDaysAgo;
    });
  }, [challengesData?.data]);

  if (!username) {
    return (
      <EmptyState
        message="Please provide a username to display activity data."
        title="Activity Heatmap"
      />
    );
  }

  if (isLoading) {
    return <LoadingState title="Activity Heatmap" height={280} />;
  }

  if (error) {
    return (
      <ErrorState
        message={
          error.message ||
          "Failed to load activity data. Please try again later."
        }
        title="Activity Heatmap"
      />
    );
  }

  if (!challengesData?.data?.length) {
    return (
      <EmptyState
        message={`No challenge data found for user "${username}".`}
        title="Activity Heatmap"
      />
    );
  }

  const currentYearIndex = availableYears.indexOf(selectedYear);

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 ">
            <Activity className="w-5 h-5 text-purple-600" />
            Activity Heatmap
          </CardTitle>
          {isRecentlyActive && (
            <div className="text-sm font-semibold ">
              🔥 Good work, keep it going!
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const prevIndex = Math.max(currentYearIndex - 1, 0);
                setSelectedYear(availableYears[prevIndex]);
              }}
              disabled={currentYearIndex <= 0}
              aria-label="Previous year"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[4rem] text-center">
              {selectedYear}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextIndex = Math.min(
                  currentYearIndex + 1,
                  availableYears.length - 1,
                );
                setSelectedYear(availableYears[nextIndex]);
              }}
              disabled={currentYearIndex >= availableYears.length - 1}
              aria-label="Next year"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>{yearStats.total} challenges completed</span>
            <span>•</span>
            <span>{yearStats.longestStreak} days is the longest streak</span>
            <span>•</span>
            <span>{yearStats.days} active days</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6">
        <div className="w-full overflow-x-auto">
          <Heatmap
            data={heatmapData}
            isLoading={isLoading}
            isDarkMode={isDarkMode}
            streak={yearStats.longestStreakDates ?? []}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default ActivityHeatmap;
