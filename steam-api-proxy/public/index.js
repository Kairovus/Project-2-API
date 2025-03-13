document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('fetchButton');
    const input = document.getElementById('steamIdInput');
    const resultDiv = document.getElementById('result');

    button.addEventListener('click', async () => {
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
                resultDiv.innerHTML = `
                    <h2>${player.personaname}</h2>
                    <img src="${player.avatarfull}" alt="Avatar">
                    <p>Steam ID: ${player.steamid}</p>
                    <p>Profile URL: <a href="${player.profileurl}" target="_blank">Visit Profile</a></p>
                `;
            } else {
                resultDiv.innerHTML = '<p>No player found.</p>';
            }
        } catch (error) {
            console.error('Error fetching Steam data:', error);
            resultDiv.innerHTML = '<p>Failed to fetch player data.</p>';
        }
    });
});
