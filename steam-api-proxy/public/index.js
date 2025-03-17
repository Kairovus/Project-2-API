document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('fetchButton');
    const input = document.getElementById('steamId');
    const resultDiv = document.getElementById('result');

    button.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent form from refreshing the page

        const steamId = input.value.trim();
        if (!steamId) {
            resultDiv.innerHTML = '<p>Please enter a Steam ID.</p>';
            return;
        }

        try {
            const response = await fetch(`/steam/${steamId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch');
            }

            const data = await response.json();
            console.log('Steam Data:', data);

            if (data.response.players.length > 0) {
                const player = data.response.players[0];
            
                // Update the name
                document.getElementById("playerName").textContent = player.personaname;
            
                // Update the avatar
                document.getElementById("avatar").src = player.avatarfull;
            
                // Update the Steam ID
                document.getElementById("playerSteamId").textContent = `Steam ID: ${player.steamid}`;

                // Update the Real Name
                document.getElementById("playerRealName").textContent = `Real Name: ${player.realname}`;

                // Update the Country
                document.getElementById("playerCountry").textContent = `Country: ${player.loccountrycode}`;

                // Update the Status
                switch (player.profilestate) {
                    case 0:
                        document.getElementById("playerStatus").textContent = "Status: Offline";
                        break;
                    case 1:
                        document.getElementById("playerStatus").textContent = "Status: Online";
                        break;
                    case 2:
                        document.getElementById("playerStatus").textContent = "Status: Busy";
                        break;
                    case 3:
                        document.getElementById("playerStatus").textContent = "Status: Away";
                        break;
                    case 4:
                        document.getElementById("playerStatus").textContent = "Status: Snooze";
                        break;
                    case 5:
                        document.getElementById("playerStatus").textContent = "Status: Looking to Trade";
                        break;
                    case 6:
                        document.getElementById("playerStatus").textContent = "Status: Looking to Play";
                        break;
                    default:
                        document.getElementById("playerStatus").textContent = "Status: Unknown";
                }            

                //Upadate the Visibility State
                switch (player.communityvisibilitystate) {
                    case 1:
                        document.getElementById("playerVisibility").textContent = "Visibility: Private";
                        break;
                    case 2:
                        document.getElementById("playerVisibility").textContent = "Visibility: Friends Only";
                        break;
                    case 3:
                        document.getElementById("playerVisibility").textContent = "Visibility: Public";
                        break;
                    default:
                        document.getElementById("playerVisibility").textContent = "Visibility: Unknown";
                }
                // Update the Profile URL as a button
                document.getElementById("playerProfileUrl").href = player.profileurl;
            } else {
                resultDiv.innerHTML = '<p>No player found.</p>';
            }
        } catch (error) {
            console.error('Error fetching Steam data:', error);
            resultDiv.innerHTML = '<p>Failed to fetch player data.</p>';
        }
    });
});