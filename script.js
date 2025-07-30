const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// Game objects and constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const PLAYER_X = 20;
const AI_X = canvas.width - PADDLE_WIDTH - 20;
const PADDLE_SPEED = 6;
const BALL_SPEED = 5;

// Player paddle
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;

// AI paddle
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;

// Ball
let ball = {
    x: canvas.width/2 - BALL_SIZE/2,
    y: canvas.height/2 - BALL_SIZE/2,
    vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    vy: BALL_SPEED * (Math.random() * 2 - 1)
};

// Scores
let playerScore = 0;
let aiScore = 0;

// Mouse movement for player paddle
canvas.addEventListener("mousemove", function(e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT/2;
    // Clamp paddle within canvas
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Reset ball after scoring
function resetBall(direction) {
    ball.x = canvas.width/2 - BALL_SIZE/2;
    ball.y = canvas.height/2 - BALL_SIZE/2;
    ball.vx = BALL_SPEED * direction;
    ball.vy = BALL_SPEED * (Math.random() * 2 - 1);
}

// AI paddle movement: follows the ball with smoothing
function moveAIPaddle() {
    let center = aiY + PADDLE_HEIGHT/2;
    if (center < ball.y) {
        aiY += PADDLE_SPEED * 0.6;
    } else if (center > ball.y) {
        aiY -= PADDLE_SPEED * 0.6;
    }
    // Clamp paddle within canvas
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

// Ball and paddle collision detection
function checkCollisions() {
    // Top/bottom wall
    if (ball.y <= 0 || ball.y + BALL_SIZE >= canvas.height) {
        ball.vy *= -1;
        ball.y = Math.max(0, Math.min(canvas.height - BALL_SIZE, ball.y));
    }

    // Left paddle (player)
    if (
        ball.x <= PLAYER_X + PADDLE_WIDTH &&
        ball.x >= PLAYER_X &&
        ball.y + BALL_SIZE > playerY &&
        ball.y < playerY + PADDLE_HEIGHT
    ) {
        ball.vx *= -1;
        // Add some "spin" based on hit position
        let impact = (ball.y + BALL_SIZE/2) - (playerY + PADDLE_HEIGHT/2);
        ball.vy += impact * 0.15;
        ball.x = PLAYER_X + PADDLE_WIDTH; // prevent sticking
    }

    // Right paddle (AI)
    if (
        ball.x + BALL_SIZE >= AI_X &&
        ball.x + BALL_SIZE <= AI_X + PADDLE_WIDTH &&
        ball.y + BALL_SIZE > aiY &&
        ball.y < aiY + PADDLE_HEIGHT
    ) {
        ball.vx *= -1;
        // Add some "spin" based on hit position
        let impact = (ball.y + BALL_SIZE/2) - (aiY + PADDLE_HEIGHT/2);
        ball.vy += impact * 0.15;
        ball.x = AI_X - BALL_SIZE; // prevent sticking
    }

    // Score left or right
    if (ball.x < 0) {
        aiScore++;
        resetBall(1);
    } else if (ball.x + BALL_SIZE > canvas.width) {
        playerScore++;
        resetBall(-1);
    }
}

// Draw everything
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Net
    ctx.strokeStyle = "#444";
    ctx.setLineDash([8, 16]);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.fillStyle = "#ffc600";
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

    // Scores
    ctx.font = "48px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(playerScore, canvas.width/2 - 60, 60);
    ctx.fillText(aiScore, canvas.width/2 + 60, 60);
}

// Main loop
function update() {
    // Ball movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    moveAIPaddle();
    checkCollisions();
    draw();

    requestAnimationFrame(update);
}

// Start
update();