// app/standings/StandingsPageClient.tsx
"use client";

import { useState, useEffect } from "react";
import type { Standing, Team, Group, Match } from "@/lib/providers/types";
import { StandingsClient } from "./StandingsClient";
import { KnockoutStageClient } from "./KnockoutStageClient";

interface StandingsPageClientProps {
  standings: Standing[];
  teams: Team[];
  groups: Group[];
  matches: Match[];
}

export function StandingsPageClient({
  standings,
  teams,
  groups,
  matches,
}: StandingsPageClientProps) {
  const [activeTab, setActiveTab] = useState<"group" | "knockout">("group");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "knockout") {
      setActiveTab("knockout");
    }
  }, []);

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
