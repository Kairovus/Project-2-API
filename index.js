const API_KEY = 'A6434BB4FD112148304538AABC377FDD';  // Replace with your actual Steam API key

async function fetchPlayerInfo() {
    const steamId = document.getElementById("steamIdInput").value.trim();
    if (!steamId) {
        alert("Please enter a valid Steam ID.");
        return;
    }

    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${API_KEY}&steamids=${steamId}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const player = data.response.players[0];

        if (!player) {
            document.getElementById("playerInfo").innerHTML = "<p class='text-danger'>Player not found.</p>";
            return;
        }

        document.getElementById("playerInfo").innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${player.personaname}</h5>
                    <img src="${player.avatarfull}" class="img-thumbnail">
                    <p><strong>Steam ID:</strong> ${player.steamid}</p>
                    <p><strong>Profile Status:</strong> ${player.communityvisibilitystate === 3 ? "Public" : "Private"}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error fetching Steam data:", error);
        document.getElementById("playerInfo").innerHTML = "<p class='text-danger'>Failed to fetch data. Try again later.</p>";
        console.log(error);
    }
}
