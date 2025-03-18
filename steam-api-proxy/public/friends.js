document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("fetchButton");
    const input = document.getElementById("steamId");
    const friendContainer = document.getElementById("friendContainer");
    const searchBarConsider = document.getElementById("searchBarContainer")

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

            if (playerData.response.players.length > 0) {
                const player = playerData.response.players[0];
            }

            const friendsResponse = await fetch(`/steam/${steamId}/friends`);
            if (!friendsResponse.ok) throw new Error("Failed to fetch friends");


            const friendsData = await friendsResponse.json();
            console.log("Friends:", friendsData);

            // Clear previous results
            friendContainer.innerHTML = "";

            if (friendsData.friendslist.friends.length > 0) {
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
                            <div class="col-lg-5 d-flex bg-dark-subtle rounded align-self-start">
                                <img src="${friendProfile.avatarfull}" 
                                     class="card-img-top col img-fluid img-avatar rounded g-0 m-2 w-1" alt="avatar" />
                                <div class="card-body p-3">
                                    <h5 class="card-title fw-bold mb-3 text-left">${friendProfile.personaname}</h5>
                                    <p class="card-text mb-2">Steam ID: ${friend.steamid}</p>
                                    <p class="card-text mb-2">Since: ${friendSince.toDateString()}</p>
                                </div>
                            </div>
                        `;
                        friendContainer.innerHTML += friendCard;
                    }
                }
            }

            else {
                friendContainer.innerHTML = "<p>No friends found.</p>";
            }
        } catch (error) {
            console.error("Error fetching Steam data:", error);
            friendContainer.innerHTML = "<p>Failed to fetch player data.</p>";
        }
    });
});

