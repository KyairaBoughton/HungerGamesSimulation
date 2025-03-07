// script.js

// Get references to the screens and buttons
const startScreen = document.getElementById('start-screen');
const setupScreen1 = document.getElementById('setup-screen-1');
const setupScreen2 = document.getElementById('setup-screen-2');
const startButton = document.getElementById('start-button');
const nextButton1 = document.getElementById('next-button-1');
const nextButton2 = document.getElementById('next-button-2');
const playerCountInput = document.getElementById('player-count');
const playerNamesContainer = document.getElementById('player-names');

// Show the first setup screen when the start button is clicked
startButton.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  setupScreen1.classList.remove('hidden');
});

// Show the second setup screen when the next button on the first screen is clicked
nextButton1.addEventListener('click', () => {
  const playerCount = parseInt(playerCountInput.value);

  // Clear any existing player name inputs
  playerNamesContainer.innerHTML = '';

  // Add input fields for each player
  for (let i = 1; i <= playerCount; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Player ${i} Name`;
    input.required = true;
    playerNamesContainer.appendChild(input);
    playerNamesContainer.appendChild(document.createElement('br'));
  }

  setupScreen1.classList.add('hidden');
  setupScreen2.classList.remove('hidden');
});

// Start the game when the next button on the second screen is clicked
nextButton2.addEventListener('click', () => {
  const playerNames = Array.from(playerNamesContainer.querySelectorAll('input')).map(input => input.value);
  alert(`Starting game with players: ${playerNames.join(', ')}`);
  // Here, you would initialize the game with the player names and other settings
});