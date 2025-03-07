document.addEventListener('DOMContentLoaded', () => {
    const arenaDisplay = document.getElementById('arena-display');
    const playerImagesContainer = document.getElementById('player-images');
    const cornucopiaSetup = document.getElementById('cornucopia-setup');
    const cornucopiaSizeInput = document.getElementById('cornucopia-size');
    const placeCornucopiaButton = document.getElementById('place-cornucopia');
    const saveButton = document.getElementById('save-positions');

    // Retrieve player data from localStorage
    const players = JSON.parse(localStorage.getItem('players')) || [];
    const arenaData = JSON.parse(localStorage.getItem('arenaData')) || {
        size: 10, // Grid size, example: 10x10
        tiles: Array(10).fill(null).map(() => Array(10).fill({ type: 'grasslands' })) // 10x10 grid of 'grasslands'
    };

    // Store player positions and cornucopia data
    const playerPositions = [];
    let cornucopiaTiles = [];
    let currentPlayer = null; // Keeps track of the currently selected player
    let allPlayersPlaced = false; // Track if all players are placed

    // Function to create the arena grid
    function displayArena(arenaData) {
        const { size, tiles } = arenaData;
        arenaDisplay.innerHTML = ''; // Clear the arena

        // Set the grid template based on size
        const tileSize = Math.floor(arenaDisplay.clientWidth / size); // Make tile size responsive
        arenaDisplay.style.gridTemplateColumns = `repeat(${size}, ${tileSize}px)`;
        arenaDisplay.style.gridTemplateRows = `repeat(${size}, ${tileSize}px)`;

        // Loop to create tiles based on arena data
        tiles.forEach((row, y) => {
            row.forEach((tileData, x) => {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                if (tileData === null) {
                    tile.classList.add('disabled');
                } else {
                    tile.classList.add(tileData.type); // Add terrain type class (e.g., grasslands)
                }
                tile.setAttribute('data-x', x);
                tile.setAttribute('data-y', y);

                // Add click event to place player or cornucopia
                tile.addEventListener('click', () => {
                    if (currentPlayer && !allPlayersPlaced) {
                        placePlayerOnTile(tile, currentPlayer, x, y);
                    } else if (allPlayersPlaced) {
                        placeCornucopia(tile, x, y);
                    }
                });

                arenaDisplay.appendChild(tile);
            });
        });
    }

    // Function to display the players in the sidebar
    function displayPlayerImages() {
        playerImagesContainer.innerHTML = ''; // Clear existing images
        players.forEach(player => {
            const playerCircle = document.createElement('div');
            playerCircle.classList.add('player-circle');
            const playerImg = document.createElement('img');
            playerImg.src = player.image || 'https://via.placeholder.com/100'; // Default image if none provided
            playerImg.style.borderColor = player.color; // Set border color to player's chosen color
            playerCircle.appendChild(playerImg);

            // Highlight selected player
            playerCircle.addEventListener('click', () => {
                if (!allPlayersPlaced) {
                    currentPlayer = player; // Set the current selected player
                    document.querySelectorAll('.player-circle').forEach(circle => {
                        circle.classList.remove('selected');
                    });
                    playerCircle.classList.add('selected');
                }
            });

            playerImagesContainer.appendChild(playerCircle);
        });
    }

    // Function to place the player on the selected tile
    function placePlayerOnTile(tile, player, x, y) {
        // Check if the tile is disabled
        if (tile.classList.contains('disabled')) {
            alert('Cannot place players on disabled tiles!');
            return;
        }

        // Check if the player is already on this tile
        const existingMarker = tile.querySelector('.player-marker');
        if (existingMarker) {
            // Remove the marker from the tile
            existingMarker.remove();

            // Remove the player's position from the playerPositions array
            const playerIndex = playerPositions.findIndex(pos => pos.playerId === player.id);
            if (playerIndex !== -1) {
                playerPositions.splice(playerIndex, 1);
            }

            console.log(`${player.name} removed from (${x}, ${y})`);
            return;
        }

        // Check if the player is already placed elsewhere
        const existingPlayerPosition = playerPositions.find(pos => pos.playerId === player.id);
        if (existingPlayerPosition) {
            // Remove the marker from the previous tile
            const previousTile = arenaDisplay.querySelector(
                `[data-x="${existingPlayerPosition.x}"][data-y="${existingPlayerPosition.y}"]`
            );
            if (previousTile) {
                const previousMarker = previousTile.querySelector('.player-marker');
                if (previousMarker) {
                    previousMarker.remove();
                }
            }

            // Update the player's position in the playerPositions array
            existingPlayerPosition.x = x;
            existingPlayerPosition.y = y;
        } else {
            // Add the player's position to the playerPositions array
            playerPositions.push({ playerId: player.id, x, y });
        }

        // Create a new player marker
        const playerMarker = document.createElement('div');
        playerMarker.classList.add('player-marker');
        playerMarker.style.backgroundColor = player.color; // Set marker color to player's chosen color
        tile.appendChild(playerMarker);

        console.log('Player Positions:', playerPositions); // For debugging

        // Check if all players are placed
        if (playerPositions.length === players.length) {
            allPlayersPlaced = true;
            cornucopiaSetup.style.display = 'block'; // Show cornucopia setup

            // Clear the selected player
            currentPlayer = null;
            document.querySelectorAll('.player-circle').forEach(circle => {
                circle.classList.remove('selected');
            });
        }
    }

    // Function to place the cornucopia
    function placeCornucopia(tile, x, y) {
        // Check if the tile is disabled
        if (tile.classList.contains('disabled')) {
            alert('Cannot place the cornucopia on disabled tiles!');
            return;
        }

        const size = parseInt(cornucopiaSizeInput.value);
        if (size < 2 || size > 5) {
            alert('Cornucopia size must be between 2 and 5!');
            return;
        }

        // Check if the clicked tile is part of the cornucopia
        const isCornucopiaTile = cornucopiaTiles.some(
            pos => pos.x === x && pos.y === y
        );

        if (isCornucopiaTile) {
            // Remove the cornucopia from all tiles
            cornucopiaTiles.forEach(pos => {
                const tile = arenaDisplay.querySelector(
                    `[data-x="${pos.x}"][data-y="${pos.y}"]`
                );
                if (tile) {
                    tile.classList.remove('cornucopia');
                }
            });
            cornucopiaTiles = [];
            console.log('Cornucopia removed');
            return;
        }

        // Clear existing cornucopia tiles
        cornucopiaTiles.forEach(pos => {
            const tile = arenaDisplay.querySelector(
                `[data-x="${pos.x}"][data-y="${pos.y}"]`
            );
            if (tile) {
                tile.classList.remove('cornucopia');
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
                    tile.classList.add('cornucopia'); // Add the cornucopia class
                    cornucopiaTiles.push({ x: tileX, y: tileY }); // Store the coordinates
                    console.log(`Cornucopia added to (${tileX}, ${tileY})`);
                }
            }
        }
    }

    // Save player positions and cornucopia data
    saveButton.addEventListener('click', () => {
        if (!allPlayersPlaced || cornucopiaTiles.length === 0) {
            alert('Please place all players and the cornucopia!');
            return;
        }

        // Save the data (e.g., to localStorage or a backend)
        localStorage.setItem('playerPositions', JSON.stringify(playerPositions));
        localStorage.setItem('cornucopiaTiles', JSON.stringify(cornucopiaTiles));

        // Navigate to the main simulation screen
        window.location.href = '../simulation.html';
    });

    // Display the player images and arena on page load
    displayPlayerImages();
    displayArena(arenaData);

    // Adjust the grid layout on window resize (to handle dynamic resizing)
    window.addEventListener('resize', () => {
        displayArena(arenaData); // Re-render the arena when resizing the window
    });
});