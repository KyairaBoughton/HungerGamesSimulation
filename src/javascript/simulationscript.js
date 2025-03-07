document.addEventListener('DOMContentLoaded', () => {
    const arenaDisplay = document.getElementById('arena-display');
    const playerInfo = document.getElementById('player-info');
    const logContent = document.getElementById('log-content');

    // Retrieve arena data from localStorage
    const arenaData = JSON.parse(localStorage.getItem('arenaData'));
    console.log('Arena Data Retrieved:', arenaData); // Debugging

    if (!arenaData) {
        console.error('No arena data found in localStorage.');
        return;
    }

    // Retrieve player data and positions from localStorage
    const players = JSON.parse(localStorage.getItem('players')) || [];
    const playerPositions = JSON.parse(localStorage.getItem('playerPositions')) || [];

    // Display the arena
    displayArena(arenaData);

    // Place players on the arena
    placePlayers(players, playerPositions);

    // Function to display the arena
    function displayArena(arenaData) {
        const { size, shape, tiles } = arenaData;

        // Clear the display area
        arenaDisplay.innerHTML = '';

        // Calculate tile size based on container dimensions
        const containerWidth = arenaDisplay.clientWidth;
        const containerHeight = arenaDisplay.clientHeight;
        const tileSize = Math.min(containerWidth / size, containerHeight / size);

        console.log('Container Width:', containerWidth); // Debugging
        console.log('Container Height:', containerHeight); // Debugging
        console.log('Tile Size:', tileSize); // Debugging

        // Set up the grid
        arenaDisplay.style.display = 'grid';
        arenaDisplay.style.gridTemplateColumns = `repeat(${size}, ${tileSize}px)`;
        arenaDisplay.style.gridTemplateRows = `repeat(${size}, ${tileSize}px)`;

        // Create and append tiles
        for (let y = 0; y < tiles.length; y++) {
            for (let x = 0; x < tiles[y].length; x++) {
                const tileData = tiles[y][x];
                const tile = document.createElement('div');
                tile.classList.add('tile');

                if (tileData === null) {
                    tile.classList.add('disabled');
                } else {
                    tile.classList.add(tileData.type); // Add the terrain type as a class
                }

                // Add data attributes for position
                tile.setAttribute('data-x', x);
                tile.setAttribute('data-y', y);

                arenaDisplay.appendChild(tile);
            }
        }

        console.log('Arena Display Created'); // Debugging
    }

    // Function to place players on the arena
    function placePlayers(players, playerPositions) {
        playerPositions.forEach(pos => {
            const player = players.find(p => p.id === pos.playerId);
            if (player) {
                const tile = arenaDisplay.querySelector(
                    `[data-x="${pos.x}"][data-y="${pos.y}"]`
                );
                if (tile) {
                    const playerMarker = document.createElement('div');
                    playerMarker.classList.add('player-marker');
                    playerMarker.style.backgroundColor = player.color; // Set marker color to player's chosen color
                    playerMarker.addEventListener('click', () => showPlayerInfo(player));
                    tile.appendChild(playerMarker);
                }
            }
        });
    }

    // Function to show player information
    function showPlayerInfo(player) {
        playerInfo.innerHTML = `
            <div class="player-info-card">
                <img src="${player.image || 'https://via.placeholder.com/50'}" alt="${player.name}">
                <div>
                    <h3>${player.name}</h3>
                    <p>Health: ${player.health || 'N/A'}</p>
                </div>
            </div>
        `;
    }

    // Function to place the cornucopia
    function placeCornucopia(tile, x, y) {
        const size = parseInt(cornucopiaSizeInput.value);
        if (size < 2 || size > 5) {
            alert('Cornucopia size must be between 2 and 5!');
            return;
        }

        // Clear existing cornucopia tiles
        cornucopiaTiles.forEach(pos => {
            const tile = arenaDisplay.querySelector(
                `[data-x="${pos.x}"][data-y="${pos.y}"]`
            );
            if (tile) {
                const cornucopiaMarker = tile.querySelector('.cornucopia-marker');
                if (cornucopiaMarker) {
                    cornucopiaMarker.remove();
                }
            }
        });
        cornucopiaTiles = [];

        // Place the cornucopia
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const tileX = x + i;
                const tileY = y + j;
                const tile = arenaDisplay.querySelector(`[data-x="${tileX}"][data-y="${tileY}"]`);
                if (tile && !tile.classList.contains('disabled')) {
                    const cornucopiaMarker = document.createElement('img');
                    cornucopiaMarker.src = '../../../resources/arena/cornucopia.png'; // Replace with the actual path to the cornucopia image
                    cornucopiaMarker.classList.add('cornucopia-marker');
                    tile.appendChild(cornucopiaMarker);
                    cornucopiaTiles.push({ x: tileX, y: tileY });
                    console.log(`Cornucopia added to (${tileX}, ${tileY})`);
                }
            }
        }
    }

    // Clear the text log (remove example updates)
    logContent.innerHTML = '<p>Simulation start</p>';
});