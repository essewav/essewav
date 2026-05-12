// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddle = {
    x: 10,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    dy: 0,
    speed: 6
};

const computer = {
    x: canvas.width - 20,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    dy: 0,
    speed: 5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5
};

const net = {
    x: canvas.width / 2 - 1,
    y: 0,
    width: 2,
    height: 10
};

// Game state
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;
let keyStates = {};

// Mouse position
let mouseY = canvas.height / 2;

// Event listeners
document.addEventListener('keydown', (e) => {
    keyStates[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keyStates[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

document.getElementById('startBtn').addEventListener('click', () => {
    gameRunning = !gameRunning;
    document.getElementById('startBtn').textContent = gameRunning ? 'Pause Game' : 'Resume Game';
});

document.getElementById('resetBtn').addEventListener('click', () => {
    playerScore = 0;
    computerScore = 0;
    updateScore();
    resetBall();
});

// Draw functions
function drawRect(x, y, width, height, color = '#fff') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color = '#fff') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawNet() {
    for (let y = 0; y < canvas.height; y += 15) {
        drawRect(net.x, y, net.width, net.height, 'rgba(255, 255, 255, 0.5)');
    }
}

function drawPaddles() {
    drawRect(paddle.x, paddle.y, paddle.width, paddle.height, '#667eea');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#764ba2');
}

function drawBall() {
    drawCircle(ball.x, ball.y, ball.radius, '#f5576c');
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Movement functions
function movePlayerPaddle() {
    // Mouse control
    if (mouseY - paddle.height / 2 < canvas.height - paddle.height && 
        mouseY - paddle.height / 2 > 0) {
        paddle.y = mouseY - paddle.height / 2;
    }

    // Arrow keys control
    if (keyStates['ArrowUp'] && paddle.y > 0) {
        paddle.y -= paddle.speed;
    }
    if (keyStates['ArrowDown'] && paddle.y < canvas.height - paddle.height) {
        paddle.y += paddle.speed;
    }

    // Constrain paddle to canvas
    if (paddle.y < 0) paddle.y = 0;
    if (paddle.y > canvas.height - paddle.height) paddle.y = canvas.height - paddle.height;
}

function moveComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;

    // Simple AI: follow the ball
    if (computerCenter < ball.y - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ball.y + 35) {
        computer.y -= computer.speed;
    }

    // Constrain paddle to canvas
    if (computer.y < 0) computer.y = 0;
    if (computer.y > canvas.height - computer.height) {
        computer.y = canvas.height - computer.height;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }

    // Ball collision with paddles
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = paddle.x + paddle.width + ball.radius;
        // Add spin based on where ball hits paddle
        const deltaY = ball.y - (paddle.y + paddle.height / 2);
        ball.dy = deltaY * 0.1;
    }

    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        // Add spin based on where ball hits paddle
        const deltaY = ball.y - (computer.y + computer.height / 2);
        ball.dy = deltaY * 0.1;
    }

    // Ball out of bounds - scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScore();
        resetBall();
    }

    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawNet();
    drawPaddles();
    drawBall();

    if (gameRunning) {
        // Update game state
        movePlayerPaddle();
        moveComputerPaddle();
        moveBall();
    }

    requestAnimationFrame(gameLoop);
}

// Initialize
updateScore();
gameLoop();
