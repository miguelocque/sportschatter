"use client";

import styled from "styled-components";
import GameCard from "@/app/components/GameCard";
import type { GameData } from "@/types";

// styled component created by Miguel Ocque to display games on the homepage

const PageMain = styled.main`
    min-height: 100vh;
    background: #1a1612;
    padding: 32px 16px;
`;

const Container = styled.div`
    max-width: 1024px;
    margin: 0 auto;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 700;
    color: #e8d5b0;
    margin-bottom: 32px;
    letter-spacing: -0.4px;
`;

const Section = styled.section`
    margin-bottom: 32px;
`;

const SectionHeading = styled.h2<{ $live?: boolean }>`
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.6px;
    text-transform: uppercase;
    color: ${({ $live }) => ($live ? "#e8d5b0" : "#a89880")};
    margin-bottom: 12px;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;

    @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
    }
`;

export default function HomeView({ games }: { games: GameData[] }) {

    // filter the games by their status
    const liveGames = games.filter((g) => g.status === "live");
    const upcomingGames = games.filter((g) => g.status === "upcoming");
    const finalGames = games.filter((g) => g.status === "final");

    return (
        <PageMain>
            <Container>
                <Title>SportsChatter - Have a Chat with Other Fans!</Title>

                {/* section that deals with games that are live */}
                {liveGames.length > 0 && (
                    <Section>
                        <SectionHeading $live>LIVE NOW</SectionHeading>
                        <Grid>
                            {liveGames.map((game) => (
                                // we use the GameCard component built by Oscar here to display the game
                                <GameCard key={game.id} game={game} />
                            ))}
                        </Grid>
                    </Section>
                )}

                {/* section that deals with games that are upcoming */}
                {upcomingGames.length > 0 && (
                    <Section>
                        <SectionHeading>UPCOMING</SectionHeading>
                        <Grid>
                            {upcomingGames.map((game) => (
                                <GameCard key={game.id} game={game} />
                            ))}
                        </Grid>
                    </Section>
                )}

                {/* section that deals with games that have concluded */}
                {finalGames.length > 0 && (
                    <Section>
                        <SectionHeading>FINAL</SectionHeading>
                        <Grid>
                            {finalGames.map((game) => (
                                <GameCard key={game.id} game={game} />
                            ))}
                        </Grid>
                    </Section>
                )}
            </Container>
        </PageMain>
    );
}