document.addEventListener("DOMContentLoaded", () => {
  const fetchButton = document.getElementById("fetchButton");
  const steamIdInput = document.getElementById("steamId");
  const friendContainer = document.getElementById("friendContainer");
  const searchBarContainer = document.getElementById("searchBarContainer");

  // Store all friend data to be used for searching
  let allFriends = [];

  // Add search functionality
  const searchInput = document.querySelector('input[placeholder="Search friends by name"]');
  const searchButton = searchInput.closest('form').querySelector('button');

  searchButton.addEventListener("click", (event) => {
    event.preventDefault();

    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!allFriends.length) {
      searchBarContainer.innerHTML = "<p>Please fetch friends data first.</p>";
      return;
    }

    if (!searchTerm) {
      // If search is empty, show all friends
      friendContainer.innerHTML = ""; // Clear the container first
      displayFriends(allFriends);
      return;
    }

    // Filter friends based on search term
    const filteredFriends = allFriends.filter(friend =>
      friend.personaname.toLowerCase().includes(searchTerm)
    );

    if (filteredFriends.length === 0) {
      searchBarContainer.innerHTML = "<p>No friends found matching your search.</p>";
      friendContainer.innerHTML = ""; // Clear friend display
    } else {
      searchBarContainer.innerHTML = ""; // Clear any previous messages
      displayFriends(filteredFriends);
    }
  });

  fetchButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const steamId = steamIdInput.value.trim();
    if (!steamId) {
      friendContainer.innerHTML = "<p>Please enter a Steam ID.</p>";
      return;
    }

    try {
      // Show loading state
      friendContainer.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
      
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
      searchBarContainer.innerHTML = "";
      allFriends = []; // Reset friends data

      if (playerData.response.players.length > 0) {
        const player = playerData.response.players[0];

        // Update player card immediately
        document.getElementById("playerName").textContent = player.personaname;
        document.getElementById("avatar").src = player.avatarfull;
        document.getElementById("playerSteamId").textContent = `Steam ID: ${player.steamid}`;
        const visibilityText = ["Unknown", "Private", "Friends Only", "Public"];
        document.getElementById("playerVisibility").textContent = 
          `Visibility: ${visibilityText[player.communityvisibilitystate] || "Unknown"}`;
        document.getElementById("playerFriends").textContent = 
          `Friends: ${friendsData.friendslist.friends.length}`;

        // If there are friends, load them in batches
        if (friendsData.friendslist.friends.length > 0) {
          const BATCH_SIZE = 10; // Number of friends to load at once
          const friends = friendsData.friendslist.friends;
          
          // Load first batch immediately
          await loadFriendBatch(friends.slice(0, BATCH_SIZE));
          
          // Load remaining batches if any
          if (friends.length > BATCH_SIZE) {
            for (let i = BATCH_SIZE; i < friends.length; i += BATCH_SIZE) {
              const batch = friends.slice(i, i + BATCH_SIZE);
              await loadFriendBatch(batch);
            }
          }
        } else {
          friendContainer.innerHTML = "<p>No friends found.</p>";
        }
      } else {
        friendContainer.innerHTML = "<p>No player found.</p>";
      }
    } catch (error) {
      console.error("Error fetching Steam data:", error);
      friendContainer.innerHTML = "<p>Failed to fetch player data.</p>";
    }
  });

  // Function to load a batch of friends
  async function loadFriendBatch(friends) {
    const batchPromises = friends.map(async (friend) => {
      try {
        const friendResponse = await fetch(`/steam/${friend.steamid}`);
        const friendData = await friendResponse.json();

        if (friendData.response.players.length > 0) {
          const friendProfile = friendData.response.players[0];
          friendProfile.friend_since = friend.friend_since;
          friendProfile.steamid = friend.steamid;
          return friendProfile;
        }
      } catch (error) {
        console.error(`Error fetching friend ${friend.steamid}:`, error);
      }
      return null;
    });

    const batchResults = await Promise.all(batchPromises);
    const validFriends = batchResults.filter(friend => friend !== null);
    allFriends = [...allFriends, ...validFriends];
    
    // Display the new batch of friends
    displayFriends(validFriends);
  }

  // Function to display friends
  function displayFriends(friendsToDisplay) {
    // Clear the container if this is a new search
    if (searchInput.value.trim()) {
      friendContainer.innerHTML = "";
    }
    
    friendsToDisplay.forEach(friendProfile => {
      const unixTimestamp = friendProfile.friend_since;
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
                      <p class="card-text mb-0" style="color: #6c757d">Steam ID: ${friendProfile.steamid}</p>
                    </div>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-calendar me-2"></i>
                      <p class="card-text mb-0" style="color: #6c757d">Since: ${friendSince.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div class="mt-3 d-flex justify-content-center">
                    <a href="https://steamcommunity.com/profiles/${friendProfile.steamid}" 
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
    });
  }
});