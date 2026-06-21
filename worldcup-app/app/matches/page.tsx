// app/matches/page.tsx
import { readJSON } from "@/lib/data/data-reader";
import type { Match, Team } from "@/lib/providers/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Schedule & Results",
  description:
    "View all FIFA World Cup 2026 match schedules, live scores, and results.",
};

export const dynamic = "force-static";

function getTeamName(team: Team | undefined, fallbackId: number): string {
  if (team) return team.name;
  return "Team " + fallbackId;
}

function formatDate(utcDate: string): string {
  return new Date(utcDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function StatusLabel({ match }: { match: Match }) {
  if (match.status === "finished") {
    return <span className="text-xs text-gray-500">FT</span>;
  }
  if (match.status === "live") {
    return <span className="text-xs text-red-500 font-medium">LIVE</span>;
  }
  return <span className="text-xs text-gray-500">{formatDate(match.utcDate)}</span>;
}

export default function MatchesPage() {
  let matches: Match[] = [];
  let teams: Team[] = [];

  try {
    matches = readJSON<Match[]>("matches.json");
    teams = readJSON<Team[]>("teams.json");
  } catch {
    // Data not yet synced
  }

  const teamMap = new Map(teams.map((t) => [t.id, t]));

  // Group matches by group
  const matchesByGroup = new Map<string, Match[]>();
  for (const match of matches) {
    const group = match.group || "Other";
    if (!matchesByGroup.has(group)) {
      matchesByGroup.set(group, []);
    }
    matchesByGroup.get(group)!.push(match);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Matches</h1>

        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No match data available. Please sync data first.
            </p>
            <a
              href="/admin/sync"
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Sync Data
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(matchesByGroup.entries()).map(([group, groupMatches]) => (
              <div key={group} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">{group}</h2>
                <div className="space-y-3">
                  {groupMatches.map((match) => {
                    const homeTeam = teamMap.get(match.homeTeamId);
                    const awayTeam = teamMap.get(match.awayTeamId);
                    const homeName = getTeamName(homeTeam, match.homeTeamId);
                    const awayName = getTeamName(awayTeam, match.awayTeamId);
                    return (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex-1 text-right font-medium">
                          {homeName}
                        </div>
                        <div className="px-4 text-center">
                          <span className="text-lg font-bold">
                            {match.homeScore ?? 0} - {match.awayScore ?? 0}
                          </span>
                          <div>
                            <StatusLabel match={match} />
                          </div>
                        </div>
                        <div className="flex-1 text-left font-medium">
                          {awayName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
