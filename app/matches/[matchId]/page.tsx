import { notFound } from "next/navigation";
import { getMatch } from "@/lib/getMatch";
import type { MatchData, MatchEvent } from "@/types";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ match }: { match: MatchData }) {
    if (match.status === "live") {
        return (
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold tracking-widest uppercase text-green-500">
                    Live
                </span>
                {match.elapsed && (
                    <span className="text-sm text-white/40">{match.elapsed}&apos;</span>
                )}
            </div>
        );
    }
    if (match.status === "final") {
        return (
            <span className="text-sm font-bold tracking-widest uppercase text-white/30">
                Full Time
            </span>
        );
    }
    return (
        <span className="text-sm font-semibold tracking-widest uppercase text-white/40">
            {new Date(match.scheduledAt).toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            })}
        </span>
    );
}

function TeamLogo({ logoUrl, name, size = 56 }: { logoUrl?: string; name: string; size?: number }) {
    if (logoUrl) {
        return <img src={logoUrl} alt={name} width={size} height={size} className="object-contain" />;
    }
    return (
        <div
            className="rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/60"
            style={{ width: size, height: size }}
        >
            {name.slice(0, 3).toUpperCase()}
        </div>
    );
}

function ScoreHero({ match }: { match: MatchData }) {
    const showScore = match.status !== "upcoming";
    const homeWins = match.homeTeam.winner;
    const awayWins = match.awayTeam.winner;

    return (
        <div className="flex items-center justify-between gap-4 py-8">
            <div className="flex flex-col items-center gap-3 flex-1">
                <TeamLogo logoUrl={match.awayTeam.logoUrl} name={match.awayTeam.name} />
                <span className={`text-center text-sm font-medium leading-tight ${awayWins ? "text-white" : "text-white/60"}`}>
                    {match.awayTeam.name}
                </span>
            </div>

            <div className="flex flex-col items-center gap-2 shrink-0">
                {showScore ? (
                    <div className="flex items-center gap-3">
                        <span className={`text-5xl font-bold tabular-nums ${awayWins ? "text-white" : "text-white/40"}`}>
                            {match.awayTeam.score}
                        </span>
                        <span className="text-3xl text-white/20 font-light">–</span>
                        <span className={`text-5xl font-bold tabular-nums ${homeWins ? "text-white" : "text-white/40"}`}>
                            {match.homeTeam.score}
                        </span>
                    </div>
                ) : (
                    <span className="text-3xl font-light text-white/30">vs</span>
                )}
                <StatusBadge match={match} />
            </div>

            <div className="flex flex-col items-center gap-3 flex-1">
                <TeamLogo logoUrl={match.homeTeam.logoUrl} name={match.homeTeam.name} />
                <span className={`text-center text-sm font-medium leading-tight ${homeWins ? "text-white" : "text-white/60"}`}>
                    {match.homeTeam.name}
                </span>
            </div>
        </div>
    );
}

function HalftimeBreakdown({ match }: { match: MatchData }) {
    const ht = match.score.halftime;
    const ft = match.score.fulltime;
    if (ht.home === null && ht.away === null) return null;

    return (
        <div className="border border-white/[0.07] rounded-2xl p-5">
            <p className="text-[11px] font-bold tracking-widest uppercase text-white/30 mb-4">
                Score Breakdown
            </p>
            <div className="grid grid-cols-3 text-sm text-center gap-y-3">
                <span className="text-white/30">Halftime</span>
                <span className="font-bold text-white tabular-nums">{ht.away ?? 0} – {ht.home ?? 0}</span>
                <span />
                {ft.home !== null && (
                    <>
                        <span className="text-white/30">Full Time</span>
                        <span className="font-bold text-white tabular-nums">{ft.away ?? 0} – {ft.home ?? 0}</span>
                        <span />
                    </>
                )}
            </div>
        </div>
    );
}

const EVENT_ICON: Record<MatchEvent["type"], string> = {
    goal: "⚽",
    yellow_card: "🟨",
    red_card: "🟥",
    substitution: "↕",
};

function EventFeed({ events }: { events: MatchEvent[] }) {
    if (events.length === 0) return null;

    return (
        <div className="border border-white/[0.07] rounded-2xl p-5">
            <p className="text-[11px] font-bold tracking-widest uppercase text-white/30 mb-4">
                Match Events
            </p>
            <div className="flex flex-col gap-3">
                {events.map((e, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-white/30 tabular-nums w-8 shrink-0">{e.minute}&apos;</span>
                        <span className="text-sm shrink-0">{EVENT_ICON[e.type]}</span>
                        <span className={`flex-1 text-sm text-white/70 ${e.team === "home" ? "text-right" : "text-left"}`}>
                            {e.playerName}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MatchMeta({ match }: { match: MatchData }) {
    return (
        <div className="flex items-center justify-between text-xs text-white/30">
            <span>
                {match.league.name}
                {match.league.round && ` · ${match.league.round}`}
            </span>
            <span>{match.venue.name}, {match.venue.city}</span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MatchPage({
    params,
}: {
    params: { matchId: string };
}) {
    const match = await getMatch(params.matchId);
    if (!match) notFound();

    return (
        <main className="min-h-screen bg-[#0d0f16] text-white">
            <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
                <MatchMeta match={match} />
                <ScoreHero match={match} />
                <HalftimeBreakdown match={match} />
                <EventFeed events={match.events} />
            </div>
        </main>
    );
}