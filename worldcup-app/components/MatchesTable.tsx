// components/MatchesTable.tsx
"use client";

import type { Match, Team } from "@/lib/providers/types";

interface MatchesTableProps {
  matches: Match[];
  teams: Team[];
  limit?: number;
}

export function MatchesTable({ matches, teams, limit }: MatchesTableProps) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const displayMatches = limit ? matches.slice(0, limit) : matches;

  function formatDate(utcDate: string): string {
    return new Date(utcDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function formatTime(utcDate: string): string {
    return new Date(utcDate).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
              Date
            </th>
            <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
              Group
            </th>
            <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
              Home
            </th>
            <th className="py-2 px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              Score
            </th>
            <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
              Away
            </th>
          </tr>
        </thead>
        <tbody>
          {displayMatches.map((match) => {
            const homeTeam = teamMap.get(match.homeTeamId);
            const awayTeam = teamMap.get(match.awayTeamId);
            const isFinished = match.status === "finished";

            return (
              <tr
                key={match.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="py-2 px-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(match.utcDate)}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {formatTime(match.utcDate)}
                  </div>
                </td>
                <td className="py-2 px-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {match.group}
                  </span>
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    {homeTeam?.crest && (
                      <img src={homeTeam.crest} alt="" className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {homeTeam?.name ?? "TBD"}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 text-center">
                  {isFinished ? (
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {match.homeScore} - {match.awayScore}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      vs
                    </span>
                  )}
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    {awayTeam?.crest && (
                      <img src={awayTeam.crest} alt="" className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {awayTeam?.name ?? "TBD"}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {displayMatches.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No matches available
        </div>
      )}
    </div>
  );
}
