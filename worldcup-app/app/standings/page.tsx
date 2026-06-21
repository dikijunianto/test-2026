// app/standings/page.tsx
import { readJSON } from "@/lib/data/data-reader";
import type { Standing, Team, Group, Match } from "@/lib/providers/types";
import { StandingsPageClient } from "./StandingsPageClient";

export const dynamic = "force-static";

export default function StandingsPage() {
  let standings: Standing[] = [];
  let teams: Team[] = [];
  let groups: Group[] = [];
  let matches: Match[] = [];

  try {
    standings = readJSON<Standing[]>("standings.json");
    teams = readJSON<Team[]>("teams.json");
    groups = readJSON<Group[]>("groups.json");
    matches = readJSON<Match[]>("matches.json");
  } catch {
    // Data not yet synced
  }

  if (standings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-6">Group Stage</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No standings data available. Please sync data first.
            </p>
            <a
              href="/admin/sync"
              className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Sync Data
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StandingsPageClient
      standings={standings}
      teams={teams}
      groups={groups}
      matches={matches}
    />
  );
}
