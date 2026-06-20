// components/StandingsTable.tsx
import type { Standing, Team } from "@/lib/providers/types";

interface StandingsTableProps {
  standings: Standing[];
  teams: Team[];
}

export function StandingsTable({ standings, teams }: StandingsTableProps) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  // Sort standings by points, then goal difference, then goals for
  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Team
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              P
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              W
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              D
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              L
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              GF
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              GA
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              GD
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              PTS
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sorted.map((standing, index) => {
            const team = teamMap.get(standing.teamId);
            return (
              <tr
                key={standing.teamId}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  <div className="flex items-center gap-2">
                    {team?.crest && (
                      <img
                        src={team.crest}
                        alt={team.name}
                        className="w-6 h-6"
                      />
                    )}
                    {team?.name ?? `Team ${standing.teamId}`}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {standing.played}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {standing.wins}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {standing.draws}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {standing.losses}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {standing.goalsFor}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {standing.goalsAgainst}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {standing.goalDifference > 0 ? "+" : ""}
                  {standing.goalDifference}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center font-bold">
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
