document.addEventListener('DOMContentLoaded', () => {
    const playerGrid = document.getElementById('player-grid');
    const playerEditModal = document.getElementById('player-edit-modal');
    const closeModal = document.querySelector('.close-modal');
    const playerEditForm = document.getElementById('player-edit-form');
    const playerNameInput = document.getElementById('player-name');
    const playerImageInput = document.getElementById('player-image');
    const playerColorInput = document.getElementById('player-color');
    const addPlayerButton = document.getElementById('add-player');
    const saveButton = document.getElementById('save-characters');

    let currentPlayer = null;

    // Array to store player data
    let players = Array.from({ length: 24 }, (_, index) => ({
        id: index + 1,
        name: `Player ${index + 1}`,
        image: null, // Default image (can be replaced with a placeholder)
        //color: '#ff0000', // Default color is red
    }));

    // Render the player grid
    function renderPlayers() {
        playerGrid.innerHTML = '';
        players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.classList.add('player-card');
            playerCard.innerHTML = `
                <img src="${player.image || 'https://via.placeholder.com/100'}" alt="${player.name}" style="border-color: ${player.color};">
                <p>${player.name}</p>
                
                <button class="remove-player" data-id="${player.id}" style="display: ${players.length === 2 ? 'none' : 'inline-block'};">Remove</button>
            `;
            playerCard.addEventListener('click', () => openEditModal(player));
            playerGrid.appendChild(playerCard);
        });

        //<div class="color-circle" style="background-color: ${player.color};"></div>

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-player').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the player card click event
                removePlayer(button.dataset.id);
            });
        });
    }

    // Open the edit modal
    function openEditModal(player) {
        currentPlayer = player;
        playerNameInput.value = player.name;
        playerImageInput.value = ''; // Clear the file input
        playerColorInput.value = player.color; // Set the color picker value
        playerEditModal.style.display = 'flex';
    }

    // Close the edit modal
    function closeEditModal() {
        playerEditModal.style.display = 'none';
    }

    // Handle form submission
    playerEditForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Update player name
        currentPlayer.name = playerNameInput.value;

        // Update player color
        currentPlayer.color = playerColorInput.value;

        // Update player image if a file is selected
        if (playerImageInput.files[0]) {
            const file = playerImageInput.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                currentPlayer.image = e.target.result;
                renderPlayers(); // Re-render the grid
            };
            reader.readAsDataURL(file);
        } else {
            renderPlayers(); // Re-render the grid even if no new image is selected
        }

        closeEditModal();
    });

    // Add a new player
    addPlayerButton.addEventListener('click', () => {
        const newPlayer = {
            id: players.length + 1, // Generate a unique ID
            name: `Player ${players.length + 1}`,
            image: null,
            color: '#ff0000', // Default color is red
        };
        players.push(newPlayer);
        renderPlayers(); // Re-render the grid
    });

    // Remove a player
    function removePlayer(playerId) {
        players = players.filter(player => player.id !== parseInt(playerId));
        renderPlayers(); // Re-render the grid
    }

    // Close modal when clicking the close button
    closeModal.addEventListener('click', closeEditModal);

    // Close modal when clicking outside the modal
    window.addEventListener('click', (e) => {
        if (e.target === playerEditModal) {
            closeEditModal();
        }
    });

    saveButton.addEventListener('click', () => {
        // Save player data to localStorage
        localStorage.setItem('players', JSON.stringify(players));
        
        // Navigate to the next page (simulation.html or whatever your next page is)
        window.location.href = 'simulation_setup.html'; // Adjust the path as needed
    });

    // Initial render
    renderPlayers();
});