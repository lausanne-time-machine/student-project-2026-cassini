async function json(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
    return await response.json();
}

const topojson = await json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json");

process.stdout.write(JSON.stringify(topojson));
