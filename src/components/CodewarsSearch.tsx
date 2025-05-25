import { useState, useEffect, type JSX } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trophy, Users, Code, Star, Award, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import CompletedChallenges from "./ChallengesList";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import React from "react";
import ActivityHeatmap from "./ActivityHeatmap";

interface Rank {
  rank: number;
  name: string;
  color: "white" | "yellow" | "blue" | "purple" | "black" | "red";
  score: number;
}

interface Ranks {
  overall: Rank;
  languages: Record<string, Rank>;
}

interface CodeChallenges {
  totalAuthored: number;
  totalCompleted: number;
}

interface UserProfile {
  username: string;
  name?: string;
  honor: number;
  clan?: string;
  leaderboardPosition?: number;
  skills?: string[];
  ranks: Ranks;
  codeChallenges: CodeChallenges;
}

interface ApiError {
  message: string;
  status?: number;
}

async function getUserProfile(username: string): Promise<UserProfile> {
  const response = await fetch(
    `https://www.codewars.com/api/v1/users/${username}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  return await response.json();
}

function CodewarsSearch() {
  const [username, setUsername] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Get username from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlUsername = urlParams.get("user");

    if (urlUsername) {
      setUsername(urlUsername);
      setSearchTerm(urlUsername);
    }
  }, []);

  // Update URL when searchTerm changes
  useEffect(() => {
    if (searchTerm) {
      const url = new URL(window.location.href);
      url.searchParams.set("user", searchTerm);
      window.history.replaceState({}, "", url.toString());
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete("user");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchTerm]);

  const { isLoading, error, data } = useQuery<UserProfile, ApiError>({
    queryKey: ["user_profile", searchTerm],
    queryFn: () => getUserProfile(searchTerm),
    enabled: Boolean(searchTerm),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const handleSearch = () => {
    if (username.trim()) {
      setSearchTerm(username.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getRankColor = (rank?: Rank | null): string => {
    if (!rank?.rank) return "bg-gray-500 text-white";
    switch (Math.abs(rank?.rank)) {
      case 8:
      case 7:
        return "bg-white text-gray-800";
      case 6:
      case 5:
        return "bg-yellow-500 dark:bg-yellow-600 text-white";
      case 4:
      case 3:
        return "bg-blue-500 text-white";
      case 2:
      case 1:
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getRankIcon = (rank?: Rank | null): JSX.Element => {
    if (!rank) return <Target className="w-4 h-4" />;
    const level = rank.name?.toLowerCase();
    if (level?.includes("1") || level?.includes("2"))
      return <Award className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  const sortedLanguages = React.useMemo(() => {
    if (
      data?.ranks?.languages &&
      Object.keys(data.ranks.languages).length > 0
    ) {
      return Object.entries(data.ranks.languages)
        .map(([lang, rank]) => ({ lang, ...rank }))
        .sort((a, b) => b.rank - a.rank);
    } else return [];
  }, [data?.ranks?.languages]);

  return (
    <div className="min-h-screen ">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent drop-shadow-2xl">
              Codewars Analyze
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
              Search for a Codewars user and get improved stats.
            </p>
          </div>

          <div className="flex gap-3 w-full max-w-lg mx-auto">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Enter username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-lg py-6 pl-8 pr-6 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-md">
                @
              </div>
            </div>
            <Button
              onClick={handleSearch}
              size="icon"
              className="p-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
              disabled={isLoading}
            >
              <Search className="h-6 w-6" />
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                <p className="text-lg font-medium">Searching the dojo...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-700 dark:text-red-400 text-lg font-medium">
                  Warrior not found in the dojo
                </p>
                <p className="text-red-600 dark:text-red-300/70 text-sm mt-2">
                  Check the username and try again
                </p>
              </div>
            </div>
          )}

          {data && !isLoading && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                <div className="text-center md:text-left">
                  <h2 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                    {data.username}
                  </h2>
                  {data.name && (
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      {data.name}
                    </p>
                  )}
                  {data.clan && (
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                      <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">
                        Clan: {data.clan}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6 text-center">
                  <CardContent className="flex justify-center flex-col items-center">
                    <Trophy className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {data.leaderboardPosition
                        ? `#${data.leaderboardPosition.toLocaleString()}`
                        : "N/A"}
                    </div>
                    <div className="text-blue-700 dark:text-blue-300/80 font-medium">
                      Global Rank
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-6 text-center text-yellow-500 dark:text-yellow-400">
                  <CardContent className="flex justify-center flex-col items-center">
                    <Star className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                      {data.honor?.toLocaleString() || 0}
                    </div>
                    <div className="text-yellow-700 dark:text-yellow-300/80 font-medium">
                      Honor Points
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Challenge Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">
                          Completed:
                        </span>
                        <span className="text-gray-900 dark:text-white font-bold">
                          {data.codeChallenges?.totalCompleted || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">
                          Authored:
                        </span>
                        <span className="text-gray-900 dark:text-white font-bold">
                          {data.codeChallenges?.totalAuthored || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Overall Rank</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div
                        className={`${getRankColor(data.ranks.overall)} rounded-lg p-3 flex items-center justify-center`}
                      >
                        {getRankIcon(data.ranks.overall)}
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {data.ranks.overall.name || "Unranked"}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Score: {data.ranks.overall?.score || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {sortedLanguages.length > 0 && (
                <div className="mt-6 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Language Ranks
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {sortedLanguages.map((langRank) => (
                      <div
                        key={langRank.lang}
                        className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3 text-center"
                      >
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-1 capitalize">
                          {langRank.lang}
                        </div>
                        <div
                          className={`${getRankColor(langRank)} text-xs font-bold px-2 py-1 rounded inline-flex items-center gap-1`}
                        >
                          {getRankIcon(langRank)}
                          {langRank.name || "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <ActivityHeatmap username={data.username} />
              <CompletedChallenges username={data.username} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CodewarsSearch;
