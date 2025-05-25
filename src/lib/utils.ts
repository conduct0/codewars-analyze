import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Challenge, ChallengesResponse } from "./services";
import type {
  HeatmapDataPoint,
  HeatmapSeries,
  YearStats,
} from "@/components/ActivityHeatmap";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Helper functions
export const processHeatmapData = (
  year: number,
  challenges: Challenge[],
): HeatmapSeries[] => {
  if (!challenges?.length) return [];

  const activityMap = new Map<string, number>();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    activityMap.set(dateStr, 0);
  }

  challenges.forEach((challenge) => {
    const challengeDate = challenge.completedAt.split("T")[0];
    if (challengeDate.startsWith(year.toString())) {
      activityMap.set(challengeDate, (activityMap.get(challengeDate) || 0) + 1);
    }
  });

  return MONTHS.map((month, monthIndex) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const monthData: HeatmapDataPoint[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const dateStr = date.toISOString().split("T")[0];
      const count = activityMap.get(dateStr) || 0;
      monthData.push({ x: day, y: count });
    }

    return { name: month, data: monthData };
  });
};

export const getAvailableYears = (
  challengesData: ChallengesResponse | undefined,
): number[] => {
  if (!challengesData?.data?.length) return [];

  const years = new Set<number>();
  challengesData.data.forEach((challenge: Challenge) => {
    const year = new Date(challenge.completedAt).getFullYear();
    years.add(year);
  });

  return Array.from(years).sort((a, b) => b - a);
};

export const calculateYearStats = (
  challengesData: ChallengesResponse | undefined,
  selectedYear: number,
): YearStats => {
  if (!challengesData?.data?.length) return { total: 0, days: 0 };

  const yearChallenges = challengesData.data.filter((challenge: Challenge) =>
    challenge.completedAt.startsWith(selectedYear.toString()),
  );

  const uniqueDays = new Set<string>();
  yearChallenges.forEach((challenge: Challenge) => {
    uniqueDays.add(challenge.completedAt.split("T")[0]);
  });

  return {
    total: yearChallenges.length,
    days: uniqueDays.size,
  };
};

// --contribution-default-bgColor-0: #151b23;
//     --contribution-default-bgColor-1: #033a16;
//     --contribution-default-bgColor-2: #196c2e;
//     --contribution-default-bgColor-3: #2ea043;
//     --contribution-default-bgColor-4: #56d364;
export const getColorRanges = (max: number, isDark: boolean) => {
  if (isDark) {
    return [
      { from: 0, to: 0, color: "#151b23", name: "No activity" },
      {
        from: 1,
        to: Math.ceil(max * 0.25) || 1,
        color: "#033a16",
        name: "Low",
      },
      {
        from: Math.ceil(max * 0.25) + 1,
        to: Math.ceil(max * 0.5) || 1,
        color: "#196c2e",
        name: "Medium",
      },
      {
        from: Math.ceil(max * 0.5) + 1,
        to: Math.ceil(max * 0.75) || 1,
        color: "#2ea043",
        name: "High",
      },
      {
        from: Math.ceil(max * 0.75) + 1,
        to: max || 1,
        color: "#56d364",
        name: "Very High",
      },
    ];
  } else {
    return [
      { from: 0, to: 0, color: "#f1f5f9", name: "No activity" },
      {
        from: 1,
        to: Math.ceil(max * 0.25) || 1,
        color: "#a7f3d0",
        name: "Low",
      },
      {
        from: Math.ceil(max * 0.25) + 1,
        to: Math.ceil(max * 0.5) || 1,
        color: "#6ee7b7",
        name: "Medium",
      },
      {
        from: Math.ceil(max * 0.5) + 1,
        to: Math.ceil(max * 0.75) || 1,
        color: "#34d399",
        name: "High",
      },
      {
        from: Math.ceil(max * 0.75) + 1,
        to: max || 1,
        color: "#10b981",
        name: "Very High",
      },
    ];
  }
};
