"use strict";

// 01. INITIALIZE AND RECOVER LOCAL PROGRESS ----------------------------------
const $ = (id) => document.getElementById(id);
const engine = new NomiaAdventure(window.NOMIA_LEVELS);
const renderer = new NomiaRenderer($("world"));
const sound = window.NomiaSound;
const SAVE_KEY = "nomia-adventure-v2";
let input = {};
let lastTime = 0;
let modalAction;
let toastUntil = 0;
let pauseReason = "";
sound.bind($("sound-toggle"));

function readProgress() {
	try {
		const data = JSON.parse(localStorage.getItem(SAVE_KEY));
		if (
			data?.version !== 2 ||
			!Number.isInteger(data.level) ||
			data.level < 0 ||
			data.level > 2
		)
			return null;
		if (!Array.isArray(data.stars) || data.stars.length !== 19) return null;
		if (
			!Array.isArray(data.enemies) ||
			data.enemies.length !== NOMIA_LEVELS[data.level].enemyCount
		)
			return null;
		if (
			!Number.isFinite(data.checkpoint) ||
			data.checkpoint < 0 ||
			data.checkpoint > 3300
		)
			return null;
		if (
			!data.enemies.every(
				(hp) =>
					Number.isInteger(hp) && hp >= 0 && hp <= NOMIA_LEVELS[data.level].enemyHealth,
			)
		)
			return null;
		return data;
	} catch (_) {
		return null;
	}
}

function saveProgress() {
	try {
		localStorage.setItem(SAVE_KEY, JSON.stringify(engine.snapshot()));
	} catch (_) {}
}

function clearInput() {
	input = {};
	document
		.querySelectorAll(".pressed")
		.forEach((button) => button.classList.remove("pressed"));
}

function enterPlay() {
	clearInput();
	engine.mode = "playing";
	$("overlay").hidden = true;
	$("secret-room").hidden = true;
	lastTime = performance.now();
}

const saved = readProgress();
engine.mode = "intro";
if (saved) {
	$("modal-action").textContent = "Аяллаа үргэлжлүүлэх →";
	$("restart").hidden = false;
	modalAction = () => {
		engine.loadLevel(saved.level, saved);
		enterPlay();
	};
} else {
	modalAction = () => {
		engine.loadLevel(0);
		enterPlay();
	};
}
$("modal-action").onclick = () => modalAction();
$("restart").onclick = () => {
	engine.loadLevel(0);
	saveProgress();
	enterPlay();
};

// 02. MODALS, PAUSE AND SECRET ROOM ------------------------------------------
function showModal(tag, title, copy, actionLabel, action) {
	clearInput();
	$("modal-tag").textContent = tag;
	$("modal-title").innerHTML = title;
	$("modal-copy").textContent = copy;
	$("instructions").hidden = true;
	$("restart").hidden = true;
	$("modal-action").textContent = actionLabel;
	$("overlay").hidden = false;
	modalAction = action;
}

function pause() {
	if (engine.mode !== "playing") return;
	engine.mode = "paused";
	pauseReason = "manual";
	saveProgress();
	showModal(
		"TAKE YOUR TIME",
		"A tiny <em>pause.</em>",
		"Однууд хүлээж байж чадна.",
		"Үргэлжлүүлэх →",
		enterPlay,
	);
}

$("pause").onclick = () => {
	if (engine.mode === "playing") pause();
	else if (engine.mode === "paused" && pauseReason === "manual") enterPlay();
};
$("fullscreen").onclick = async () => {
	try {
		if (!document.fullscreenElement) await $("game-shell").requestFullscreen();
		else await document.exitFullscreen();
	} catch (_) {
		toast("Энэ browser бүтэн дэлгэцийг дэмжихгүй байна.");
	}
};

$("secret-enter").onclick = () => {
	if (!engine.openSecret()) return;
	clearInput();
	$("secret-room").hidden = false;
	$("secret-chest").disabled = engine.secretVisited;
	$("secret-chest").textContent = engine.secretVisited ? "🍰" : "🎁";
	$("secret-message").textContent = engine.secretVisited
		? "Амттан энд байсан. Харин чи идчихсэн. ♡"
		: "Нууц өрөөнд нууц амттан байдаг гэсэн.";
};
$("secret-chest").onclick = () => {
	engine.claimSecret();
	$("secret-chest").textContent = "🍰";
	$("secret-chest").disabled = true;
	$("secret-message").textContent =
		"Бялуу оллоо! Бүх зүрх чинь дүүрлээ. Энэ тухай үүлнүүдэд битгий хэлээрэй.";
};
$("secret-return").onclick = enterPlay;

function toast(message) {
	$("game-toast").textContent = message;
	$("game-toast").hidden = false;
	toastUntil = performance.now() + 3000;
}

// 03. TWO-THUMB POINTER CONTROLS AND KEYBOARD --------------------------------
function press(action) {
	if (engine.mode !== "playing") return;
	if (action === "jump") engine.jump();
	if (action === "dash") engine.dash();
	if (action === "shoot") engine.shoot();
	input[action] = true;
}

document.querySelectorAll("[data-key]").forEach((button) => {
	button.onpointerdown = (event) => {
		event.preventDefault();
		button.setPointerCapture(event.pointerId);
		button.classList.add("pressed");
		press(button.dataset.key);
	};
	const release = () => {
		input[button.dataset.key] = false;
		button.classList.remove("pressed");
	};
	button.onpointerup = release;
	button.onpointercancel = release;
	button.onlostpointercapture = release;
});

const keyMap = {
	ArrowLeft: "left",
	a: "left",
	A: "left",
	ArrowRight: "right",
	d: "right",
	D: "right",
	ArrowUp: "jump",
	" ": "jump",
	w: "jump",
	W: "jump",
	Shift: "dash",
	x: "dash",
	X: "dash",
	z: "shoot",
	Z: "shoot",
	j: "shoot",
	J: "shoot",
};
window.addEventListener("keydown", (event) => {
	if (event.key === "Escape" || event.key === "p") {
		if (!event.repeat) $("pause").click();
		return;
	}
	if (event.key.toLowerCase() === "e" && engine.nearSecret) $("secret-enter").click();
	const action = keyMap[event.key];
	if (action) {
		event.preventDefault();
		if (!event.repeat) press(action);
	}
});
window.addEventListener("keyup", (event) => {
	const action = keyMap[event.key];
	if (action) input[action] = false;
});
window.addEventListener("blur", () => {
	clearInput();
	pause();
});
document.addEventListener("visibilitychange", () => {
	if (document.hidden) {
		clearInput();
		pause();
	}
});
window.addEventListener("resize", () => {
	clearInput();
	if (innerHeight > innerWidth && innerWidth <= 750) pause();
});

// 04. APPLY ENGINE EVENTS AND UPDATE THE HUD --------------------------------
function handleEvents() {
	for (const event of engine.events.splice(0)) {
		if (event.type === "sound") sound.play(event.value);
		if (event.type === "save") saveProgress();
		if (event.type === "toast") toast(event.value);
		if (event.type === "lost") {
			showModal(
				"A LITTLE DETOUR",
				"One more <em>try?</em>",
				"Олсон од, арилгасан үүл чинь хадгалагдсан. Checkpoint-оос үргэлжлүүлье.",
				"Дахиад оролдох →",
				() => {
					engine.retry();
					enterPlay();
				},
			);
		}
		if (event.type === "complete") {
			if (engine.level < 2) {
				showModal(
					"LEVEL " + (engine.level + 1) + " COMPLETE",
					"Nineteen stars.<br><em>Not a cloud in sight.</em>",
					"Дараагийн ертөнцөд үүлнүүд жаахан хүчтэй болно. Чи чадна аа.",
					"Дараагийн үе →",
					() => {
						engine.loadLevel(engine.level + 1);
						saveProgress();
						enterPlay();
					},
				);
			} else {
				showModal(
					"57 STARS · THREE LITTLE WORLDS",
					"Happy birthday,<br><em>Nomia ♡</em>",
					"Бүх од чинийх. Шинэ нас чинь гэрэлтэй, инээдтэй, сайхан дурсамжтай байг.",
					"Дахин аялах ↻",
					() => {
						engine.loadLevel(0);
						saveProgress();
						enterPlay();
					},
				);
			}
		}
	}
}

function updateHud() {
	$("level-title").textContent = `${engine.level + 1} / 3 · ${engine.theme.name}`;
	$("hud").textContent =
		`★ ${engine.collected}/19 · ☁ ${engine.remaining} · ${"♡".repeat(Math.max(0, engine.player.hp))}`;
	$("secret-enter").hidden = !engine.nearSecret || engine.mode !== "playing";
	document
		.querySelector(".dash")
		.classList.toggle("cooldown", engine.player.dashCooldown > 0);
}

function frame(time) {
	const dt = Math.min((time - lastTime) / 1000, 0.033);
	lastTime = time;
	engine.update(dt, input);
	handleEvents();
	updateHud();
	renderer.draw(engine);
	if (time > toastUntil) $("game-toast").hidden = true;
	requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
