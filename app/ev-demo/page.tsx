"use client";

import { useState, useMemo } from "react";
import { Search, TrendingUp, Filter, ChevronDown } from "lucide-react";

// Mock data for demo
const MOCK_DATA = [
  { id: 1, sport: "NBA", player: "LeBron James", team: "LAL", market: "Points", line: 27.5, selection: "Over", ev: 8.2, bestBook: "DraftKings", bestOdds: -105, fairOdds: -122, gameTime: "7:30 PM ET" },
  { id: 2, sport: "NBA", player: "Stephen Curry", team: "GSW", market: "3-Pointers Made", line: 5.5, selection: "Over", ev: 6.4, bestBook: "FanDuel", bestOdds: +105, fairOdds: -108, gameTime: "10:00 PM ET" },
  { id: 3, sport: "NFL", player: "Patrick Mahomes", team: "KC", market: "Pass Yards", line: 285.5, selection: "Over", ev: 5.8, bestBook: "BetMGM", bestOdds: -110, fairOdds: -125, gameTime: "4:25 PM ET" },
  { id: 4, sport: "MLB", player: "Shohei Ohtani", team: "LAD", market: "Strikeouts", line: 8.5, selection: "Over", ev: 5.1, bestBook: "Caesars", bestOdds: -115, fairOdds: -130, gameTime: "1:10 PM ET" },
  { id: 5, sport: "NBA", player: "Nikola Jokic", team: "DEN", market: "Rebounds", line: 12.5, selection: "Over", ev: 4.9, bestBook: "PointsBet", bestOdds: -108, fairOdds: -120, gameTime: "9:00 PM ET" },
  { id: 6, sport: "NHL", player: "Connor McDavid", team: "EDM", market: "Points", line: 1.5, selection: "Over", ev: 4.5, bestBook: "BetRivers", bestOdds: +115, fairOdds: -102, gameTime: "8:00 PM ET" },
  { id: 7, sport: "NBA", player: "Luka Doncic", team: "DAL", market: "Assists", line: 8.5, selection: "Over", ev: 4.2, bestBook: "DraftKings", bestOdds: -102, fairOdds: -115, gameTime: "8:30 PM ET" },
  { id: 8, sport: "NFL", player: "Travis Kelce", team: "KC", market: "Receiving Yards", line: 65.5, selection: "Over", ev: 3.8, bestBook: "FanDuel", bestOdds: -112, fairOdds: -125, gameTime: "4:25 PM ET" },
  { id: 9, sport: "NBA", player: "Anthony Edwards", team: "MIN", market: "Points", line: 25.5, selection: "Over", ev: 3.5, bestBook: "BetMGM", bestOdds: -108, fairOdds: -118, gameTime: "8:00 PM ET" },
  { id: 10, sport: "MLB", player: "Aaron Judge", team: "NYY", market: "Total Bases", line: 1.5, selection: "Over", ev: 3.2, bestBook: "Caesars", bestOdds: -135, fairOdds: -150, gameTime: "7:05 PM ET" },
  { id: 11, sport: "NBA", player: "Jayson Tatum", team: "BOS", market: "Points + Rebounds", line: 35.5, selection: "Over", ev: 2.9, bestBook: "DraftKings", bestOdds: -110, fairOdds: -120, gameTime: "7:30 PM ET" },
  { id: 12, sport: "NHL", player: "Auston Matthews", team: "TOR", market: "Shots on Goal", line: 4.5, selection: "Over", ev: 2.5, bestBook: "PointsBet", bestOdds: -105, fairOdds: -114, gameTime: "7:00 PM ET" },
  { id: 13, sport: "NFL", player: "Ja'Marr Chase", team: "CIN", market: "Receiving Yards", line: 75.5, selection: "Over", ev: 2.2, bestBook: "BetRivers", bestOdds: -108, fairOdds: -116, gameTime: "1:00 PM ET" },
  { id: 14, sport: "NBA", player: "Shai Gilgeous-Alexander", team: "OKC", market: "Points", line: 30.5, selection: "Over", ev: 1.8, bestBook: "FanDuel", bestOdds: -112, fairOdds: -120, gameTime: "8:00 PM ET" },
  { id: 15, sport: "MLB", player: "Mookie Betts", team: "LAD", market: "Hits + Runs + RBIs", line: 2.5, selection: "Over", ev: 1.5, bestBook: "BetMGM", bestOdds: +102, fairOdds: -105, gameTime: "4:10 PM ET" },
];

const SPORTS = ["All Sports", "NBA", "NFL", "MLB", "NHL"];
const MARKETS = ["All Markets", "Points", "Rebounds", "Assists", "3-Pointers Made", "Pass Yards", "Receiving Yards", "Strikeouts", "Shots on Goal", "Total Bases", "Hits + Runs + RBIs", "Points + Rebounds"];
const MIN_EV_OPTIONS = [0, 1, 2, 3, 5];

const BOOK_COLORS: Record<string, string> = {
  DraftKings: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  FanDuel: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  BetMGM: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Caesars: "bg-red-500/20 text-red-400 border-red-500/30",
  PointsBet: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  BetRivers: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

function formatOdds(odds: number): string {
  return odds >= 0 ? `+${odds}` : `${odds}`;
}

export default function EVDemoPage() {
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [selectedMarket, setSelectedMarket] = useState("All Markets");
  const [minEV, setMinEV] = useState(0);

  const filteredData = useMemo(() => {
    return MOCK_DATA.filter((row) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          row.player.toLowerCase().includes(searchLower) ||
          row.team.toLowerCase().includes(searchLower) ||
          row.market.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Sport filter
      if (selectedSport !== "All Sports" && row.sport !== selectedSport) {
        return false;
      }

      // Market filter
      if (selectedMarket !== "All Markets" && row.market !== selectedMarket) {
        return false;
      }

      // Min EV filter
      if (row.ev < minEV) {
        return false;
      }

      return true;
    });
  }, [search, selectedSport, selectedMarket, minEV]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">+EV Optimizer</h1>
              <p className="text-sm text-zinc-500">Find positive expected value bets</p>
            </div>
            <div className="ml-auto px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium">
              {filteredData.length} opportunities
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search player, team..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            {/* Sport Filter */}
            <div className="relative">
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 cursor-pointer"
              >
                {SPORTS.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>

            {/* Market Filter */}
            <div className="relative">
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 cursor-pointer"
              >
                {MARKETS.map((market) => (
                  <option key={market} value={market}>
                    {market}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>

            {/* Min EV Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-400">Min EV:</span>
              <div className="flex gap-1">
                {MIN_EV_OPTIONS.map((ev) => (
                  <button
                    key={ev}
                    onClick={() => setMinEV(ev)}
                    className={`px-2.5 py-1 rounded-md text-sm font-medium transition-colors ${
                      minEV === ev
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {ev}%+
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">EV%</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sport</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Selection</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Line</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Market</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Best Book</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Odds</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Fair Odds</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Game Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredData.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-zinc-800/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-sm font-bold ${
                        row.ev >= 5
                          ? "bg-emerald-500/20 text-emerald-400"
                          : row.ev >= 3
                          ? "bg-lime-500/20 text-lime-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      +{row.ev.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-zinc-300">{row.sport}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-100">{row.player}</span>
                      <span className="text-xs text-zinc-500">{row.team}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-zinc-200">
                      {row.selection} {row.line}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-zinc-400">{row.market}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${
                        BOOK_COLORS[row.bestBook] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                      }`}
                    >
                      {row.bestBook}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-emerald-400">
                      {formatOdds(row.bestOdds)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-zinc-500">{formatOdds(row.fairOdds)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-zinc-500">{row.gameTime}</span>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-zinc-500">
                    No opportunities match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-xs text-zinc-600">
          Demo data for preview purposes. Connect to see live odds.
        </div>
      </div>
    </div>
  );
}
