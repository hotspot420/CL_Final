console.log('Loading game.js version 1');

let socket;
let gameBoard;
let players = new Map();
let tileSize;
let boardOffset;
let gameInitialized = false;
let canvas;
const MOVE_TIME_LIMIT = 20000; // 20 seconds in milliseconds
let canMove = true;
let isPageVisible = true;
let currentTurnStartTime = null;
let currentTimers = new Map(); // Track all active timers

// Add frame rate optimization
const FRAME_RATE = 30;

// Add debounced window resize handler
let resizeTimeout;
function windowResized() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const size = min(400, windowWidth * 0.8);
        resizeCanvas(size, size);
        if (gameBoard) {
            tileSize = width / 11;
            boardOffset = {
                x: (width - tileSize * 10) / 2,
                y: (height - tileSize * 10) / 2
            };
        }
    }, 250);
}

// Add performance monitoring
const performanceMetrics = {
    frameTime: [],
    updateTime: [],
    renderTime: []
};

function monitorPerformance(category, time) {
    performanceMetrics[category].push(time);
    if (performanceMetrics[category].length > 60) { // Keep last 60 samples
        performanceMetrics[category].shift();
    }
}

// Add back setup but don't initialize game yet
function setup() {
    frameRate(FRAME_RATE);
    
    // Create square canvas based on viewport size
    const size = min(400, windowWidth * 0.8);
    canvas = createCanvas(size, size);
    canvas.parent('game-section');
    canvas.style('visibility', 'hidden');
}

class GameBoard {
    constructor() {
        this.size = 10;
        this.tiles = [];
        this.initialize();
    }

    initialize() {
        for (let i = 0; i < this.size; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.tiles[i][j] = {
                    x: i,
                    y: j,
                    type: 'empty',
                    isTrigger: Math.random() < 0.3
                };
            }
        }
        console.log('Board initialized with trigger tiles:', 
            this.tiles.flat().filter(t => t.isTrigger).length);
    }

    draw() {
        push();
        translate(boardOffset.x, boardOffset.y);
        
        // Get current player for highlighting valid moves
        const currentPlayer = players.get(socket.id);
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                // Check if this tile is within movement range
                const isValidMove = currentPlayer && this.isWithinMoveRange(
                    i, j, currentPlayer.position
                );
                
                this.drawTile(i, j, isValidMove);
            }
        }
        pop();
    }

    drawTile(i, j) {
        push();
        translate(i * tileSize, j * tileSize);
        
        const currentPlayer = players.get(socket.id);
        // Only highlight tiles if it's the current player's turn
        const isValidMoveTarget = currentPlayer && 
            currentPlayer.isCurrentTurn && 
            this.isWithinMoveRange(i, j, currentPlayer.position);
        
        // Use lighter color only if it's a valid move for current player's turn
        fill(isValidMoveTarget ? 
            color(169, 99, 49, 200) : // Lighter brown for valid moves
            color(139, 69, 19, 200)   // Regular brown
        );
        
        stroke(65, 43, 21);
        strokeWeight(2);
        
        // Draw octagonal tile
        beginShape();
        const offset = tileSize * 0.2;
        vertex(offset, 0);
        vertex(tileSize - offset, 0);
        vertex(tileSize, offset);
        vertex(tileSize, tileSize - offset);
        vertex(tileSize - offset, tileSize);
        vertex(offset, tileSize);
        vertex(0, tileSize - offset);
        vertex(0, offset);
        endShape(CLOSE);
        
        pop();
    }

    isWithinMoveRange(x, y, playerPos) {
        if (!playerPos) return false;
        const dx = Math.abs(x - playerPos.x);
        const dy = Math.abs(y - playerPos.y);
        return dx + dy <= 3;
    }

    screenToBoard(x, y) {
        const boardX = Math.floor((x - boardOffset.x) / tileSize);
        const boardY = Math.floor((y - boardOffset.y) / tileSize);
        return { x: boardX, y: boardY };
    }

    checkTrigger(position) {
        const tile = this.tiles[position.x][position.y];
        if (tile && tile.isTrigger) {
            console.log(`Trigger activated at position (${position.x}, ${position.y})`);
            const promptContent = document.getElementById('prompt-content');
            if (promptContent) {
                promptContent.innerHTML = `
                    <p style="color: yellow; margin-bottom: 10px;">
                        Landed on a trigger tile!
                    </p>
                    <p style="color: #aaa; font-size: 0.9em;">
                        Position: (${position.x}, ${position.y})<br>
                        Prompts will be activated here once implemented.
                    </p>
                `;
            }
        }
    }
}

function initializeGame(playerData) {
    if (gameInitialized) return;
    
    console.log('Initializing game with player data:', playerData);
    
    // Show the canvas
    canvas.style('visibility', 'visible'); // Change from display to visibility
    
    // Calculate tile size and board offset
    tileSize = min(width, height) / 11;
    boardOffset = {
        x: (width - tileSize * 10) / 2,
        y: (height - tileSize * 10) / 2
    };

    gameBoard = new GameBoard();
    
    // Initialize socket connection
    socket = io();
    setupSocketListeners();
    
    // Send player data to server
    socket.emit('quizComplete', playerData);
    
    gameInitialized = true;
    console.log('Game initialization complete');
    setupChat();
}

function draw() {
    if (!gameInitialized || !isPageVisible) return;
    
    const startTime = performance.now();
    
    background(85, 107, 47);
    
    const updateStart = performance.now();
    gameBoard.draw();
    monitorPerformance('updateTime', performance.now() - updateStart);
    
    const renderStart = performance.now();
    drawPlayers();
    monitorPerformance('renderTime', performance.now() - renderStart);
    
    monitorPerformance('frameTime', performance.now() - startTime);
}

function drawPlayers() {
    push();
    translate(boardOffset.x, boardOffset.y);
    
    players.forEach(player => {
        fill(player.color);
        const x = player.position.x * tileSize + tileSize / 2;
        const y = player.position.y * tileSize + tileSize / 2;
        circle(x, y, tileSize * 0.4);
    });
    
    pop();
}

function mousePressed() {
    if (!gameInitialized || !gameBoard) return;
    
    const player = players.get(socket.id);
    if (!player) return;

    // Strict turn checking
    if (!player.isCurrentTurn || !canMove) {
        console.log('Not allowed to move:', {
            isCurrentTurn: player.isCurrentTurn,
            canMove: canMove
        });
        return;
    }

    const boardPos = gameBoard.screenToBoard(mouseX, mouseY);
    if (boardPos.x < 0 || boardPos.x >= 10 || boardPos.y < 0 || boardPos.y >= 10) return;

    const dx = Math.abs(boardPos.x - player.position.x);
    const dy = Math.abs(boardPos.y - player.position.y);
    if (dx + dy > 3) {
        const promptContent = document.getElementById('prompt-content');
        if (promptContent) {
            promptContent.innerHTML = '<p style="color: red;">Too far! Move up to 3 tiles at a time.</p>';
        }
        return;
    }

    socket.emit('moveRequest', boardPos);
}

function updatePlayerList() {
    const playerList = document.getElementById('player-list');
    if (!playerList) return;
    
    // Clear existing timers
    currentTimers.forEach(cleanup => cleanup());
    currentTimers.clear();
    
    playerList.innerHTML = '';
    
    // Create featured players section
    const featuredPlayers = document.createElement('div');
    featuredPlayers.className = 'featured-players';
    
    // Add current player's section
    const currentTurnPlayer = Array.from(players.entries()).find(([_, p]) => p.isCurrentTurn);
    if (currentTurnPlayer) {
        const [id, player] = currentTurnPlayer;
        const featuredTurn = document.createElement('div');
        featuredTurn.className = 'featured-player';
        
        const dot = document.createElement('div');
        dot.className = 'player-dot';
        dot.style.backgroundColor = player.color;
        
        const label = document.createElement('div');
        label.className = 'player-label';
        label.textContent = id === socket.id ? 'YOUR TURN' : `${colorNames[player.color]}'s TURN`;
        
        const timer = document.createElement('span');
        timer.className = 'turn-timer';
        timer.id = `timer-${id}`;
        
        featuredTurn.appendChild(dot);
        featuredTurn.appendChild(label);
        featuredTurn.appendChild(timer);
        featuredPlayers.appendChild(featuredTurn);
        
        const cleanup = startTurnTimer(timer);
        if (cleanup) {
            currentTimers.set(id, cleanup);
        }
    }
    
    // Add "You" section if not current turn
    const yourPlayer = players.get(socket.id);
    if (yourPlayer && !yourPlayer.isCurrentTurn) {
        const featuredYou = document.createElement('div');
        featuredYou.className = 'featured-player';
        
        const dot = document.createElement('div');
        dot.className = 'player-dot current-player';
        dot.style.backgroundColor = yourPlayer.color;
        
        const label = document.createElement('div');
        label.className = 'player-label';
        label.textContent = 'YOU';
        
        featuredYou.appendChild(dot);
        featuredYou.appendChild(label);
        featuredPlayers.appendChild(featuredYou);
    }
    
    playerList.appendChild(featuredPlayers);
    
    // Add other players
    players.forEach((player, id) => {
        // Skip featured players
        if (player.isCurrentTurn || id === socket.id) return;
        
        const container = document.createElement('div');
        container.className = 'player-container';
        
        const dot = document.createElement('div');
        dot.className = 'player-dot';
        dot.style.backgroundColor = player.color;
        
        const label = document.createElement('div');
        label.className = 'player-label';
        label.textContent = colorNames[player.color];
        
        container.appendChild(dot);
        container.appendChild(label);
        playerList.appendChild(container);
    });
}

function startTurnTimer(timerElement) {
    // Don't start timer if we're in single player mode
    if (players.size <= 1) {
        timerElement.textContent = '';
        return null;
    }

    if (!currentTurnStartTime) {
        console.log('No turn start time available');
        return null;
    }

    let timerId = null;

    function updateTimer() {
        const now = Date.now();
        const elapsed = now - currentTurnStartTime;
        const remaining = Math.max(0, MOVE_TIME_LIMIT - elapsed);
        
        if (remaining > 0) {
            timerElement.textContent = `(${Math.ceil(remaining/1000)}s)`;
            timerId = setTimeout(updateTimer, 100);
        } else {
            timerElement.textContent = '(0s)';
            if (timerId) {
                clearTimeout(timerId);
                timerId = null;
            }
        }
    }

    updateTimer();

    return function cleanup() {
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
    };
}

// Add periodic turn state check
setInterval(() => {
    if (players.size > 1) {
        const currentPlayer = Array.from(players.values()).find(p => p.isCurrentTurn);
        if (currentPlayer) {
            const turnDuration = Date.now() - currentTurnStartTime;
            if (turnDuration > MOVE_TIME_LIMIT + 1000) { // Add 1s buffer
                console.log('Turn duration exceeded, requesting sync');
                socket.emit('requestSync');
            }
        }
    }
}, 5000); // Check every 5 seconds

function setupSocketListeners() {
    socket.on('existingPlayers', (existingPlayers) => {
        console.log('Received existing players:', existingPlayers);
        existingPlayers.forEach(player => {
            players.set(player.id, {
                position: player.position,
                color: player.color,
                isCurrentTurn: player.isCurrentTurn
            });
        });
        updatePlayerList();
    });

    socket.on('playerJoined', (data) => {
        console.log('Player joined:', data);
        players.set(data.id, {
            position: data.position,
            color: data.color,
            isCurrentTurn: data.isCurrentTurn
        });
        
        if (data.turnStartTime) {
            currentTurnStartTime = data.turnStartTime;
        }
        
        updatePlayerList();
    });

    socket.on('playerMoved', (data) => {
        const player = players.get(data.id);
        if (player) {
            player.position = data.position;
            
            // Use server-provided trigger status
            const message = data.isTrigger ? 'Landed on a trigger tile' : 'Landed on a non-trigger tile';
            const promptContent = document.getElementById('prompt-content');
            if (promptContent) {
                // First clear any existing content
                promptContent.innerHTML = '';
                
                // Create elements directly
                const messageDiv = document.createElement('div');
                messageDiv.className = 'prompt-message';
                
                const messageP = document.createElement('p');
                messageP.textContent = message;
                messageDiv.appendChild(messageP);

                // Only add continue button for the moving player
                if (data.id === socket.id) {
                    canMove = false;
                    
                    const continueBtn = document.createElement('button');
                    continueBtn.id = 'continue-btn';
                    continueBtn.className = 'styled-button';
                    continueBtn.textContent = 'Continue';
                    
                    continueBtn.onclick = () => {
                        canMove = true;
                        promptContent.innerHTML = '';
                        if (players.size > 1) {
                            socket.emit('endTurn');
                        }
                    };
                    
                    messageDiv.appendChild(continueBtn);
                }
                
                promptContent.appendChild(messageDiv);
            }
        }
    });

    socket.on('turnChanged', (data) => {
        console.log('Turn changed:', data);
        currentTurnStartTime = data.turnStartTime;
        
        // Clear all existing timers
        currentTimers.forEach(cleanup => cleanup());
        currentTimers.clear();
        
        players.forEach((player, id) => {
            player.isCurrentTurn = (id === data.nextPlayer);
        });

        if (data.nextPlayer === socket.id) {
            canMove = true;
        } else {
            canMove = false;
        }
        
        updatePlayerList();
        updatePromptForTurnChange(data);
    });

    socket.on('playerLeft', (playerId) => {
        players.delete(playerId);
        updatePlayerList();
    });

    socket.on('checkTrigger', (position) => {
        if (gameBoard) {
            gameBoard.checkTrigger(position);
        }
    });

    socket.on('invalidMove', (message) => {
        const promptContent = document.getElementById('prompt-content');
        if (promptContent) {
            promptContent.innerHTML = `<p style="color: red;">${message}</p>`;
        }
    });

    socket.on('chat', (data) => {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        const colorName = colorNames[data.color] || data.color;
        messageDiv.innerHTML = `
            <span style="color: ${data.color}">
                ${data.id === socket.id ? 'You' : colorName}:
            </span> 
            ${data.message}
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Handle page visibility
    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        if (isPageVisible) {
            // Force update when page becomes visible
            const player = players.get(socket.id);
            if (player && player.isCurrentTurn) {
                updatePlayerList();
                draw(); // Redraw board to show highlighted tiles
            }
        }
    });

    // Add to setupSocketListeners
    socket.on('syncState', (data) => {
        console.log('Received sync state:', data);
        
        // Update all player states
        players.forEach((player, id) => {
            if (data.players[id]) {
                player.isCurrentTurn = data.players[id].isCurrentTurn;
                player.position = data.players[id].position;
            }
        });
        
        // Update turn timer
        currentTurnStartTime = data.turnStartTime;
        
        // Update UI
        updatePlayerList();
    });

    socket.on('turnTimedOut', (data) => {
        console.log('Turn timed out:', data);
        
        // Clear any existing timers
        currentTimers.forEach(cleanup => cleanup());
        currentTimers.clear();
        
        // Update turn start time
        currentTurnStartTime = data.nextTurnStartTime;
        
        const promptContent = document.getElementById('prompt-content');
        if (promptContent) {
            promptContent.innerHTML = '<p>Time\'s up - turn ended</p>';
            setTimeout(() => {
                if (promptContent.innerHTML.includes('Time\'s up')) {
                    promptContent.innerHTML = '';
                }
            }, 2000);
        }
    });

    socket.on('connect', () => {
        console.log('Connected to server');
        if (gameInitialized) {
            socket.emit('requestSync');
        }
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        currentTimers.forEach(cleanup => cleanup());
        currentTimers.clear();
    });

    // Add periodic state check
    setInterval(() => {
        if (gameInitialized && players.size > 1) {
            const now = Date.now();
            const elapsed = now - currentTurnStartTime;
            
            // Request sync if time is off by more than 2 seconds
            if (Math.abs(elapsed - MOVE_TIME_LIMIT) > 2000) {
                console.log('Time sync check failed, requesting sync');
                socket.emit('requestSync');
            }
        }
    }, 2000);

    // Add new event listener for game start
    socket.on('gameStart', (data) => {
        console.log('Game started with multiple players');
        currentTurnStartTime = data.turnStartTime;
        updatePlayerList(); // This will start the timer
    });
}

function setupChat() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatInput || !chatMessages) {
        console.error('Chat elements not found');
        return;
    }
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && chatInput.value.trim()) {
            const message = chatInput.value.trim();
            const player = players.get(socket.id);
            if (player) {
                socket.emit('chat', {
                    message: message,
                    color: player.color
                });
                chatInput.value = '';
            }
        }
    });
}

function updatePromptForTurnChange(turnData) {
    const promptContent = document.getElementById('prompt-content');
    if (!promptContent) return;

    const nextPlayer = players.get(turnData.nextPlayer);
    if (!nextPlayer) return;

    const colorName = colorNames[nextPlayer.color] || nextPlayer.color;
    const isMyTurn = turnData.nextPlayer === socket.id;
    
    promptContent.innerHTML = `
        <div class="prompt-message">
            <p>${isMyTurn ? 'Your' : colorName + "'s"} turn!</p>
        </div>
    `;
}

const colorNames = {
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FF00FF': 'Purple',
    '#00FFFF': 'Cyan',
    '#FFA500': 'Orange',
    '#800080': 'Violet'
};

// Add error recovery
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ', msg, url, lineNo, columnNo, error);
    
    // Try to recover game state
    if (socket && gameInitialized) {
        socket.emit('requestSync');
    }
    
    return false;
};

// Add connection state management
let connectionState = {
    connected: false,
    reconnecting: false,
    lastSync: null
};

socket.on('connect', () => {
    connectionState.connected = true;
    connectionState.reconnecting = false;
    
    if (gameInitialized) {
        socket.emit('requestSync');
    }
});

socket.on('disconnect', () => {
    connectionState.connected = false;
    connectionState.reconnecting = true;
    
    // Show reconnection message
    const promptContent = document.getElementById('prompt-content');
    if (promptContent) {
        promptContent.innerHTML = '<p>Connection lost. Attempting to reconnect...</p>';
    }
});

// Add state validation
function validateGameState() {
    // Check for valid player positions
    players.forEach((player, id) => {
        if (!isValidPosition(player.position)) {
            console.error(`Invalid position for player ${id}`, player.position);
            socket.emit('requestSync');
            return false;
        }
    });

    // Check for valid turn state
    const currentTurnPlayers = Array.from(players.values()).filter(p => p.isCurrentTurn);
    if (players.size > 1 && currentTurnPlayers.length !== 1) {
        console.error('Invalid turn state', currentTurnPlayers);
        socket.emit('requestSync');
        return false;
    }

    return true;
}

function isValidPosition(pos) {
    return pos && 
           typeof pos.x === 'number' && 
           typeof pos.y === 'number' &&
           pos.x >= 0 && pos.x < 10 &&
           pos.y >= 0 && pos.y < 10;
}

// Add periodic state validation
setInterval(() => {
    if (gameInitialized) {
        validateGameState();
    }
}, 5000);

// Add loading states and feedback
function showLoadingState(message) {
    const promptContent = document.getElementById('prompt-content');
    if (promptContent) {
        promptContent.innerHTML = `
            <div class="loading-message">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }
}

// Add user feedback for actions
function showFeedback(message, type = 'info') {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `feedback ${type}`;
    feedbackDiv.textContent = message;
    document.body.appendChild(feedbackDiv);
    
    setTimeout(() => {
        feedbackDiv.classList.add('fade-out');
        setTimeout(() => feedbackDiv.remove(), 500);
    }, 2000);
}

// Add cleanup function
function cleanup() {
    // Clear all timers
    currentTimers.forEach(cleanup => cleanup());
    currentTimers.clear();
    
    // Clear all event listeners
    if (socket) {
        socket.removeAllListeners();
    }
    
    // Clear game state
    players.clear();
    gameBoard = null;
    gameInitialized = false;
    
    // Clear UI
    const promptContent = document.getElementById('prompt-content');
    if (promptContent) {
        promptContent.innerHTML = '';
    }
    
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
    }
}

// Call cleanup when needed
window.addEventListener('beforeunload', cleanup);

// Add network state tracking
const networkState = {
    lastPing: Date.now(),
    latency: 0,
    connectionQuality: 'good'
};

// Add ping monitoring
function startPingMonitoring() {
    setInterval(() => {
        if (socket && socket.connected) {
            const start = Date.now();
            socket.emit('ping');
            socket.once('pong', () => {
                networkState.latency = Date.now() - start;
                networkState.lastPing = Date.now();
                networkState.connectionQuality = networkState.latency < 100 ? 'good' : 
                                               networkState.latency < 300 ? 'fair' : 'poor';
                
                if (networkState.connectionQuality === 'poor') {
                    showFeedback('Poor connection detected', 'warning');
                }
            });
        }
    }, 5000);
}
 