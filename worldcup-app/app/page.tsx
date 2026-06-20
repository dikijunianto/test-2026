import Link from "next/link";
import { readJSON } from "@/lib/data/data-reader";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "World Cup Simulator 2026", description: "Simulate FIFA World Cup 2026 matches, view live standings, and predict the knockout bracket champion." };

export default function HomePage() {
  let hasData = false;
  try { const competition = readJSON<{ id: number }>("competition.json"); hasData = competition.id > 0; } catch {}
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "World Cup Simulator 2026", description: "Simulate FIFA World Cup 2026 matches, standings, and knockout brackets.", url: "https://worldcup-simulator.vercel.app", applicationCategory: "SportsApplication", operatingSystem: "Web" }) }} /><div className="max-w-4xl mx-auto px-4 py-16 text-center"><h1 className="text-5xl font-bold text-white mb-6">🏆 World Cup Simulator</h1><p className="text-xl text-blue-100 mb-12">Simulate matches, predict standings, and choose your champion for FIFA World Cup 2026</p><div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"><Link href="/standings" className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"><div className="text-4xl mb-3">📊</div><h2 className="text-lg font-semibold text-gray-800">Standings</h2><p className="text-gray-500 text-sm">View group stage standings</p></Link><Link href="/simulator" className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"><div className="text-4xl mb-3">⚡</div><h2 className="text-lg font-semibold text-gray-800">Simulator</h2><p className="text-gray-500 text-sm">Change scores and see live updates</p></Link><Link href="/bracket" className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"><div className="text-4xl mb-3">🏅</div><h2 className="text-lg font-semibold text-gray-800">Bracket</h2><p className="text-gray-500 text-sm">Predict the knockout champion</p></Link></div>{!hasData && (<Link href="/admin/sync" className="inline-block bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">⚙️ Sync Data First</Link>)}</div></div>
  );
}