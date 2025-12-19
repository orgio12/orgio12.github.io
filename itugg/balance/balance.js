const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ===== BALL =====
let ball = {
    x: 300,
    y: 80,
    r: 12,
    vx: 0,
    vy: 0
};

// ===== PHYSICS =====
let gravity = 0.5;
const bounce = -1; // энерги алдахгүй
let speedMultiplier = 1;

// ===== PLATFORM =====
let platform = {
    x: 240,
    y: 330,
    w: 120,
    h: 12,
    speed: 8,
    vx: 0
};

let gameOver = false;
let frame = 0;

// ===== INPUT =====
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") {
        platform.vx = -platform.speed;
    }
    if (e.key === "ArrowRight") {
        platform.vx = platform.speed;
    }
});

document.addEventListener("keyup", () => {
    platform.vx = 0;
});

// ===== DRAW =====
function drawBall() {
    ctx.beginPath();
    ctx.fillStyle = "#ff66ff";
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlatform() {
    ctx.fillStyle = "#7f00ff";
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
}

// ===== GAME LOOP =====
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        frame++;

        // --- difficulty increase ---
        if (frame % 600 === 0) {
            speedMultiplier += 0.05;
            gravity += 0.02;
        }

        // --- platform move ---
        platform.x += platform.vx;

        // --- physics ---
        ball.vy += gravity * speedMultiplier;
        ball.x += ball.vx * speedMultiplier;
        ball.y += ball.vy * speedMultiplier;

        // --- platform collision ---
        if (
            ball.y + ball.r >= platform.y &&
            ball.y + ball.r <= platform.y + platform.h &&
            ball.x >= platform.x &&
            ball.x <= platform.x + platform.w
        ) {
            // vertical bounce
            ball.vy *= bounce;
            ball.y = platform.y - ball.r;

            // ===== SKILL PART =====
            const hitPoint = (ball.x - platform.x) / platform.w - 0.5;
            ball.vx = hitPoint * 10 + platform.vx * 0.5;
        }

        // --- wall collision ---
        if (ball.x - ball.r <= 0 || ball.x + ball.r >= canvas.width) {
            ball.vx *= -1;
        }

        // --- game over ---
        if (ball.y - ball.r > canvas.height) {
            gameOver = true;
        }

        drawBall();
        drawPlatform();
    } else {
        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.font = "18px Arial";
        ctx.fillText("Click to Restart", canvas.width / 2, canvas.height / 2 + 30);
    }

    requestAnimationFrame(update);
}

// ===== RESTART =====
canvas.addEventListener("click", () => {
    if (gameOver) {
        ball.x = 300;
        ball.y = 80;
        ball.vx = 0;
        ball.vy = 0;
        gravity = 0.5;
        speedMultiplier = 1;
        frame = 0;
        gameOver = false;
    }
});

update();
