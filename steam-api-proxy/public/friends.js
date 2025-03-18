document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("fetchButton");
  const input = document.getElementById("steamId");
  const friendContainer = document.getElementById("friendContainer");
  const searchBarConsider = document.getElementById("searchBarContainer");

  button.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent form submission from reloading page

    const steamId = input.value.trim();
    if (!steamId) {
      friendContainer.innerHTML = "<p>Please enter a Steam ID.</p>";
      return;
    }

    try {
      // Fetch Steam player profile data
      const playerResponse = await fetch(`/steam/${steamId}`);
      if (!playerResponse.ok) throw new Error("Failed to fetch player data");

      const playerData = await playerResponse.json();
      console.log("Steam Player Data:", playerData);

      const friendsResponse = await fetch(`/steam/${steamId}/friends`);
      if (!friendsResponse.ok) throw new Error("Failed to fetch friends");

      const friendsData = await friendsResponse.json();
      console.log("Friends:", friendsData);

      // Clear previous results
      friendContainer.innerHTML = "";

      if (
        playerData.response.players.length > 0 &&
        friendsData.friendslist.friends.length > 0
      ) {
        const player = playerData.response.players[0];

        document.getElementById("playerName").textContent = player.personaname;
        document.getElementById("avatar").src = player.avatarfull;
        document.getElementById(
          "playerSteamId"
        ).textContent = `Steam ID: ${player.steamid}`;
        const visibilityText = ["Unknown", "Private", "Friends Only", "Public"];
        document.getElementById(
          "playerVisibility"
        ).textContent = `Visibility: ${
          visibilityText[player.communityvisibilitystate] || "Unknown"
        }`;
        document.getElementById(
          "playerFriends"
        ).textContent = `Friends: ${friendsData.friendslist.friends.length}`;

        for (const friend of friendsData.friendslist.friends) {
          // For each friend, fetch their profile data (this includes their avatar and username)
          const friendResponse = await fetch(`/steam/${friend.steamid}`);
          const friendData = await friendResponse.json();

          if (friendData.response.players.length > 0) {
            const friendProfile = friendData.response.players[0];
            const unixTimestamp = friend.friend_since;
            const friendSince = new Date(unixTimestamp * 1000);

            // Create the card for the friend with avatar and username
            const friendCard = `
                              <div class="col-lg-5">
                      <div class="card p-4 shadow-sm border-0 h-100">
                          <div class="row g-0">
                              <div class="col-auto d-flex justify-content-center align-items-center">
                                  <div class="position-relative">
                                      <img src="${friendProfile.avatarfull}" 
                                           class="img-fluid rounded-circle border border-3 border-primary"
                                           style="width: 100px; height: 100px; object-fit: cover; display: block; margin: 0 auto;"
                                           alt="avatar" />
                                      <span class="position-absolute bottom-0 end-0 bg-success rounded-circle p-2 border border-2 border-white"
                                            style="width: 20px; height: 20px"></span>
                                  </div>
                              </div>
                              <div class="col">
                                  <div class="card-body ps-4">
                                      <h5 class="card-title text-center fs-4 mb-3" style="color: #2c3e50; font-weight: 600">
                                          ${friendProfile.personaname}
                                      </h5>
                                      <div class="d-flex flex-column gap-2">
                                          <div class="d-flex align-items-center">
                                              <i class="bi bi-steam me-2"></i>
                                              <p class="card-text mb-0" style="color: #6c757d">Steam ID: ${
                                                friend.steamid
                                              }</p>
                                          </div>
                                          <div class="d-flex align-items-center">
                                              <i class="bi bi-calendar me-2"></i>
                                              <p class="card-text mb-0" style="color: #6c757d">Since: ${friendSince.toLocaleDateString()}</p>
                                          </div>
                                      </div>
                                      <div class="mt-3 d-flex justify-content-center">
                                          <a href="https://steamcommunity.com/profiles/${
                                            friend.steamid
                                          }" 
                                             class="btn btn-primary btn-sm fifth-accent text-black fw-bold border border-dark px-3"
                                             target="_blank">
                                              View Profile
                                          </a>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              `;
            friendContainer.innerHTML += friendCard;
          } else {
            resultDiv.innerHTML = "<p>No player found.</p>";
            friendContainer.innerHTML = "<p>No friends found.</p>";
            return;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching Steam data:", error);
      friendContainer.innerHTML = "<p>Failed to fetch player data.</p>";
    }
  });
});
