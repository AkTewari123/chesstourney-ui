// app/api/uscf/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const firstName = searchParams.get("firstName");
  const lastName = searchParams.get("lastName");

  if (!firstName || !lastName) {
    return new Response("Missing firstName or lastName", { status: 400 });
  }

  // Combine for fuzzy search
  const fuzzy = `${firstName}%20${lastName}`;

  try {
    const url = `https://ratings-api.uschess.org/api/v1/members?Fuzzy=${fuzzy}&Offset=0&Size=100`;
    const resp = await fetch(url);
    if (!resp.ok)
      return new Response("Error fetching members", { status: resp.status });

    const json = await resp.json();
    // Return the items directly
    return new Response(JSON.stringify(json.items), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(`Fetch error: ${(err as Error).message}`, {
      status: 500,
    });
  }
}
