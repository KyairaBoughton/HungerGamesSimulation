document.addEventListener('DOMContentLoaded', () => {
    const arenaGrid = document.getElementById('arena-grid');
    const arenaSizeInput = document.getElementById('arena-size');
    const arenaShapeInput = document.getElementById('arena-shape');
    const generateArenaButton = document.getElementById('generate-arena');
    const tileHeightInput = document.getElementById('tile-height');
    const applyTileHeightButton = document.getElementById('apply-tile-height');
    const updateTerrainRangesButton = document.getElementById('update-terrain-ranges');
    const saveArenaButton = document.getElementById('save-arena');

    const waterSandLabel = document.getElementById('water-sand-label');
    const sandGrasslandsLabelStart = document.getElementById('sand-grasslands-label-start');
    const sandGrasslandsLabelEnd = document.getElementById('sand-grasslands-label-end');
    const grasslandsForestsLabelStart = document.getElementById('grasslands-forests-label-start');
    const grasslandsForestsLabelEnd = document.getElementById('grasslands-forests-label-end');
    const forestsRocksLabelStart = document.getElementById('forests-rocks-label-start');
    const forestsRocksLabelEnd = document.getElementById('forests-rocks-label-end');
    const rocksLabel = document.getElementById('rocks-label');

    let grid = [];
    let selectedTiles = [];

    // Track current shape and size
    let currentShape = 'square';
    let currentSize = 20;

    // Initialize terrain boundaries
    let terrainBoundaries = {
        water: 0.2,
        sand: 0.4,
        grasslands: 0.6,
        forests: 0.8,
        rocks: 1,
    };

    // Initialize noUiSlider
    const terrainSlider = document.getElementById('terrain-slider');
    noUiSlider.create(terrainSlider, {
        start: [0.2, 0.4, 0.6, 0.8], // 5 handles (6 values)
        connect: [true, true, true, true, true], // 5 connections (one for each segment)
        range: {
            min: 0,
            max: 1,
        },
        step: 0.01, // Allow fine-grained control
    });

    // Update terrain boundaries when the slider changes
    terrainSlider.noUiSlider.on('update', (values) => {
        terrainBoundaries.water = parseFloat(values[0]);
        terrainBoundaries.sand = parseFloat(values[1]);
        terrainBoundaries.grasslands = parseFloat(values[2]);
        terrainBoundaries.forests = parseFloat(values[3]);

        // Update labels
        waterSandLabel.textContent = terrainBoundaries.water.toFixed(2);
        sandGrasslandsLabelStart.textContent = terrainBoundaries.water.toFixed(2);
        sandGrasslandsLabelEnd.textContent = terrainBoundaries.sand.toFixed(2);
        grasslandsForestsLabelStart.textContent = terrainBoundaries.sand.toFixed(2);
        grasslandsForestsLabelEnd.textContent = terrainBoundaries.grasslands.toFixed(2);
        forestsRocksLabelStart.textContent = terrainBoundaries.grasslands.toFixed(2);
        forestsRocksLabelEnd.textContent = terrainBoundaries.forests.toFixed(2);
        rocksLabel.textContent = terrainBoundaries.forests.toFixed(2);
    });

    // Generate a grid with Perlin noise
    function generateGrid(size, shape) {
        console.log(`Generating grid with size: ${size}, shape: ${shape}`); // Debugging
        grid = [];
        arenaGrid.innerHTML = '';

        // Fixed container size
        const containerSize = 400; // 400px by 400px
        const tileSize = containerSize / size; // Calculate tile size based on number of tiles

        arenaGrid.style.gridTemplateColumns = `repeat(${size}, ${tileSize}px)`;
        arenaGrid.style.width = `${containerSize}px`;
        arenaGrid.style.height = `${containerSize}px`;

        // Scale factor for Perlin noise (controls smoothness)
        const scale = 10;

        // Calculate the center of the grid
        const center = (size - 1) / 2;

        for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) {
                // Check if the tile is within the circle (if shape is circle)
                const distance = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
                const isInCircle = shape === 'circle' ? distance <= center : true;

                // Generate Perlin noise value (scaled to 0-1)
                const noiseValue = noise.perlin2(x / scale, y / scale); // Use the Perlin noise function
                const height = (noiseValue + 1) / 2; // Normalize to 0-1 range

                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.dataset.height = height;

                // Disable tiles outside the circle (if shape is circle)
                if (!isInCircle) {
                    tile.classList.add('disabled');
                }

                tile.addEventListener('click', () => selectTile(tile));
                updateTileAppearance(tile);
                arenaGrid.appendChild(tile);
                row.push(tile);
            }
            grid.push(row);
        }
    }

    // Update tile appearance based on height
    function updateTileAppearance(tile) {
        if (tile.classList.contains('disabled')) return; // Skip disabled tiles

        const height = parseFloat(tile.dataset.height);
        tile.classList.remove('water', 'sand', 'grasslands', 'forests', 'rocks');

        if (height <= terrainBoundaries.water) tile.classList.add('water');
        else if (height <= terrainBoundaries.sand) tile.classList.add('sand');
        else if (height <= terrainBoundaries.grasslands) tile.classList.add('grasslands');
        else if (height <= terrainBoundaries.forests) tile.classList.add('forests');
        else tile.classList.add('rocks');
    }

    // Update all tiles' appearance based on new terrain boundaries
    function updateAllTiles() {
        for (const row of grid) {
            for (const tile of row) {
                updateTileAppearance(tile);
            }
        }
    }

    // Select a tile for editing
    function selectTile(tile) {
        if (tile.classList.contains('disabled')) return; // Skip disabled tiles
        selectedTiles.push(tile);
        tile.classList.add('selected');
    }

    // Apply height to selected tiles
    applyTileHeightButton.addEventListener('click', () => {
        const height = parseFloat(tileHeightInput.value);
        selectedTiles.forEach(tile => {
            tile.dataset.height = height;
            updateTileAppearance(tile);
        });
        selectedTiles = [];
    });

    // Update terrain ranges and re-render the grid
    updateTerrainRangesButton.addEventListener('click', () => {
        updateAllTiles();
    });

    // Generate the arena grid (only if shape or size changes)
    generateArenaButton.addEventListener('click', () => {
        let newSize = parseInt(arenaSizeInput.value);

        // Ensure the size is within the allowed range
        if (newSize < 20) newSize = 20;
        if (newSize > 250) newSize = 250;
        arenaSizeInput.value = newSize; // Update the input field with the clamped value

        const newShape = arenaShapeInput.value;

        if (newSize !== currentSize || newShape !== currentShape) {
            currentSize = newSize;
            currentShape = newShape;
            generateGrid(currentSize, currentShape);
        }
    });

    // Save the arena as an object and navigate to the next screen
saveArenaButton.addEventListener('click', () => {
    const arenaObject = saveArena();
    console.log('Arena Data Saved:', arenaObject); // Debugging
    // Store the arena data in localStorage
    localStorage.setItem('arenaData', JSON.stringify(arenaObject));
    // Navigate to the next screen
    window.location.href = 'player_setup.html';
});

    // Function to save the arena as an object
    function saveArena() {
        const arenaObject = {
            size: currentSize,
            shape: currentShape,
            tiles: []
        };

        for (let y = 0; y < grid.length; y++) {
            const row = [];
            for (let x = 0; x < grid[y].length; x++) {
                const tile = grid[y][x];
                if (tile.classList.contains('disabled')) {
                    row.push(null); // Representing disabled tiles as null
                } else {
                    const height = parseFloat(tile.dataset.height);
                    let type;
                    if (height <= terrainBoundaries.water) type = 'water';
                    else if (height <= terrainBoundaries.sand) type = 'sand';
                    else if (height <= terrainBoundaries.grasslands) type = 'grasslands';
                    else if (height <= terrainBoundaries.forests) type = 'forests';
                    else type = 'rocks';
                    row.push({ height: height, type: type });
                }
            }
            arenaObject.tiles.push(row);
        }

        return arenaObject;
    }

    // Initial grid generation
    generateGrid(currentSize, currentShape);
});