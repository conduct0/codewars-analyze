import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Code, Calendar, ExternalLink, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ActivityHeatmap from "./ActivityHeatmap";
import {
  fetchAllCompletedChallenges,
  type Challenge,
  type ChallengesResponse,
} from "@/lib/services";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

interface CompletedChallengesProps {
  username: string;
}

function CompletedChallenges({ username }: CompletedChallengesProps) {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [displayedChallenges, setDisplayedChallenges] = useState<Challenge[]>(
    [],
  );

  const { isLoading, error, data } = useQuery<ChallengesResponse, Error>({
    queryKey: ["challenges", username],
    queryFn: () => fetchAllCompletedChallenges(username),
    enabled: Boolean(username),
    refetchOnWindowFocus: false,
    retry: 2,
  });

  useEffect(() => {
    if (data?.data) {
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      setDisplayedChallenges(data.data.slice(startIndex, endIndex));
    }
  }, [data, currentPage, pageSize]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
      javascript: "bg-yellow-500",
      c: "bg-green-700",
      python: "bg-blue-500",
      java: "bg-orange-500",
      ruby: "bg-red-500",
      csharp: "bg-purple-500",
      cpp: "bg-blue-600",
      go: "bg-cyan-500",
      rust: "bg-orange-600",
      typescript: "bg-blue-400",
      haskell: "bg-blue-700",
      php: "bg-indigo-500",
    };
    return colors[language?.toLowerCase()] || "bg-gray-500";
  };

  const getLatestCompletionDate = (): string | null => {
    if (!data?.data?.length) return null;
    return data.data[0]?.completedAt || null;
  };

  const totalDisplayPages = data ? Math.ceil(data.data.length / pageSize) : 0;
  const hasNextPage = currentPage < totalDisplayPages - 1;
  const hasPrevPage = currentPage > 0;

  if (!username) return null;

  if (isLoading) {
    return (
      <LoadingState
        title="Completed Challenges"
        className="mt-6"
        height={300}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load challenges. Please try again."
        title="Completed Challenges"
        className="mt-6"
      />
    );
  }

  if (!data?.data?.length) {
    return (
      <EmptyState
        message="No completed challenges found"
        title="Completed Challenges"
        className="mt-6"
      />
    );
  }

  const latestDate = getLatestCompletionDate();

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-600" />
            Completed Challenges
          </CardTitle>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {latestDate && <span>Last seen on {formatDate(latestDate)}</span>}
            <span>{data.totalItems} total</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {displayedChallenges.length > 0 ? (
          <div className="space-y-2">
            {displayedChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex items-center gap-3 p-4 border rounded-lg bg-gray-100 dark:bg-gray-800/50 hover:bg-muted/50 transition-colors"
              >
                <Code className="w-5 h-5 text-purple-800 dark:text-purple-600 flex-shrink-0 hidden md:inline" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 w-full overflow-auto">
                    <h4 className="text-start font-medium truncate w-full">
                      {challenge.name}
                    </h4>
                  </div>

                  <div className="flex items-center  flex-row gap-1">
                    <div className="flex items-center  gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(challenge.completedAt)}
                    </div>
                    {challenge.completedLanguages &&
                      challenge.completedLanguages.length > 0 &&
                      challenge.completedLanguages.map((lang) => (
                        <Badge
                          className={`${getLanguageColor(lang)} text-white text-xs`}
                        >
                          {lang}
                        </Badge>
                      ))}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `https://www.codewars.com/kata/${challenge.slug}`,
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No completed challenges found</p>
          </div>
        )}

        {totalDisplayPages > 1 && (
          <div className="flex items-center justify-center pt-4 border-t flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={!hasPrevPage}
              >
                Prev
              </Button>

              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage + 1} of {totalDisplayPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!hasNextPage}
              >
                Next
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(0);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CompletedChallenges;
