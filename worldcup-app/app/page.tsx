// app/page.tsx
import Link from "next/link";
import { readJSON } from "@/lib/data/data-reader";
import type { Match, Team, Standing } from "@/lib/providers/types";
import { MatchesTable } from "@/components/MatchesTable";

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🏆 FIFA World Cup 2026
            </h1>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Simulate matches, predict group standings, and choose your
              knockout champion
            </p>

            {!hasData && (
              <Link
                href="/admin/sync"
                className="inline-block bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                ⚙️ Sync Data First
              </Link>
            )}
          </div>

          {/* Quick Stats */}
          {hasData && (
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-xl mx-auto">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{teams.length}</div>
                <div className="text-sm text-purple-200">Teams</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{matches.length}</div>
                <div className="text-sm text-purple-200">Matches</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">
                  {matches.filter((m) => m.status === "finished").length}
                </div>
                <div className="text-sm text-purple-200">Played</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {hasData ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                ⚽ Recent Matches
              </h2>
              <Link
                href="/simulator"
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 font-medium"
              >
                View Group Stage →
              </Link>
            </div>
            <MatchesTable matches={sortedMatches} teams={teams} limit={15} />
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to World Cup Simulator
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Sync data from Football-Data.org to view standings, simulate
              matches, and predict the knockout bracket.
            </p>
            <Link
              href="/admin/sync"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
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
