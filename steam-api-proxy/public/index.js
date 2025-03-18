document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("fetchButton");
  const input = document.getElementById("steamId");
  const resultDiv = document.getElementById("result");
  const gamesContainer = document.getElementById("gamesContainer"); // Make sure this matches your container

  button.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent form submission from reloading page

    const steamId = input.value.trim();
    if (!steamId) {
      resultDiv.innerHTML = "<p>Please enter a Steam ID.</p>";
      return;
    }

    try {
      // Fetch Steam player profile data
      const playerResponse = await fetch(`/steam/${steamId}`);
      if (!playerResponse.ok) throw new Error("Failed to fetch player data");

      const playerData = await playerResponse.json();
      console.log("Steam Player Data:", playerData);

      if (playerData.response.players.length > 0) {
        const player = playerData.response.players[0];

        // Update UI with player info
        document.getElementById("playerName").textContent = player.personaname;
        document.getElementById("avatar").src = player.avatarfull;
        document.getElementById(
          "playerSteamId"
        ).textContent = `Steam ID: ${player.steamid}`;
        document.getElementById("playerRealName").textContent = `Real Name: ${
          player.realname || "N/A"
        }`;
        document.getElementById("playerCountry").textContent = `Country: ${
          player.loccountrycode || "Unknown"
        }`;
        document.getElementById("playerProfileUrl").href = player.profileurl;

        // Update status
        const statusText = [
          "Offline",
          "Online",
          "Busy",
          "Away",
          "Snooze",
          "Looking to Trade",
          "Looking to Play",
        ];
        document.getElementById("playerStatus").textContent = `Status: ${
          statusText[player.profilestate] || "Unknown"
        }`;

        // Update visibility
        const visibilityText = ["Unknown", "Private", "Friends Only", "Public"];
        document.getElementById(
          "playerVisibility"
        ).textContent = `Visibility: ${
          visibilityText[player.communityvisibilitystate] || "Unknown"
        }`;
      } else {
        resultDiv.innerHTML = "<p>No player found.</p>";
        return;
      }

      // Fetch recently played games
      const gamesResponse = await fetch(`/steam/${steamId}/recent`);
      if (!gamesResponse.ok) throw new Error("Failed to fetch games");

      const gameData = await gamesResponse.json();
      console.log("Recently Played Games:", gameData);

      // Clear previous results
      gamesContainer.innerHTML = "";

      if (gameData.response.games.length > 0) {
        gameData.response.games.forEach((game) => {
          const gameCard = `
              <div class="col-3">
                <div class="card h-100 shadow-sm p-2">
                  <img src="https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/header.jpg" class="card-img img-fluid" alt="${game.name}" onerror="this.src='https://placehold.co/600x400?text=${game.name}'" style="height: 250px; object-fit: cover;">
                  <div class="card-body">
                    <h5 class="card-title">${game.name}</h5>
                    <p class="card-text text-muted">Play Time in Last 2 Weeks: ${Math.round(
                      (game.playtime_2weeks || 0) / 60
                    )} hours</p>
                    <div class="d-flex justify-content-between align-items-center">
                      <small class="text-muted">Total Playtime: ${Math.round(
                        game.playtime_forever / 60
                      )} hours</small>
                      <span class="badge bg-success">${game.appid}</span>
                    </div>
                  </div>
                </div>
              </div>
            `;

          gamesContainer.innerHTML += gameCard;
        });
      } else {
        gamesContainer.innerHTML = "<p>No recently played games found.</p>";
      }
    } catch (error) {
      console.error("Error fetching Steam data:", error);
      resultDiv.innerHTML = "<p>Failed to fetch player data.</p>";
    }
  });
});
