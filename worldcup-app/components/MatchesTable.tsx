// components/MatchesTable.tsx
import type { Match, Team } from "@/lib/providers/types";

interface MatchesTableProps {
  matches: Match[];
  teams: Team[];
  limit?: number;
}

function formatDate(utcDate: string): string {
  const d = new Date(utcDate);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(utcDate: string): string {
  const d = new Date(utcDate);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function StatusBadge({
  status,
  utcDate,
}: {
  status: Match["status"];
  utcDate: string;
}) {
  if (status === "finished") {
    return (
      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
        FT
      </span>
    );
  }
  if (status === "live") {
    return (
      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded animate-pulse">
        LIVE
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded">
      {formatTime(utcDate)}
    </span>
  );
}

export function MatchesTable({ matches, teams, limit }: MatchesTableProps) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const displayMatches = limit ? matches.slice(0, limit) : matches;

  if (displayMatches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No matches available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Group
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
              Home
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase w-20">
              Score
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Away
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {displayMatches.map((match) => {
            const homeTeam = teamMap.get(match.homeTeamId);
            const awayTeam = teamMap.get(match.awayTeamId);
            return (
              <tr
                key={match.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-2.5 text-sm text-gray-500 whitespace-nowrap">
                  {formatDate(match.utcDate)}
                </td>
                <td className="px-3 py-2.5 text-sm text-gray-500">
                  {match.group || "-"}
                </td>
                <td className="px-3 py-2.5 text-sm text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium text-gray-900">
                      {homeTeam?.name ?? "TBD"}
                    </span>
                    {homeTeam?.crest && (
                      <img
                        src={homeTeam.crest}
                        alt=""
                        className="w-5 h-5"
                      />
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {match.status !== "scheduled" ? (
                    <span className="text-sm font-bold text-gray-900">
                      {match.homeScore} - {match.awayScore}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">vs</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    {awayTeam?.crest && (
                      <img
                        src={awayTeam.crest}
                        alt=""
                        className="w-5 h-5"
                      />
                    )}
                    <span className="font-medium text-gray-900">
                      {awayTeam?.name ?? "TBD"}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <StatusBadge status={match.status} utcDate={match.utcDate} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
