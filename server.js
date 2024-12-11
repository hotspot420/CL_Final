const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs');

// Add logging middleware
app.use((req, res, next) => {
    console.log('Request for:', req.path);
    res.setHeader('Cache-Control', 'no-store');
    next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Add a specific route for list.json files
app.get('/Vantiro-:num/list.json', (req, res) => {
    const vantiroNum = req.params.num;
    const dirPath = path.join(__dirname, 'public', 'images', `Vantiro-${vantiroNum}`);
    
    console.log('Checking directory:', dirPath);
    
    // Check if directory exists
    if (!fs.existsSync(dirPath)) {
        console.error('Directory not found:', dirPath);
        return res.status(404).send('Directory not found');
    }
    
    // Read directory and filter for image files
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).send('Error reading directory');
        }
        
        // Filter for image files
        const imageFiles = files.filter(file => 
            file.match(/\.(png|jpg|jpeg)$/i)
        ).sort();
        
        console.log('Found images:', imageFiles);
        res.json(imageFiles);
    });
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const players = new Map(); // Store active players
const BOARD_SIZE = 10;
const MAX_MOVES = 4;
const MOVE_TIME_LIMIT = 20000; // 20 seconds in milliseconds
let currentTurnStartTime = null; // Initialize as null
let turnTimeouts = new Map();

// Add error handling and logging
const DEBUG = process.env.NODE_ENV !== 'production';

function log(...args) {
    if (DEBUG) console.log(...args);
}

function handleError(error, socket = null) {
    console.error('Error:', error);
    if (socket) {
        socket.emit('error', { message: 'An error occurred' });
    }
}

// Add game state validation
function validateGameState() {
    // Ensure only one player has isCurrentTurn = true
    const currentTurnPlayers = Array.from(players.values()).filter(p => p.isCurrentTurn);
    if (currentTurnPlayers.length > 1) {
        log('Multiple players with current turn, fixing...');
        const keepTurn = currentTurnPlayers[0];
        currentTurnPlayers.slice(1).forEach(p => p.isCurrentTurn = false);
    }
    
    // Ensure all players have valid positions
    players.forEach((player, id) => {
        if (!isValidPosition(player.position)) {
            log(`Invalid position for player ${id}, resetting...`);
            player.position = getRandomEmptyPosition();
        }
    });
}

function isValidPosition(pos) {
    return pos && 
           typeof pos.x === 'number' && 
           typeof pos.y === 'number' &&
           pos.x >= 0 && pos.x < BOARD_SIZE &&
           pos.y >= 0 && pos.y < BOARD_SIZE;
}

// Add periodic state cleanup
setInterval(() => {
    try {
        validateGameState();
        
        // Clean up any orphaned timeouts
        turnTimeouts.forEach((timeout, playerId) => {
            if (!players.has(playerId)) {
                clearTimeout(timeout);
                turnTimeouts.delete(playerId);
            }
        });
        
        // Verify turn timing
        if (players.size > 1 && currentTurnStartTime) {
            const now = Date.now();
            const turnDuration = now - currentTurnStartTime;
            if (turnDuration > MOVE_TIME_LIMIT + 2000) { // Add 2s buffer
                console.log('Turn duration exceeded, forcing turn change');
                const currentPlayer = Array.from(players.values()).find(p => p.isCurrentTurn);
                if (currentPlayer) {
                    const currentPlayerId = Array.from(players.keys()).find(id => 
                        players.get(id) === currentPlayer
                    );
                    if (currentPlayerId) {
                        handleTurnChange(currentPlayerId);
                    }
                }
            }
        }
    } catch (error) {
        handleError(error);
    }
}, 5000);

// Add new function for game initialization
function initializeGameState() {
    currentTurnStartTime = Date.now();
}

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send ALL existing players to new player
    const existingPlayers = Array.from(players.entries()).map(([id, player]) => ({
        id,
        position: player.position,
        color: player.color,
        isCurrentTurn: player.isCurrentTurn
    }));
    socket.emit('existingPlayers', existingPlayers);

    socket.on('quizComplete', (playerData) => {
        const position = getRandomEmptyPosition();
        const color = generateUniqueColor();
        const isFirstPlayer = players.size === 0;
        const now = Date.now();
        
        const player = {
            position,
            color,
            ...playerData,
            isCurrentTurn: isFirstPlayer
        };
        
        players.set(socket.id, player);

        // Initialize game state and turn timer when second player joins
        if (players.size === 2) {
            // Ensure first player gets first turn
            const [firstPlayerId] = players.keys();
            players.forEach((p, id) => {
                p.isCurrentTurn = (id === firstPlayerId);
            });
            
            currentTurnStartTime = now;
            
            // Set timeout for first turn
            const timeout = setTimeout(() => {
                handleTurnChange(firstPlayerId);
            }, MOVE_TIME_LIMIT);
            
            turnTimeouts.set(firstPlayerId, timeout);
            
            // Broadcast game start to all players
            io.emit('gameStart', {
                turnStartTime: now,
                currentPlayer: firstPlayerId
            });
        } else if (players.size === 1) {
            currentTurnStartTime = null; // Reset timer for single player
        }

        // Broadcast new player with full state
        io.emit('playerJoined', {
            id: socket.id,
            position,
            color,
            isCurrentTurn: player.isCurrentTurn,
            turnStartTime: currentTurnStartTime
        });
        
        // Send existing state to new player
        socket.emit('syncState', {
            players: Object.fromEntries(Array.from(players.entries()).map(([id, p]) => [
                id,
                {
                    isCurrentTurn: p.isCurrentTurn,
                    position: p.position,
                    color: p.color
                }
            ])),
            turnStartTime: currentTurnStartTime
        });
    });

    socket.on('moveRequest', (newPosition) => {
        const player = players.get(socket.id);
        if (!player) return;
        
        // Allow moves anytime in single player, but enforce turns in multiplayer
        if (players.size > 1 && !player.isCurrentTurn) {
            socket.emit('invalidMove', 'Not your turn!');
            return;
        }

        // Calculate distance from current position
        const dx = Math.abs(newPosition.x - player.position.x);
        const dy = Math.abs(newPosition.y - player.position.y);
        const distance = dx + dy;

        // Validate move distance
        if (distance > 3) {
            socket.emit('invalidMove', 'Too far! Move up to 3 tiles at a time.');
            return;
        }

        // Check if tile is occupied
        if (isOccupied(newPosition)) {
            socket.emit('invalidMove', 'Tile is occupied!');
            return;
        }

        // Update player position
        player.position = newPosition;
        
        // Broadcast move with tile trigger status
        io.emit('playerMoved', {
            id: socket.id,
            position: newPosition,
            isTrigger: Math.random() < 0.3  // Use same trigger probability as client
        });
    });

    socket.on('endTurn', () => {
        if (players.size <= 1) return;

        const currentPlayer = players.get(socket.id);
        if (!currentPlayer || !currentPlayer.isCurrentTurn) {
            console.log('Invalid turn end request');
            return;
        }

        handleTurnChange(socket.id);
    });

    socket.on('chat', (data) => {
        io.emit('chat', {
            id: socket.id,
            message: data.message,
            color: data.color
        });
    });

    socket.on('disconnect', () => {
        const disconnectedPlayer = players.get(socket.id);
        if (disconnectedPlayer) {
            // Clear timeout for disconnected player
            if (turnTimeouts.has(socket.id)) {
                clearTimeout(turnTimeouts.get(socket.id));
                turnTimeouts.delete(socket.id);
            }

            if (disconnectedPlayer.isCurrentTurn) {
                handleTurnChange(socket.id);
            }
        }
        players.delete(socket.id);
        io.emit('playerLeft', socket.id);
    });

    socket.on('requestSync', () => {
        const now = Date.now();
        // Send current game state to requesting client
        const gameState = {
            players: Object.fromEntries(Array.from(players.entries()).map(([id, player]) => [
                id,
                {
                    isCurrentTurn: player.isCurrentTurn,
                    position: player.position,
                    color: player.color
                }
            ])),
            turnStartTime: currentTurnStartTime || now
        };
        socket.emit('syncState', gameState);
    });
});

function getRandomEmptyPosition() {
    // Implementation to find random empty position
    let position;
    do {
        position = {
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE)
        };
    } while (isOccupied(position));
    return position;
}

function isOccupied(position) {
    for (const player of players.values()) {
        if (player.position.x === position.x && 
            player.position.y === position.y) {
            return true;
        }
    }
    return false;
}

function isValidMove(position) {
    return position.x >= 0 && position.x < BOARD_SIZE &&
           position.y >= 0 && position.y < BOARD_SIZE;
}

function generateUniqueColor() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
                   '#FF00FF', '#00FFFF', '#FFA500', '#800080'];
    const usedColors = new Set([...players.values()].map(p => p.color));
    return colors.find(c => !usedColors.has(c)) || '#000000';
}

function handleTurnChange(currentPlayerId) {
    // Don't change turns in single player mode
    if (players.size <= 1) return;
    
    // Clear any existing timeouts
    turnTimeouts.forEach((timeout) => clearTimeout(timeout));
    turnTimeouts.clear();

    const playerIds = Array.from(players.keys());
    const currentIndex = playerIds.indexOf(currentPlayerId);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    const nextPlayerId = playerIds[nextIndex];

    // Update turn status
    players.forEach((player, id) => {
        player.isCurrentTurn = (id === nextPlayerId);
    });

    // Set new turn start time
    const now = Date.now();
    currentTurnStartTime = now;

    // Set timeout for next turn
    const timeout = setTimeout(() => {
        console.log('Turn timeout triggered for player:', nextPlayerId);
        io.emit('turnTimedOut', { 
            playerId: nextPlayerId,
            nextTurnStartTime: now
        });
        handleTurnChange(nextPlayerId);
    }, MOVE_TIME_LIMIT);

    turnTimeouts.set(nextPlayerId, timeout);

    // Broadcast turn change
    io.emit('turnChanged', {
        previousPlayer: currentPlayerId,
        nextPlayer: nextPlayerId,
        turnStartTime: now
    });
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});