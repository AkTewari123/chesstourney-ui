import { capitalizeFirstLetter } from "@/lib/functions/capitalize";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uscfId = searchParams.get("uscfId");
  if (!uscfId) return new Response("Missing uscfId", { status: 400 });

  try {
    const resp = await fetch(
      `https://ratings-api.uschess.org/api/v1/members/${uscfId}`
    );
    if (!resp.ok)
      return new Response("USCF member not found", { status: resp.status });

    const data = await resp.json();

    // Find regular rating (R) from the ratings array
    const regularRatingObj = data.ratings.find(
      (r: any) => r.ratingSystem === "R"
    );
    const firstName = capitalizeFirstLetter(data.firstName) || null;
    const lastName = capitalizeFirstLetter(data.lastName) || null;
    return new Response(
      JSON.stringify({
        name: `${firstName} ${lastName}`,
        ratings: data.ratings,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response("Failed to fetch USCF data", { status: 500 });
  }
}
