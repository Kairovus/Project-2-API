const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
const STEAM_API_KEY = "A6434BB4FD112148304538AABC377FDD";

// Proxy endpoint to fetch Steam player data
app.get("/steam/:steamId", async (req, res) => {
  try {
    const { steamId } = req.params;
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Steam data" });
  }
});

//Proxy endpoint to fetch Steam player-owned games
app.get("/steam/:steamId/games", async (req, res) => {
  try {
    const { steamId } = req.params;
    const includeAppInfo = true;
    const includePlayedFreeGames = true;
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=${includeAppInfo}&include_played_free_games=${includePlayedFreeGames}&format=json`;

    console.log("Fetching owned games from Steam API:", url); // Log the URL
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching owned games:",
      error.response ? error.response.data : error.message
    ); // Log errors
    res.status(500).json({ error: "Failed to fetch Steam data" });
  }
});

// Proxy endpoint to fetch Steam player's recently played games
app.get("/steam/:steamId/recent", async (req, res) => {
  try {
    const { steamId } = req.params;
    const url = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recent games" });
  }
});

// Proxy endpoint to fetch Steam player's friends list
app.get("/steam/:steamId/friends", async (req, res) => {
  try {
    const { steamId } = req.params;
    const url = `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${STEAM_API_KEY}&steamid=${steamId}`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch friends list" });
  }
});

// Proxy endpoint to fetch Steam player's detailed game information
app.get("/steam/:steamId/games/appId", async (req, res) => {
  try {
    const { steamId } = req.params;
    const url = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${STEAM_API_KEY}&appid=${appId}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game information" });
  }
});


// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html when visiting "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
