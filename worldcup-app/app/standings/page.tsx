// app/standings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { readJSON } from "@/lib/data/data-reader";
import type { Standing, Team, Group, Match } from "@/lib/providers/types";
import { StandingsClient } from "./StandingsClient";
import { KnockoutStageClient } from "./KnockoutStageClient";

export default function StandingsPage() {
  const [activeTab, setActiveTab] = useState<"group" | "knockout">("group");
  const [teams, setTeams] = useState<Team[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const loadedTeams = readJSON<Team[]>("teams.json");
      const loadedStandings = readJSON<Standing[]>("standings.json");
      const loadedGroups = readJSON<Group[]>("groups.json");
      const loadedMatches = readJSON<Match[]>("matches.json");

      setTeams(loadedTeams);
      setStandings(loadedStandings);
      setGroups(loadedGroups);
      setMatches(loadedMatches);
    } catch {
      // Data not yet synced
    } finally {
      setLoading(false);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "knockout") {
      setActiveTab("knockout");
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("group")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === "group"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            📊 Group Stage
          </button>
          <button
            onClick={() => setActiveTab("knockout")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === "knockout"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            🏆 Knockout Stage
          </button>
        </div>

        {activeTab === "group" ? (
          <StandingsClient
            groups={groups}
            standings={standings}
            teams={teams}
            matches={matches}
          />
        ) : (
          <KnockoutStageClient
            standings={standings}
            teams={teams}
            groups={groups}
            matches={matches}
          />
        )}
      </div>
    </div>
  );
}
