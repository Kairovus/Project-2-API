const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

const STEAM_API_KEY = 'A6434BB4FD112148304538AABC377FDD';

// Proxy endpoint to fetch Steam player data
app.get('/steam/:steamId', async (req, res) => {
    try {
        const { steamId } = req.params;
        const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Steam data' });
    }
});


// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html when visiting "/"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
