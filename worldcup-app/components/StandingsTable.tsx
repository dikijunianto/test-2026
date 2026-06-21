// components/StandingsTable.tsx
"use client";

import type { Standing, Team } from "@/lib/providers/types";

interface StandingsTableProps {
  standings: Standing[];
  teams: Team[];
}

export function StandingsTable({ standings, teams }: StandingsTableProps) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  // Sort by points, then goal difference, then goals for
  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              #
            </th>
            <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Team
            </th>
            <th className="py-3 px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              P
            </th>
            <th className="py-3 px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              W
            </th>
            <th className="py-3 px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              D
            </th>
            <th className="py-3 px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              L
            </th>
            <th className="py-3 px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              GF
            </th>
            <th className="py-3 px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              GA
            </th>
            <th className="py-3 px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              GD
            </th>
            <th className="py-3 px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              PTS
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((standing, index) => {
            const team = teamMap.get(standing.teamId);
            return (
              <tr
                key={standing.teamId}
                className={`border-b border-gray-100 dark:border-gray-700 ${
                  index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"
                }`}
              >
                <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">
                  {index + 1}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    {team?.crest && (
                      <img src={team.crest} alt="" className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {team?.name ?? "Unknown"}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 text-sm text-center text-gray-900 dark:text-white">
                  {standing.played}
                </td>
                <td className="py-3 px-2 text-sm text-center text-gray-900 dark:text-white">
                  {standing.wins}
                </td>
                <td className="py-3 px-2 text-sm text-center text-gray-900 dark:text-white">
                  {standing.draws}
                </td>
                <td className="py-3 px-2 text-sm text-center text-gray-900 dark:text-white">
                  {standing.losses}
                </td>
                <td className="py-3 px-2 text-sm text-center text-gray-900 dark:text-white">
                  {standing.goalsFor}
                </td>
                <td className="py-3 px-2 text-sm text-center text-gray-900 dark:text-white">
                  {standing.goalsAgainst}
                </td>
                <td className="py-3 px-2 text-sm text-center text-gray-900 dark:text-white">
                  {standing.goalDifference > 0 ? "+" : ""}{standing.goalDifference}
                </td>
                <td className="py-3 px-2 text-sm text-center font-bold text-gray-900 dark:text-white">
                  {standing.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
