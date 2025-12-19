// ===== Canvas =====
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// ===== UI =====
const scoreBoard = document.getElementById("scoreBoard");

// ===== Game state =====
let bubbles = [];
let popEffects = [];

let stage = 1;
let count = 4;
let timeLeft = 600;
let gameOver = false;

let mouseX = null;
let mouseY = null;

// ===== Sound =====
const popSound = new Audio("pop.mp3");

// ===== Create bubbles =====
function createBubbles() {
    bubbles = [];
    for (let i = 0; i < count; i++) {
        const size = Math.floor(Math.random() * 20) + 15;
        let speedX = Math.random() * 4 - 2;
        let speedY = Math.random() * 4 - 2;

        if (speedX === 0) speedX = 1;
        if (speedY === 0) speedY = 1;

        bubbles.push({
            x: Math.random() * (canvas.width - size * 2) + size,
            y: Math.random() * (canvas.height - size * 2) + size,
            r: size,
            dx: speedX,
            dy: speedY,
            color: `rgb(${rand()},${rand()},${rand()})`,
            dead: false
        });
    }
}

// ===== Random color helper =====
function rand() {
    return Math.floor(Math.random() * 256);
}

// ===== Pop effect =====
function createPop(x, y, color) {
    popEffects.push({
        x,
        y,
        r: 0,
        alpha: 1,
        color
    });
}

// ===== Update & draw =====
function update() {
    ctx.fillStyle = "#000022";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        timeLeft--;

        bubbles.forEach(b => {
            // draw bubble
            ctx.beginPath();
            ctx.fillStyle = b.color;
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();

            // shine
            ctx.beginPath();
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.arc(b.x - b.r / 3, b.y - b.r / 3, b.r / 4, 0, Math.PI * 2);
            ctx.fill();

            // click detection
            if (
                mouseX !== null &&
                Math.hypot(mouseX - b.x, mouseY - b.y) < b.r
            ) {
                b.dead = true;
                popSound.currentTime = 0;
                popSound.play();
                createPop(b.x, b.y, b.color);
                mouseX = mouseY = null;
            }

            // move
            b.x += b.dx;
            b.y += b.dy;

            if (b.x < b.r || b.x > canvas.width - b.r) b.dx *= -1;
            if (b.y < b.r || b.y > canvas.height - b.r) b.dy *= -1;
        });

        // remove popped
        bubbles = bubbles.filter(b => !b.dead);

        // next stage
        if (bubbles.length === 0) {
            stage++;
            count += 2;
            timeLeft = 600;
            createBubbles();
        }

        // pop animation
        popEffects.forEach(p => {
            ctx.strokeStyle = `rgba(${p.color.match(/\d+/g).join(",")},${p.alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.stroke();
            p.r += 4;
            p.alpha -= 0.03;
        });

        popEffects = popEffects.filter(p => p.alpha > 0);

        // scoreboard
        scoreBoard.innerText =
            `Үе: ${stage} | Бөмбөг: ${bubbles.length} | Цаг: ${Math.floor(timeLeft / 60)}`;

        if (timeLeft <= 0) gameOver = true;
    } else {
        // Game over screen
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);

        ctx.font = "22px Arial";
        ctx.fillText("Click to Replay", canvas.width / 2, canvas.height / 2 + 20);
    }

    requestAnimationFrame(update);
}

// ===== Mouse click =====
canvas.addEventListener("mousedown", e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (gameOver) {
        stage = 1;
        count = 4;
        timeLeft = 600;
        gameOver = false;
        popEffects = [];
        createBubbles();
    }
});

// ===== Start game =====
createBubbles();
update();
