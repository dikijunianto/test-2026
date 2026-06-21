// components/GroupTabs.tsx
"use client";

import { useState, type ReactNode } from "react";
import type { Group } from "@/lib/providers/types";

interface GroupTabsProps {
  groups: Group[];
  children: (groupCode: string) => ReactNode;
}

export function GroupTabs({ groups, children }: GroupTabsProps) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.code ?? "A");

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {groups.map((group) => (
          <button
            key={group.code}
            onClick={() => setActiveGroup(group.code)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeGroup === group.code
                ? "bg-purple-600 text-white"
                : "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50"
            }`}
          >
            GROUP_{group.code}
          </button>
        ))}
      </div>
      <div>{children(activeGroup)}</div>
    </div>
  );
}
