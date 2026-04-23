import { getMatches } from "@/lib/getMatches";
import HomeView from "@/app/components/HomeView";

// main page created by Miguel Ocque using styled component from HomeView in components directory
export default async function Home() {

    // get the matches via API call
    const games = await getMatches();

    // and we return the component which does all the styling
    return <HomeView games={games}/>;

}