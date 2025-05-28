import React from "react";

export interface DayData {
  date: string;
  challenges: number;
  day: number;
  month: number;
}

interface HeatmapProps {
  data: DayData[][];
  isLoading: boolean;
  isDarkMode: boolean;
  streak: Array<string | undefined>;
}

const CELL_SIZE = 20;
const CELL_MARGIN = 2;
const MAX_DAYS = 31;
const MONTH_COUNT = 12;
const getFillColor = (challenges: number, isDarkMode: boolean): string => {
  if (challenges === 0) return isDarkMode ? "#1f2937" : "#f9fafb";
  if (challenges <= 2) return "#e0b6fb";
  if (challenges <= 4) return "#cb85f9";
  if (challenges <= 6) return "#a224f4";
  return "#880bdb";
};
const Heatmap: React.FC<HeatmapProps> = ({
  data,
  isLoading,
  isDarkMode,
  streak,
}) => {
  const [dayInfoHover, setDayInfoHover] = React.useState<string | null>(null);
  const months = [
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
  const dayNumbers = React.useMemo(
    () => Array.from({ length: MAX_DAYS }, (_, i) => i + 1),
    [],
  );

  const svgHeight = MONTH_COUNT * (CELL_SIZE + CELL_MARGIN) + 60;
  const svgWidth = MAX_DAYS * (CELL_SIZE + CELL_MARGIN) + 80;

  const emptyData = React.useMemo(
    () =>
      Array.from({ length: MONTH_COUNT }, (_, monthIndex) =>
        Array.from({ length: MAX_DAYS }, (_, dayIndex) => ({
          date: "",
          challenges: 0,
          day: dayIndex + 1,
          month: monthIndex,
        })),
      ),
    [],
  );
  function handleMouseOverDay(day: DayData) {
    const formatDate = new Date(day.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    setDayInfoHover(
      `On ${formatDate}: ${day.challenges} challenge${day.challenges !== 1 ? "s were" : " was"} solved.`,
    );
  }

  function handleMouseOutDay() {
    setDayInfoHover(null);
  }
  function getStrokeColor(day: DayData) {
    let stroke = isDarkMode ? "#1f2937" : "#d1d5db";
    let strokeWidth = 0.4;
    return { stroke: stroke, strokeWidth };
  }
  const displayData = isLoading ? emptyData : data;
  return (
    <div className="heat-map-container relative">
      <svg
        width={svgWidth}
        height={svgHeight}
        className={isDarkMode ? "text-gray-300" : "text-gray-600"}
      >
        <g transform="translate(50, 40)">
          <g>
            {dayNumbers
              .filter((_, index) => index % 5 === 0 || index === 0)
              .map((dayNum, index) => (
                <text
                  key={dayNum}
                  x={(dayNum - 1) * (CELL_SIZE + CELL_MARGIN) + CELL_SIZE / 2}
                  y="-8"
                  fontSize="11"
                  fill="currentColor"
                  textAnchor="middle"
                  className="select-none"
                >
                  {dayNum}
                </text>
              ))}
          </g>

          <g>
            {months.map((month, index) => (
              <text
                key={month}
                x="-10"
                y={index * (CELL_SIZE + CELL_MARGIN) + CELL_SIZE / 2}
                dy=".32em"
                fontSize="11"
                fill="currentColor"
                textAnchor="end"
                className="select-none"
              >
                {month}
              </text>
            ))}
          </g>
          <g>
            {displayData.map((monthData, monthIndex) =>
              monthData.map((day, dayIndex) => (
                <rect
                  key={`${monthIndex}-${dayIndex}`}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseEnter={() => handleMouseOverDay(day)}
                  onMouseOut={handleMouseOutDay}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  x={dayIndex * (CELL_SIZE + CELL_MARGIN)}
                  y={monthIndex * (CELL_SIZE + CELL_MARGIN)}
                  fill={
                    !isLoading && day.date
                      ? getFillColor(day.challenges, isDarkMode)
                      : isDarkMode
                        ? "#374151"
                        : "#e5e7eb"
                  }
                  {...getStrokeColor(day)}
                  rx="2"
                  ry="2"
                  style={{
                    opacity: !day.date ? 0.3 : 1,
                  }}
                />
              )),
            )}
          </g>
        </g>
      </svg>
      <h3 className={`${dayInfoHover ? "visible" : "invisible"} min-h-9`}>
        {dayInfoHover}
      </h3>
    </div>
  );
};
export default Heatmap;
