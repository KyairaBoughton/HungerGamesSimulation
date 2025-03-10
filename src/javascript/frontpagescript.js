document.addEventListener('DOMContentLoaded', () => {
    const startGameButton = document.getElementById('start-game');

    // Redirect to the next page when the button is clicked
    startGameButton.addEventListener('click', () => {
        window.location.href = 'html/setup/arena_setup.html'; // Replace with the actual path to the next page
    });
});