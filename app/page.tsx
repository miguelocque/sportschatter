import GameCard from "@/app/components/GameCard";
import { getMatches } from "@/lib/getMatches";


// main page created by Miguel Ocque using Tailwind styling
export default async function Home() {

  // get the matches via API call
  const games = await getMatches();

  // filter each set of games on their status (live, upcoming or concluded)
  const liveGames = games.filter((g) => g.status === "live");
  const upcomingGames = games.filter((g) => g.status === "upcoming");
  const finalGames = games.filter((g) => g.status === "final");

  return (
      <main className="min-h-screen bg-[#1a1612] px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-[#e8d5b0] mb-8 tracking-tight">
            SportsChatter - Have a Chat with Other Fans!
          </h1>

          {/* section that deals with games that are live */}
          {liveGames.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs font-bold tracking-widest uppercase text-[#e8d5b0] mb-3">
                  LIVE NOW
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {liveGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </section>
          )}

          {/* section that deals with games that are upcoming */}
          {upcomingGames.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs font-bold tracking-widest uppercase text-[#a89880] mb-3">
                  UPCOMING
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {upcomingGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </section>
          )}

          {/* section that deals with games that have concluded */}
          {finalGames.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs font-bold tracking-widest uppercase text-[#a89880] mb-3">
                  FINAL
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {finalGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </section>
          )}
        </div>
      </main>
  );
}