import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ApexCharts from "apexcharts";
import {
  fetchAllCompletedChallenges,
  type Challenge,
  type ChallengesResponse,
} from "@/lib/services";
import { useTheme } from "@/components/ThemeProvider";
import {
  calculateYearStats,
  getAvailableYears,
  getColorRanges,
  processHeatmapData,
} from "@/lib/utils";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

const createTooltipContent = (
  series: any,
  seriesIndex: number,
  dataPointIndex: number,
  selectedYear: number,
  isDarkMode: boolean,
) => {
  const count = series[seriesIndex][dataPointIndex];
  const date = new Date(selectedYear, seriesIndex, dataPointIndex + 1);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `
    <div class="px-3 py-2 ${
      isDarkMode
        ? "bg-gray-800 border-gray-600 text-white"
        : "bg-white border-gray-200 text-gray-900"
    } border rounded shadow-lg">
      <div class="font-medium">${dateStr}</div>
      <div class="text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}">
        ${count} challenge${count !== 1 ? "s" : ""}
      </div>
    </div>
  `;
};

export interface HeatmapDataPoint {
  x: number;
  y: number;
}

export interface HeatmapSeries {
  name: string;
  data: HeatmapDataPoint[];
}

export interface YearStats {
  total: number;
  days: number;
}

interface ActivityHeatmapProps {
  username: string;
  defaultYear?: number;
  height?: number;
  onYearChange?: (year: number) => void;
  onError?: (error: Error) => void;
}

function ActivityHeatmap({
  username,
  defaultYear = new Date().getFullYear(),
  height = 280,
  onYearChange,
  onError,
}: ActivityHeatmapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ApexCharts | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
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

  useEffect(() => {
    if (error) {
      console.error("Failed to fetch challenges:", error);
      onError?.(error);
    }
  }, [error, onError]);

  const processHeatmapDataCallback = useCallback(
    (year: number, challenges: Challenge[]) =>
      processHeatmapData(year, challenges),
    [],
  );

  const availableYears = useMemo(
    () => getAvailableYears(challengesData),
    [challengesData],
  );

  const yearStats = useMemo(
    () => calculateYearStats(challengesData, selectedYear),
    [challengesData, selectedYear],
  );

  const heatmapData = useMemo(
    () => processHeatmapDataCallback(selectedYear, challengesData?.data || []),
    [selectedYear, challengesData?.data, processHeatmapDataCallback],
  );

  const handleYearChange = useCallback(
    (newYear: number) => {
      setSelectedYear(newYear);
      onYearChange?.(newYear);
    },
    [onYearChange],
  );

  const chartOptions = useMemo((): ApexCharts.ApexOptions | null => {
    if (!heatmapData.length) return null;

    const maxValue = Math.max(
      ...heatmapData.flatMap((month) => month.data.map((day) => day.y)),
    );

    return {
      series: heatmapData,
      chart: {
        height,
        width: "100%",
        type: "heatmap",
        toolbar: { show: false },
        animations: { enabled: false },
        redrawOnParentResize: true,
        redrawOnWindowResize: true,
        zoom: { enabled: false },
        selection: { enabled: false },
      },

      dataLabels: { enabled: false },
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          colorScale: {
            ranges: getColorRanges(maxValue, isDarkMode),
          },
        },
      },
      stroke: {
        colors: [isDarkMode ? "#1d2430" : "#FFF"],
      },
      xaxis: {
        type: "numeric",
        min: 1,
        max: 31,
        labels: {
          show: true,
          formatter: (val: string) => val,
          style: {
            colors: isDarkMode ? "#9ca3af" : "#6b7280",
            fontSize: "12px",
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: true,
          style: {
            colors: isDarkMode ? "#9ca3af" : "#6b7280",
            fontSize: "12px",
          },
        },
      },
      grid: {
        show: false,
      },
      tooltip: {
        custom: ({ series, seriesIndex, dataPointIndex }: any) =>
          createTooltipContent(
            series,
            seriesIndex,
            dataPointIndex,
            selectedYear,
            isDarkMode,
          ),
        theme: isDarkMode ? "dark" : "light",
      },
      legend: { show: false },
    };
  }, [heatmapData, height, selectedYear, isDarkMode]);

  const createChart = useCallback(
    (options: ApexCharts.ApexOptions) => {
      if (!chartRef.current) return;

      try {
        if (chartInstance.current) {
          chartInstance.current.destroy();
          chartInstance.current = null;
        }
        chartInstance.current = new ApexCharts(chartRef.current, options);
        return chartInstance.current.render();
      } catch (error) {
        console.error("Failed to render chart:", error);
        onError?.(new Error("Failed to render chart"));
      }
    },
    [onError],
  );

  useEffect(() => {
    if (!chartOptions || !challengesData?.data?.length) return;

    createChart(chartOptions);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [chartOptions, challengesData, createChart]);

  useEffect(() => {
    const handleResize = () => {
      if (
        chartInstance.current &&
        "windowResizeHandler" in chartInstance.current
      ) {
        (chartInstance.current as any).windowResizeHandler();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, []);

  // Early returns using new state components
  if (!username) {
    return (
      <EmptyState
        message="Please provide a username to display activity data."
        title="Activity Heatmap"
      />
    );
  }

  if (isLoading) {
    return <LoadingState title="Activity Heatmap" height={height} />;
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
    <Card className={"mt-6"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Activity Heatmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextIndex = Math.min(
                  currentYearIndex + 1,
                  availableYears.length - 1,
                );
                handleYearChange(availableYears[nextIndex]);
              }}
              disabled={currentYearIndex >= availableYears.length - 1}
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
                const prevIndex = Math.max(currentYearIndex - 1, 0);
                handleYearChange(availableYears[prevIndex]);
              }}
              disabled={currentYearIndex <= 0}
              aria-label="Next year"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>{yearStats.total} challenges completed</span>
          <span>{yearStats.days} active days</span>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="w-full overflow-x-auto">
          <div
            ref={chartRef}
            className="w-full min-w-[800px]"
            style={{ minHeight: height, aspectRatio: "2.5/1" }}
            role="img"
            aria-label={`Activity heatmap for ${selectedYear} showing ${yearStats.total} challenges completed over ${yearStats.days} days`}
          />
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div
            className="flex items-center gap-1"
            role="legend"
            aria-label="Activity intensity scale"
          >
            <div
              className={`w-3 h-3 rounded-sm ${
                isDarkMode ? "bg-slate-700" : "bg-slate-100"
              }`}
              title="No activity"
            />
            <div
              className={`w-3 h-3 rounded-sm ${
                isDarkMode ? "bg-emerald-900" : "bg-emerald-200"
              }`}
              title="Low activity"
            />
            <div
              className={`w-3 h-3 rounded-sm ${
                isDarkMode ? "bg-emerald-700" : "bg-emerald-300"
              }`}
              title="Medium activity"
            />
            <div
              className={`w-3 h-3 rounded-sm ${
                isDarkMode ? "bg-emerald-600" : "bg-emerald-400"
              }`}
              title="High activity"
            />
            <div
              className="w-3 h-3 bg-emerald-500 rounded-sm"
              title="Very high activity"
            />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default ActivityHeatmap;
