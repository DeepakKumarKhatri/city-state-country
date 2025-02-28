const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

let countriesCache = null;
let countriesListCache = null;

const dataFilePath = path.join(
  __dirname,
  "..",
  "data",
  "countries_states_cities.json"
);

app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Country Data API" }));

function streamAndParseJSON(filePath) {
  return new Promise((resolve, reject) => {
    let data = "";

    const readStream = fs.createReadStream(filePath, { encoding: "utf8" });

    readStream.on("data", (chunk) => {
      data += chunk;
    });

    readStream.on("end", () => {
      try {
        const parsedData = JSON.parse(data);
        resolve(parsedData);
      } catch (err) {
        reject(new Error(`Failed to parse JSON: ${err.message}`));
      }
    });

    readStream.on("error", (err) => {
      reject(new Error(`Failed to read file: ${err.message}`));
    });
  });
}

async function initializeCache() {
  if (countriesCache && countriesListCache) {
    return;
  }

  try {
    console.log("Initializing country cache...");
    const fullData = await streamAndParseJSON(dataFilePath);

    countriesCache = {};
    countriesListCache = [];

    fullData.forEach((country) => {
      countriesCache[country.id] = country;

      countriesListCache.push({
        id: country.id,
        name: country.name,
        iso2: country.iso2,
        iso3: country.iso3,
        region: country.region,
        subregion: country.subregion,
      });
    });

    console.log(
      `Cache initialized with ${countriesListCache.length} countries`
    );
  } catch (err) {
    console.error("Cache initialization error:", err);
    throw err;
  }
}

// Initialize cache on startup but don't block server start
initializeCache().catch((err) => {
  console.error("Failed to initialize cache:", err);
  // Don't exit process, let the server handle requests that don't need cache
});

app.get("/countries", async (req, res) => {
  try {
    await initializeCache();
    res.json(countriesListCache);
  } catch (err) {
    console.error("Error getting countries:", err);
    res.status(500).json({ error: "Failed to retrieve countries" });
  }
});

app.get("/countries/:id", async (req, res) => {
  const countryId = parseInt(req.params.id);

  if (isNaN(countryId)) {
    return res.status(400).json({ error: "Invalid country ID" });
  }

  try {
    await initializeCache();

    if (!countriesCache[countryId]) {
      return res.status(404).json({ error: "Country not found" });
    }

    res.json(countriesCache[countryId]);
  } catch (err) {
    console.error("Error getting country:", err);
    res.status(500).json({ error: "Failed to retrieve country data" });
  }
});

app.get("/countries/iso/:code", async (req, res) => {
  const isoCode = req.params.code.toUpperCase();

  if (!isoCode || (isoCode.length !== 2 && isoCode.length !== 3)) {
    return res.status(400).json({ error: "Invalid ISO code format" });
  }

  try {
    await initializeCache();

    let country = null;

    // Find country by ISO code
    for (const id in countriesCache) {
      const c = countriesCache[id];
      if (
        (isoCode.length === 2 && c.iso2 === isoCode) ||
        (isoCode.length === 3 && c.iso3 === isoCode)
      ) {
        country = c;
        break;
      }
    }

    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }

    res.json(country);
  } catch (err) {
    console.error("Error getting country by ISO:", err);
    res.status(500).json({ error: "Failed to retrieve country data" });
  }
});

app.get("/countries/:id/states", async (req, res) => {
  const countryId = parseInt(req.params.id);

  if (isNaN(countryId)) {
    return res.status(400).json({ error: "Invalid country ID" });
  }

  try {
    await initializeCache();

    if (!countriesCache[countryId]) {
      return res.status(404).json({ error: "Country not found" });
    }

    const states = countriesCache[countryId].states || [];
    res.json(states);
  } catch (err) {
    console.error("Error getting states:", err);
    res.status(500).json({ error: "Failed to retrieve states data" });
  }
});

app.get("/states/:id", async (req, res) => {
  const stateId = parseInt(req.params.id);

  if (isNaN(stateId)) {
    return res.status(400).json({ error: "Invalid state ID" });
  }

  try {
    await initializeCache();

    let stateData = null;
    let countryName = null;

    for (const countryId in countriesCache) {
      const country = countriesCache[countryId];
      const state = (country.states || []).find((s) => s.id === stateId);

      if (state) {
        stateData = state;
        countryName = country.name;
        break;
      }
    }

    if (!stateData) {
      return res.status(404).json({ error: "State not found" });
    }

    res.json({
      ...stateData,
      country_name: countryName,
    });
  } catch (err) {
    console.error("Error getting state:", err);
    res.status(500).json({ error: "Failed to retrieve state data" });
  }
});

app.get("/countries/:id/cities", async (req, res) => {
  const countryId = parseInt(req.params.id);

  if (isNaN(countryId)) {
    return res.status(400).json({ error: "Invalid country ID" });
  }

  try {
    await initializeCache();

    if (!countriesCache[countryId]) {
      return res.status(404).json({ error: "Country not found" });
    }

    const country = countriesCache[countryId];
    const cities = [];

    (country.states || []).forEach((state) => {
      (state.cities || []).forEach((city) => {
        cities.push({
          ...city,
          state_name: state.name,
        });
      });
    });

    res.json(cities);
  } catch (err) {
    console.error("Error getting cities:", err);
    res.status(500).json({ error: "Failed to retrieve cities data" });
  }
});

app.get("/states/:id/cities", async (req, res) => {
  const stateId = parseInt(req.params.id);

  if (isNaN(stateId)) {
    return res.status(400).json({ error: "Invalid state ID" });
  }

  try {
    await initializeCache();

    let state = null;

    for (const countryId in countriesCache) {
      const country = countriesCache[countryId];
      const foundState = (country.states || []).find((s) => s.id === stateId);

      if (foundState) {
        state = foundState;
        break;
      }
    }

    if (!state) {
      return res.status(404).json({ error: "State not found" });
    }

    const cities = (state.cities || []).map((city) => ({
      ...city,
      state_name: state.name,
    }));

    res.json(cities);
  } catch (err) {
    console.error("Error getting cities:", err);
    res.status(500).json({ error: "Failed to retrieve cities data" });
  }
});

app.get("/countries/search/:term", async (req, res) => {
  const searchTerm = req.params.term.toLowerCase();

  try {
    await initializeCache();

    const results = countriesListCache.filter((country) =>
      country.name.toLowerCase().includes(searchTerm)
    );

    res.json(results);
  } catch (err) {
    console.error("Error searching countries:", err);
    res.status(500).json({ error: "Failed to search countries" });
  }
});

app.get("/regions/:region/countries", async (req, res) => {
  const region = req.params.region.toLowerCase();

  try {
    await initializeCache();

    const results = countriesListCache.filter(
      (country) => country.region && country.region.toLowerCase() === region
    );

    res.json(results);
  } catch (err) {
    console.error("Error getting countries by region:", err);
    res.status(500).json({ error: "Failed to retrieve region data" });
  }
});

app.get("/regions", async (req, res) => {
  try {
    await initializeCache();

    const regions = new Set();

    for (const countryId in countriesCache) {
      const country = countriesCache[countryId];
      if (country.region) {
        regions.add(country.region);
      }
    }

    res.json(Array.from(regions).sort());
  } catch (err) {
    console.error("Error getting regions:", err);
    res.status(500).json({ error: "Failed to retrieve regions data" });
  }
});

app.get("/subregions", async (req, res) => {
  try {
    await initializeCache();

    const subregions = new Set();

    for (const countryId in countriesCache) {
      const country = countriesCache[countryId];
      if (country.subregion) {
        subregions.add(country.subregion);
      }
    }

    res.json(Array.from(subregions).sort());
  } catch (err) {
    console.error("Error getting subregions:", err);
    res.status(500).json({ error: "Failed to retrieve subregions data" });
  }
});

app.get("/subregions/:subregion/countries", async (req, res) => {
  const subregion = req.params.subregion.toLowerCase();

  try {
    await initializeCache();

    const results = countriesListCache.filter(
      (country) =>
        country.subregion && country.subregion.toLowerCase() === subregion
    );

    res.json(results);
  } catch (err) {
    console.error("Error getting countries by subregion:", err);
    res.status(500).json({ error: "Failed to retrieve subregion data" });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache_initialized: countriesCache !== null,
    countries_count: countriesListCache ? countriesListCache.length : 0,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));

module.exports = app;
