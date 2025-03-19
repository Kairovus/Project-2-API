document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("fetchButton");
  const input = document.getElementById("steamId");
  const resultDiv = document.getElementById("result");
  const gamesContainer = document.getElementById("gamesContainer");

  button.addEventListener("click", async (event) => {
    event.preventDefault();

    const steamId = input.value.trim();
    if (!steamId) {
      resultDiv.innerHTML = "<p>Please enter a Steam ID.</p>";
      return;
    }

    try {
      const playerResponse = await fetch(`/steam/${steamId}`);
      if (!playerResponse.ok) throw new Error("Failed to fetch player data");

      const playerData = await playerResponse.json();
      console.log("Steam Player Data:", playerData);

      const gamesResponse = await fetch(`/steam/${steamId}/games`);
      if (!gamesResponse.ok) throw new Error("Failed to fetch games");

      const gameData = await gamesResponse.json();
      console.log("Recently Played Games:", gameData);

      if (
        playerData.response.players.length > 0 &&
        gameData.response.games.length > 0
      ) {
        const player = playerData.response.players[0]; // First player in the response
        const gamesCount = gameData.response.game_count; // Number of games owned
        const games = gameData.response.games; // Array of games

        document.getElementById("playerName").textContent = player.personaname;
        document.getElementById("avatar").src = player.avatarfull;
        document.getElementById(
          "playerSteamId"
        ).textContent = `Steam ID: ${player.steamid}`;
        const visibilityText = ["Unknown", "Private", "Friends Only", "Public"];
        document.getElementById(
          "playerVisibility"
        ).textContent = `Visibility: ${visibilityText[player.communityvisibilitystate] || "Unknown"
        }`;
        document.getElementById(
          "playerGameCount"
        ).textContent = `Game Count: ${gamesCount}`;
      } else {
        resultDiv.innerHTML = "<p>No player found.</p>";
        return;
      }

      gamesContainer.innerHTML = "";
      const contentWarnings = {
        1: "Nudity",
        2: "Violence",
        3: "Strong Language",
        4: "Drugs",
        5: "Gambling",
        // Add more mappings as needed
      };
      if (gameData.response.games.length > 0) {
        gameData.response.games.forEach((game) => {
          const gameCard = `
              <div class="col-3"> 
              <a href="https://store.steampowered.com/app/${game.appid}" style=text-decoration:none; target="_blank">
                <div class="card h-100 shadow-sm p-2">
                  <img src="https://steamcdn-a.akamaihd.net/steam/apps/${game.appid
            }/header.jpg" class="card-img img-fluid" alt="${game.name
            }" onerror="this.src='https://placehold.co/600x400?text=${game.name
            }'" style="height: 250px; object-fit: cover;">
                  <div class="card-body">
                    <h5 class="card-title mb-3">${game.name}</h5>
                    <p class="card-text text-muted mb-1">Play Time in Last 2 Weeks: ${Math.round(
              (game.playtime_2weeks || 0) / 60
            )} hours</p>
                    <p class="card-text text-muted mb-1">Last Played:  ${game.rtime_last_played
              ? new Date(
                game.rtime_last_played * 1000
              ).toLocaleDateString()
              : "Never"
            }</p> 
                     <p class="card-text text-muted mb-3">Content Warning: ${game.content_descriptorids &&
              game.content_descriptorids.length > 0
              ? game.content_descriptorids
                .map(
                  (id) => contentWarnings[id] || `Unknown (${id})`
                )
                .join(", ")
              : "None"
            }</p> 
                    <div class="d-flex justify-content-between align-items-center">
                      <small class="text-muted">Total Playtime: ${Math.round(
              game.playtime_forever / 60
            )} hours</small>
                      <span class="badge bg-success">${game.appid}</span>
                    </div>
                  </div>
                </div>
                </a>
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
