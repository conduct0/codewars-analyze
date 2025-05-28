import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Challenge, ChallengesResponse } from "./services";
import type { DayData } from "@/components/ActivityHeatmap";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const processDataForHeatmap = (
  year: number,
  challenges: Challenge[],
): DayData[][] => {
  if (!challenges?.length) return [];

  const activityMap = new Map<string, number>();
  challenges.forEach((challenge) => {
    const date = new Date(challenge.completedAt);

    if (date.getFullYear() === year) {
      const dateString = date.toISOString().split("T")[0];
      activityMap.set(dateString, (activityMap.get(dateString) || 0) + 1);
    }
  });

  const months: DayData[][] = [];
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthData: DayData[] = [];

    // We go over extra days to show them differently
    for (let day = 1; day <= 31; day++) {
      if (day <= daysInMonth) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split("T")[0];

        monthData.push({
          date: dateString,
          challenges: activityMap.get(dateString) || 0,
          day,
          month,
        });
      } else {
        monthData.push({
          date: "",
          challenges: 0,
          day,
          month,
        });
      }
    }
    months.push(monthData);
  }

  return months;
};
export const getAvailableYears = (
  challengesData: ChallengesResponse | undefined,
): number[] => {
  if (!challengesData?.data?.length) return [];

  let currentYear = new Date().getFullYear();
  let startYear = currentYear;
  challengesData.data.forEach((challenge: Challenge) => {
    const year = new Date(challenge.completedAt).getFullYear();
    if (year < startYear) {
      startYear = year;
    }
  });

  return Array.from({ length: currentYear - startYear + 1 }).map(
    (_, index) => startYear + index,
  );
};

export const calculateYearStats = (
  challengesData: ChallengesResponse | undefined,
  selectedYear: number,
) => {
  if (!challengesData?.data?.length) return { total: 0, days: 0 };

  const yearChallenges = challengesData.data.filter((challenge: Challenge) =>
    challenge.completedAt.startsWith(selectedYear.toString()),
  );

  const uniqueDays = new Set<string>();
  yearChallenges.forEach((challenge: Challenge) => {
    uniqueDays.add(challenge.completedAt.split("T")[0]);
  });

  const [longestStreak, longestStreakDates] =
    calculateLongestStreak(uniqueDays);
  return {
    total: yearChallenges.length,
    days: uniqueDays.size,
    longestStreak,
    longestStreakDates,
  };
};

function getDateStem(date: Date | undefined) {
  if (!date) return;
  return date.toISOString().split("T")[0];
}
function calculateLongestStreak(uniqueDays: Set<string>): [number, string[]] {
  const dates = Array.from(uniqueDays).sort();
  if (dates.length <= 1) return [dates.length, dates];

  let longest = 1,
    longestDates = [dates[0]];
  let current = 1,
    currentDates = [dates[0]];

  for (let i = 1; i < dates.length; i++) {
    const daysDiff =
      (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysDiff === 1) {
      currentDates.push(dates[i]);
      if (++current > longest) {
        longest = current;
        longestDates = [...currentDates];
      }
    } else {
      current = 1;
      currentDates = [dates[i]];
    }
  }

  return [longest, longestDates];
}
