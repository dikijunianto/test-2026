// app/page.tsx
import Link from "next/link";
import { readJSON } from "@/lib/data/data-reader";
import type { Match, Team, Standing } from "@/lib/providers/types";
import { MatchesTable } from "@/components/MatchesTable";
import { StandingsTable } from "@/components/StandingsTable";

export default function HomePage() {
  let matches: Match[] = [];
  let teams: Team[] = [];
  let standings: Standing[] = [];
  let hasData = false;

  try {
    const competition = readJSON<{ id: number }>("competition.json");
    hasData = competition.id > 0;

    if (hasData) {
      matches = readJSON<Match[]>("matches.json");
      teams = readJSON<Team[]>("teams.json");
      standings = readJSON<Standing[]>("standings.json");
    }
  } catch {
    // No data
  }

  // Sort matches: live first, then scheduled by date, then finished
  const sortedMatches = [...matches].sort((a, b) => {
    const statusOrder = { live: 0, scheduled: 1, finished: 2 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
  });

  // Sort standings by points
  const sortedStandings = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🏆 World Cup 2026</h1>
              <p className="text-blue-100">
                Simulate matches, predict standings, and choose your champion
              </p>
            </div>
            {!hasData && (
              <Link
                href="/admin/sync"
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                ⚙️ Sync Data
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {hasData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Matches Table - 2 columns */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  ⚽ Recent Matches
                </h2>
                <Link
                  href="/matches"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All →
                </Link>
              </div>
              <MatchesTable
                matches={sortedMatches}
                teams={teams}
                limit={10}
              />
            </div>

            {/* Standings Preview - 1 column */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  📊 Top Standings
                </h2>
                <Link
                  href="/standings"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All →
                </Link>
              </div>
              {sortedStandings.length > 0 ? (
                <div className="space-y-2">
                  {sortedStandings.slice(0, 10).map((standing, index) => {
                    const team = teams.find((t) => t.id === standing.teamId);
                    return (
                      <div
                        key={standing.teamId}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500 w-5">
                            {index + 1}
                          </span>
                          {team?.crest && (
                            <img
                              src={team.crest}
                              alt=""
                              className="w-5 h-5"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {team?.name ?? "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500">
                            {standing.played}P
                          </span>
                          <span className="font-bold text-gray-900">
                            {standing.points}pts
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No standings data
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to World Cup Simulator
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Sync data from Football-Data.org to view standings, simulate
              matches, and predict the knockout bracket.
            </p>
            <Link
              href="/admin/sync"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              ⚙️ Sync Data First
            </Link>
          </div>
        )}
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "World Cup Simulator 2026",
            description:
              "Simulate FIFA World Cup 2026 matches, standings, and knockout brackets.",
            url: "https://worldcup-simulator.vercel.app",
            applicationCategory: "SportsApplication",
            operatingSystem: "Web",
          }),
        }}
      />
    </div>
  );
}
