"use client";
import { useState } from "react";
import type { Group } from "@/lib/providers/types";

interface GroupTabsProps { groups: Group[]; children: (groupCode: string) => React.ReactNode }

export function GroupTabs({ groups, children }: GroupTabsProps) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.code ?? "Group A");
  return (
    <div><div className="flex flex-wrap gap-2 mb-4">{groups.map((group) => (<button key={group.code} onClick={() => setActiveGroup(group.code)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeGroup === group.code ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{group.code}</button>))}</div><div>{children(activeGroup)}</div></div>
  );
}