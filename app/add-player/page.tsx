"use client";
import { useState } from "react";
import { ChessQueen, House, User, UserPlus } from "lucide-react";
import "../main.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [name, setName] = useState("");
  const [uscfId, setUscfId] = useState("");
  const [searchBy, setSearchBy] = useState<"name" | "id">("name");
  const [result, setResult] = useState<
    | null
    | {
        name: string;
        regular: string;
        blitz: string;
        quick: string;
        id: string;
      }[]
  >(null);
  const [loading, setLoading] = useState(false);

  async function handleAddPlayer() {
    setLoading(true);
    setResult(null);

    try {
      let data: {
        name: string;
        regular: string;
        blitz: string;
        quick: string;
        id: string;
      }[] = [];

      const formatRating = (ratingObj: any) => {
        console.log(ratingObj);
        if (!ratingObj || ratingObj.rating == null || ratingObj.rating === 0) {
          return "N/A";
        }
        return ratingObj.rating + (ratingObj.provisional ? "*" : "");
      };

      // Lookup by USCF ID
      if (uscfId) {
        const resById = await fetch(`/api/uscf_id?uscfId=${uscfId}`);
        if (resById.ok) {
          setSearchBy("id");
          const json = await resById.json();
          console.log(json.ratings);
          data.push({
            name: json.name,
            regular: formatRating(
              json.ratings?.find((r: any) => r.ratingSystem === "R")
            ),
            blitz: formatRating(
              json.ratings?.find((r: any) => r.ratingSystem === "B")
            ),
            quick: formatRating(
              json.ratings?.find((r: any) => r.ratingSystem === "Q")
            ),
            id: uscfId,
          });
        }
      }

      // Fuzzy name search
      if (data.length === 0 && name) {
        const [firstName, ...rest] = name.trim().split(" ");
        const lastName = rest.join(" ");

        const resByName = await fetch(
          `/api/uscf_name?firstName=${encodeURIComponent(
            firstName
          )}&lastName=${encodeURIComponent(lastName)}`
        );

        if (resByName.ok) {
          setSearchBy("name");
          const items: any[] = await resByName.json();
          if (items.length > 0) {
            data = items.map((match) => ({
              name: `${match.firstName} ${match.lastName}`,
              regular: formatRating(
                match.ratings?.find((r: any) => r.ratingSystem === "R")
              ),
              blitz: formatRating(
                match.ratings?.find((r: any) => r.ratingSystem === "B")
              ),
              quick: formatRating(
                match.ratings?.find((r: any) => r.ratingSystem === "Q")
              ),
              id: match.id,
            }));
          }
        }
      }

      if (data.length > 0) {
        setResult(data);
      } else {
        setResult([
          {
            name: "Not Found",
            regular: "N/A",
            blitz: "N/A",
            quick: "N/A",
            id: "N/A",
          },
        ]);
      }
    } catch (err) {
      setResult([
        {
          name: "Error",
          regular: "N/A",
          blitz: "N/A",
          quick: "N/A",
          id: "N/A",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#0F182A] no-repeat bg-cover p-4 mt-0 min-h-screen">
      <div
        onClick={() => (window.location.href = "/")}
        className="bg-[#7BADF9] p-4 fixed w-18 aspect-square rounded-full bottom-2 right-2"
      >
        <House color="#0F182A" size={40} />
      </div>
      <div className="mx-auto min-h-[calc(100vh-32px)] bg-[#182138] p-8 rounded-[20px] max-w-[800px]">
        <div className="flex flex-row items-center">
          <div
            onClick={() => (window.location.href = "/")}
            className="bg-blue-500/30  rounded-full p-2"
          >
            <ChessQueen color="#8ec5ff" size={30} />
          </div>
          <h1
            onClick={() => (window.location.href = "/")}
            className="text-white font-bold ml-2 text-2xl cursor-pointer"
          >
            Chess<span className="text-[#7BADF9]">Tourney</span>
          </h1>
          <div className="bg-blue-500/30 ml-auto rounded-full p-2">
            <User color="#8ec5ff" size={30} />
          </div>
        </div>

        <div>
          <h1 className="text-center text-white font-bold text-2xl mt-6">
            Add Player
          </h1>

          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-[50px] mt-4 text-white bg-[#0E192A] placeholder-white
              focus-visible:ring-3 focus-visible:ring-blue-200 focus-visible:outline-none"
            placeholder="Enter Player Name Here..."
          />

          <Input
            type="text"
            value={uscfId}
            onChange={(e) => setUscfId(e.target.value)}
            className="h-[50px] mt-4 text-white bg-[#0E192A] placeholder-white
              focus-visible:ring-3 focus-visible:ring-blue-200 focus-visible:outline-none"
            placeholder="Enter USCF ID Here..."
          />

          <Button
            onClick={handleAddPlayer}
            disabled={loading}
            className="bg-[#7BADF9] text-lg ml-auto p-6 mt-4 hover:bg-[#7BADF9] text-[#0F182A] rounded-full cursor-pointer flex items-center gap-2"
          >
            {loading ? "Searching..." : "Find Player"}
            <UserPlus className="h-10" />
          </Button>

          {result &&
          result.length > 0 &&
          result[0].name != "Not Found" &&
          result[0].name != "Error" ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {result.map((player, idx) => {
                const isLastSingle =
                  result.length % 2 === 1 && idx === result.length - 1;
                return (
                  <div
                    key={idx}
                    className={`text-white bg-blue-500/10 p-4 rounded-lg ${
                      isLastSingle ? "sm:col-span-2" : ""
                    }`}
                  >
                    <p className="text-xl font-bold">{player.name}</p>
                    <p className="text-lg opacity-90">
                      Regular: {player.regular} | Blitz: {player.blitz} | Quick:{" "}
                      {player.quick}
                    </p>
                    {searchBy === "name" && (
                      <p className="text-lg opacity-90">ID: {player.id}</p>
                    )}
                    <div className="mt-1 flex justify-end">
                      <a
                        href={`https://ratings.uschess.org/player/${player.id}`}
                        target="_blank"
                        className="bg-[#7BADF9] text-[#0F182A] p-2 rounded-full inline-block ml-auto cursor-pointer"
                      >
                        Go to Profile
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : result && result?.length > 0 ? (
            <div className="bg-[#203F74] mt-4 text-2xl text-white p-3 rounded-2xl text-center">
              Sorry, there are no results matching that USCF{" "}
              {searchBy === "id" ? "ID" : "name"}.
            </div>
          ) : (
            <> </>
          )}
        </div>
      </div>
    </div>
  );
}
