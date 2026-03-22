"use client";

import { useState, useMemo, useCallback } from "react";
import { usePositiveEV } from "@/hooks/use-positive-ev";
import { useAvailableMarkets } from "@/hooks/use-available-markets";
import { useSubscription } from "@/hooks/use-subscription";
import { AppPageLayout } from "@/components/layout/app-page-layout";
import { Tooltip } from "@/components/tooltip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getSportsbookById } from "@/lib/data/sportsbooks";
import { formatMarketLabel, formatMarketLabelShort } from "@/lib/data/markets";
import { SHARP_PRESETS } from "@/lib/ev/constants";
import type { SharpPreset, PositiveEVOpportunity } from "@/lib/ev/types";
import {
  Search,
  RefreshCw,
  TrendingUp,
  ChevronDown,
  ArrowUpDown,
  ExternalLink,
  Info,
  Filter,
  X,
} from "lucide-react";

// =============================================================================
// Constants
// =============================================================================

const AVAILABLE_SPORTS = ["nba", "nfl", "ncaaf", "ncaab", "mlb", "nhl", "soccer", "tennis", "mma"];

const SPORT_LABELS: Record<string, string> = {
  nba: "NBA",
  nfl: "NFL",
  ncaaf: "NCAAF",
  ncaab: "NCAAB",
  mlb: "MLB",
  nhl: "NHL",
  soccer: "Soccer",
  tennis: "Tennis",
  mma: "MMA",
};

const MIN_EV_OPTIONS = [
  { value: 0, label: "All +EV" },
  { value: 1, label: "1%+" },
  { value: 2, label: "2%+" },
  { value: 3, label: "3%+" },
  { value: 5, label: "5%+" },
];

const SHARP_PRESET_OPTIONS: { value: SharpPreset; label: string }[] = [
  { value: "pinnacle", label: "Pinnacle" },
  { value: "circa", label: "Circa" },
  { value: "pinnacle_circa", label: "Pinnacle + Circa" },
  { value: "market_average", label: "Market Average" },
];

// =============================================================================
// Helpers
// =============================================================================

function formatOdds(price: number | null | undefined): string {
  if (price === null || price === undefined) return "—";
  return price > 0 ? `+${price}` : String(price);
}

function getBookLogo(bookId?: string): string | null {
  if (!bookId) return null;
  const sb = getSportsbookById(bookId);
  return sb?.image?.square || sb?.image?.light || null;
}

function getBookName(bookId?: string): string | null {
  if (!bookId) return null;
  const sb = getSportsbookById(bookId);
  return sb?.name || null;
}

function getBookLink(opp: PositiveEVOpportunity): string | null {
  return opp.book.mobileLink || opp.book.link || null;
}

function normalizeSportsbookId(id: string): string {
  return id.toLowerCase().replace(/[\s_-]+/g, "");
}

function shortenPeriodPrefix(display: string): string {
  return display
    .replace(/^1st Quarter /i, "1Q ")
    .replace(/^2nd Quarter /i, "2Q ")
    .replace(/^3rd Quarter /i, "3Q ")
    .replace(/^4th Quarter /i, "4Q ")
    .replace(/^1st Half /i, "1H ")
    .replace(/^2nd Half /i, "2H ")
    .replace(/^1st Period /i, "1P ")
    .replace(/^2nd Period /i, "2P ")
    .replace(/^3rd Period /i, "3P ");
}

function isMoneylineMarket(market: string, marketDisplay?: string): boolean {
  const m = (market || "").toLowerCase();
  const d = (marketDisplay || "").toLowerCase();
  return (
    m.includes("moneyline") ||
    m.includes("h2h") ||
    d.includes("moneyline") ||
    m === "game_moneyline"
  );
}

function getEvColor(ev: number): string {
  if (ev >= 10) return "text-emerald-600 dark:text-emerald-400";
  if (ev >= 5) return "text-emerald-600 dark:text-emerald-400";
  if (ev >= 3) return "text-emerald-500 dark:text-emerald-400";
  if (ev >= 2) return "text-teal-600 dark:text-teal-400";
  return "text-sky-600 dark:text-sky-400";
}

function getEvBgColor(ev: number): string {
  if (ev >= 10) return "bg-emerald-100 dark:bg-emerald-900/40";
  if (ev >= 5) return "bg-emerald-50 dark:bg-emerald-900/30";
  if (ev >= 3) return "bg-emerald-50/70 dark:bg-emerald-900/20";
  if (ev >= 2) return "bg-teal-50 dark:bg-teal-900/20";
  return "bg-sky-50 dark:bg-sky-900/20";
}

// =============================================================================
// Components
// =============================================================================

interface MultiSelectDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  icon?: React.ReactNode;
}

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  icon,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const selectAll = () => onChange(options.map((o) => o.value));
  const clearAll = () => onChange([]);

  const displayLabel =
    selected.length === 0
      ? `All ${label}`
      : selected.length === options.length
        ? `All ${label}`
        : selected.length === 1
          ? options.find((o) => o.value === selected[0])?.label || selected[0]
          : `${selected.length} ${label}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
          "hover:bg-neutral-50 dark:hover:bg-neutral-700/50",
          "text-neutral-700 dark:text-neutral-200"
        )}
      >
        {icon}
        <span>{displayLabel}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-50 min-w-[200px] py-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-700">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-primary hover:underline"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-neutral-500 hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                    "hover:bg-neutral-50 dark:hover:bg-neutral-700/50",
                    selected.includes(option.value)
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-600 dark:text-neutral-400"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                      selected.includes(option.value)
                        ? "bg-primary border-primary"
                        : "border-neutral-300 dark:border-neutral-600"
                    )}
                  >
                    {selected.includes(option.value) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10.28 2.28a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L4.25 7.19l4.97-4.97a.75.75 0 0 1 1.06 0Z" />
                      </svg>
                    )}
                  </div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface SelectDropdownProps {
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  icon?: React.ReactNode;
}

function SelectDropdown({ value, onChange, options, icon }: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
          "hover:bg-neutral-50 dark:hover:bg-neutral-700/50",
          "text-neutral-700 dark:text-neutral-200"
        )}
      >
        {icon}
        <span>{currentOption?.label || value}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-50 min-w-[160px] py-1 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl">
            {options.map((option) => (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => {
                  onChange(String(option.value));
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-sm text-left transition-colors",
                  "hover:bg-neutral-50 dark:hover:bg-neutral-700/50",
                  option.value === value
                    ? "text-primary font-medium"
                    : "text-neutral-700 dark:text-neutral-200"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function PositiveEVPage() {
  // Subscription check
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const isPro = subscription?.status === "active";

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>(AVAILABLE_SPORTS);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [minEv, setMinEv] = useState(0);
  const [sharpPreset, setSharpPreset] = useState<SharpPreset>("pinnacle");

  // Sorting state
  const [sortColumn, setSortColumn] = useState<"ev" | "time">("ev");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch available markets
  const { data: marketsData } = useAvailableMarkets(AVAILABLE_SPORTS);
  const marketOptions = useMemo(() => {
    if (!marketsData?.aggregatedMarkets) return [];
    return marketsData.aggregatedMarkets.map((m) => ({
      value: m.key,
      label: formatMarketLabel(m.key) || m.display || m.key,
    }));
  }, [marketsData]);

  // Fetch +EV opportunities
  const {
    opportunities,
    isLoading,
    isFetching,
    totalFound,
    refetch,
    freshRefetch,
  } = usePositiveEV({
    filters: {
      sports: selectedSports,
      markets: selectedMarkets.length > 0 ? selectedMarkets : undefined,
      sharpPreset,
      minEV: minEv,
      mode: "pregame",
    },
    isPro: true, // Always fetch as Pro, we'll blur the results for non-Pro
  });

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = [...opportunities];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((opp) => {
        const playerName = opp.playerName?.toLowerCase() || "";
        const market = opp.marketDisplay?.toLowerCase() || opp.market?.toLowerCase() || "";
        const matchup = `${opp.homeTeam || ""} ${opp.awayTeam || ""}`.toLowerCase();
        return playerName.includes(q) || market.includes(q) || matchup.includes(q);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortColumn === "ev") {
        const evA = a.evCalculations?.evWorst || 0;
        const evB = b.evCalculations?.evWorst || 0;
        return sortDirection === "desc" ? evB - evA : evA - evB;
      } else {
        const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
        const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
        return sortDirection === "desc" ? timeB - timeA : timeA - timeB;
      }
    });

    return filtered;
  }, [opportunities, searchQuery, sortColumn, sortDirection]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await freshRefetch();
  }, [freshRefetch]);

  // Toggle sort
  const toggleSort = (column: "ev" | "time") => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Clear filters
  const hasActiveFilters =
    selectedSports.length !== AVAILABLE_SPORTS.length ||
    selectedMarkets.length > 0 ||
    minEv > 0 ||
    searchQuery.trim() !== "";

  const clearFilters = () => {
    setSelectedSports(AVAILABLE_SPORTS);
    setSelectedMarkets([]);
    setMinEv(0);
    setSearchQuery("");
  };

  return (
    <AppPageLayout
      title="+EV Optimizer"
      subtitle="Find positive expected value bets by comparing odds against sharp reference books"
      headerActions={
        <div className="flex items-center gap-2">
          <Tooltip content="De-vig sharp books to find fair odds, then compare retail book prices to identify +EV opportunities">
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">How it works</span>
            </button>
          </Tooltip>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              "bg-primary text-white hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      }
      contextBar={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search player or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-48 sm:w-56 h-9 pl-9 pr-3 rounded-lg text-sm",
                  "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                  "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                )}
              />
            </div>

            {/* Sports dropdown */}
            <MultiSelectDropdown
              label="Sports"
              options={AVAILABLE_SPORTS.map((s) => ({ value: s, label: SPORT_LABELS[s] || s.toUpperCase() }))}
              selected={selectedSports}
              onChange={setSelectedSports}
            />

            {/* Markets dropdown */}
            {marketOptions.length > 0 && (
              <MultiSelectDropdown
                label="Markets"
                options={marketOptions}
                selected={selectedMarkets}
                onChange={setSelectedMarkets}
                icon={<Filter className="w-4 h-4" />}
              />
            )}

            {/* Min EV */}
            <SelectDropdown
              value={minEv}
              onChange={(v) => setMinEv(Number(v))}
              options={MIN_EV_OPTIONS}
              icon={<TrendingUp className="w-4 h-4" />}
            />

            {/* Sharp preset */}
            <SelectDropdown
              value={sharpPreset}
              onChange={(v) => setSharpPreset(v as SharpPreset)}
              options={SHARP_PRESET_OPTIONS}
            />

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-900 dark:text-white">{filteredOpportunities.length}</span> opportunities
            </span>
          </div>
        </div>
      }
    >
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Loading opportunities...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredOpportunities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
            No +EV opportunities found
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
            Try adjusting your filters or check back later as odds update frequently.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && filteredOpportunities.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => toggleSort("ev")}
                    className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200"
                  >
                    EV%
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Sport
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Selection
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Line
                </th>
                <th className="hidden lg:table-cell px-3 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Market
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Best Book
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Fair Odds
                </th>
                <th className="hidden xl:table-cell px-3 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => toggleSort("time")}
                    className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200"
                  >
                    Game Time
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredOpportunities.map((opp) => {
                const displayEV = opp.evCalculations?.evWorst || 0;
                const decimalOdds = opp.book.priceDecimal || 1;
                const fairProb = opp.evCalculations?.power?.fairProb || opp.evCalculations?.multiplicative?.fairProb || 0.5;
                const fairOdds = fairProb > 0 && fairProb < 1
                  ? formatOdds(fairProb < 0.5 ? Math.round((1 - fairProb) / fairProb * 100) : Math.round(-fairProb / (1 - fairProb) * 100))
                  : "—";

                const isBinaryMarket = opp.line === 0.5 && (
                  opp.market.includes("double_double") ||
                  opp.market.includes("triple_double") ||
                  opp.market.includes("to_score") ||
                  opp.market.includes("anytime")
                );
                const moneylineMarket = isMoneylineMarket(opp.market, opp.marketDisplay);
                const lineDisplay = moneylineMarket
                  ? "ML"
                  : opp.side === "yes"
                    ? "Yes"
                    : opp.side === "no"
                      ? "No"
                      : isBinaryMarket
                        ? opp.side === "over" ? "Yes" : "No"
                        : `${opp.side === "over" ? "O" : "U"} ${opp.line}`;

                const shortMarket = opp.marketDisplay
                  ? shortenPeriodPrefix(opp.marketDisplay)
                  : formatMarketLabelShort(opp.market) || opp.market;

                const bookLink = getBookLink(opp);
                const bookLogo = getBookLogo(opp.book.bookId);
                const bookName = getBookName(opp.book.bookId) || opp.book.bookName;

                const gameTime = opp.startTime
                  ? new Date(opp.startTime).toLocaleString("en-US", {
                      weekday: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "—";

                return (
                  <tr
                    key={opp.id}
                    className={cn(
                      "group transition-colors",
                      "hover:bg-neutral-50 dark:hover:bg-neutral-800/30",
                      !isPro && "blur-[6px] select-none pointer-events-none"
                    )}
                  >
                    {/* EV% */}
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold tabular-nums",
                          getEvBgColor(displayEV),
                          getEvColor(displayEV)
                        )}
                      >
                        +{displayEV.toFixed(1)}%
                      </span>
                    </td>

                    {/* Sport */}
                    <td className="px-3 py-3">
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                        {SPORT_LABELS[opp.sport] || opp.sport.toUpperCase()}
                      </span>
                    </td>

                    {/* Selection */}
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate max-w-[200px]">
                          {opp.playerName || `${opp.awayTeam} @ ${opp.homeTeam}`}
                        </span>
                        {opp.playerTeam && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {opp.playerTeam}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Line */}
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold",
                          "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                        )}
                      >
                        {lineDisplay}
                      </span>
                    </td>

                    {/* Market */}
                    <td className="hidden lg:table-cell px-3 py-3">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate block max-w-[120px]">
                        {shortMarket}
                      </span>
                    </td>

                    {/* Best Book */}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {bookLogo && (
                          <Tooltip content={bookName}>
                            <img
                              src={bookLogo}
                              alt={bookName}
                              className="h-7 w-7 object-contain rounded-md bg-white dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-700"
                            />
                          </Tooltip>
                        )}
                        <div className="flex flex-col items-center">
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {formatOdds(opp.book.price)}
                          </span>
                          {bookLink && (
                            <a
                              href={bookLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-0.5 text-[10px] text-primary hover:underline"
                            >
                              Bet <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Fair Odds */}
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold text-neutral-600 dark:text-neutral-400 tabular-nums">
                          {fairOdds}
                        </span>
                      </div>
                    </td>

                    {/* Game Time */}
                    <td className="hidden xl:table-cell px-3 py-3">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {gameTime}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pro upgrade prompt */}
      {!subLoading && !isPro && filteredOpportunities.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
          <div className="max-w-2xl mx-auto p-4">
            <div className="pointer-events-auto bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl p-6 shadow-2xl border border-neutral-700">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-white mb-1">
                    Unlock +EV Opportunities
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Subscribe to see all {totalFound} +EV bets with sharp book de-vigging
                  </p>
                </div>
                <a
                  href="/pricing"
                  className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  Upgrade to Pro
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppPageLayout>
  );
}
