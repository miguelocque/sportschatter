"use client";

import { useRouter } from "next/navigation";
import type { GameData } from "@/types";

//  Helpers 

function getPeriodLabel(sport: GameData["sport"], period: number): string {
    if (sport === "nba") return `Q${period}`;
    if (sport === "soccer") return period === 1 ? "1st" : "2nd";
    return `P${period}`;
}

function formatScheduledTime(isoString: string): string {
    const date = new Date(isoString);
    const isToday = date.toDateString() === new Date().toDateString();
    const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (isToday) return `Today · ${time}`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" }) + ` · ${time}`;
}

//  TeamLogo 

function TeamLogo({
    name,
    abbreviation,
    logoUrl,
    size = 36,
}: {
    name: string;
    abbreviation: string;
    logoUrl?: string;
    size?: number;
}) {
    if (logoUrl) {
        return (
            <img
                src={logoUrl}
                alt={name}
                width={size}
                height={size}
                className="object-contain flex-shrink-0"
            />
        );
    }
    return (
        <div
            className="rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60 flex-shrink-0 tracking-wide"
            style={{ width: size, height: size }}
            aria-label={name}
        >
            {abbreviation.slice(0, 3)}
        </div>
    );
}

//  GameCard 

export default function GameCard({ game }: { game: GameData }) {
    const router = useRouter();

    const homeWins =
        game.status === "final" && game.homeTeam.score > game.awayTeam.score;
    const awayWins =
        game.status === "final" && game.awayTeam.score > game.homeTeam.score;
    const showScores = game.status !== "upcoming";

    return (
        <article
            onClick={() => router.push(`/matches/${game.id}`)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                    router.push(`/matches/${game.id}`);
            }}
            role="button"
            tabIndex={0}
            aria-label={`${game.awayTeam.name} vs ${game.homeTeam.name} — ${game.status}`}
            className="bg-[#13151c] border border-white/[0.07] rounded-2xl px-[18px] py-[14px] cursor-pointer transition-colors duration-150 hover:bg-[#191c26] hover:border-white/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 select-none"
        >
            {/*  Header  */}
            <div className="flex items-center justify-between mb-[14px]">
                {game.status === "live" && (
                    <div className="flex items-center gap-1.5">
                        <span className="w-[7px] h-[7px] rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
                        <span className="text-[11px] font-bold tracking-widest uppercase text-green-500">
                            Live
                        </span>
                        {game.period && (
                            <span className="text-[11px] text-white/40">
                                {getPeriodLabel(game.sport, game.period)}
                                {game.clock && ` · ${game.clock}`}
                            </span>
                        )}
                    </div>
                )}
                {game.status === "upcoming" && (
                    <span className="text-[11px] font-semibold tracking-widest uppercase text-white/40">
                        Upcoming
                    </span>
                )}
                {game.status === "final" && (
                    <span className="text-[11px] font-bold tracking-widest uppercase text-white/30">
                        Final
                    </span>
                )}
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/20">
                    {game.sport === "nba" ? "NBA" : "Soccer"}
                </span>
            </div>

            {/*  Teams  */}
            <div className="flex flex-col gap-2.5">
                {[
                    { team: game.awayTeam, isWinner: awayWins },
                    { team: game.homeTeam, isWinner: homeWins },
                ].map(({ team, isWinner }) => (
                    <div key={team.name} className="flex items-center gap-3">
                        <TeamLogo
                            name={team.name}
                            abbreviation={team.abbreviation}
                            logoUrl={team.logoUrl}
                        />
                        <span
                            className={`flex-1 text-sm truncate ${isWinner ? "font-semibold text-white" : "font-normal text-white/50"
                                }`}
                        >
                            {team.name}
                        </span>
                        {showScores && (
                            <span
                                className={`text-[21px] font-bold tabular-nums min-w-[30px] text-right leading-none ${isWinner ? "text-white" : "text-white/40"
                                    }`}
                            >
                                {team.score}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/*  Footer (upcoming only)  */}
            {game.status === "upcoming" && game.scheduledAt && (
                <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-xs text-white/35 leading-none">
                    {formatScheduledTime(game.scheduledAt)}
                    {game.venue && (
                        <span className="text-white/20"> · {game.venue}</span>
                    )}
                </div>
            )}
        </article>
    );
}