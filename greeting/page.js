"use strict";

// 01. SHARED FEEDBACK ---------------------------------------------------------
const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sound = window.NomiaSound;
let toastTimer;

sound.bind($("sound-toggle"));

function toast(message) {
	$("toast").textContent = message;
	$("toast").hidden = false;
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		$("toast").hidden = true;
	}, 3500);
}

function confetti() {
	if (reducedMotion) return;
	const colors = ["#d96883", "#e7ba68", "#9ebfa8", "#ba9ec6"];
	for (let i = 0; i < 65; i++) {
		const piece = document.createElement("i");
		piece.className = "confetti";
		piece.style.left = Math.random() * 100 + "%";
		piece.style.background = colors[i % colors.length];
		piece.style.animationDelay = Math.random() * 0.6 + "s";
		$("confetti").append(piece);
		setTimeout(() => piece.remove(), 3300);
	}
}

// 02. NINETEEN ILLUSTRATED REASONS -------------------------------------------
function doodle(icon) {
	const art = {
		heart: '<path d="M50 77C-4 42 22 12 50 35C78 12 104 42 50 77Z"/>',
		star: '<path d="M50 13l11 24 27 4-20 19 5 27-23-13-23 13 5-27-20-19 27-4Z"/>',
		sun: '<circle cx="50" cy="50" r="21"/><path d="M50 8v10m0 64v10M8 50h10m64 0h10M20 20l8 8m44 44 8 8M80 20l-8 8M28 72l-8 8"/><path d="M42 54q8 9 16 0"/>',
		smile:
			'<circle cx="50" cy="50" r="32"/><path d="M38 37v7m24-7v7M34 56q16 22 32 0"/><path d="M19 9l5 9m56-9-5 9"/>',
		moon: '<path d="M65 16C23 7 9 71 48 84q25 6 39-18C45 82 31 34 65 16Z"/><path d="M78 20v18m-9-9h18"/>',
		flower:
			'<path d="M50 34C20-2 7 39 33 49C0 73 39 97 50 66C66 100 99 70 68 50C100 29 64-3 50 34Z"/><circle cx="50" cy="50" r="11"/>',
		bow: '<path d="M43 45Q4 2 13 64Q27 79 45 55M57 45Q96 2 87 64Q73 79 55 55M43 57L25 88l20-7 5 10 5-34M57 57l18 31-20-7-5 10"/><circle cx="50" cy="49" r="10"/>',
		cake: '<path d="M20 48v30q30 15 60 0V48"/><ellipse cx="50" cy="48" rx="30" ry="12"/><path d="M48 43V23h7v20M51 19q-9-5 0-15q9 10 0 15M21 61q30 16 58 0"/>',
	};
	return (
		'<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
		art[icon] +
		"</g></svg>"
	);
}

function initReasons() {
	let opened = 0;
	window.NOMIA_REASONS.forEach((reason, index) => {
		const button = document.createElement("button");
		button.className = "reason theme-" + (index % 4);
		button.setAttribute("aria-label", reason.title + " — нээх");
		button.setAttribute("aria-pressed", "false");
		button.innerHTML = `
			<span class="card-tape"></span>
			<span class="reason-front">
				<span class="reason-number">${String(index + 1).padStart(2, "0")}</span>
				<span class="reason-art">${doodle(reason.icon)}</span>
				<strong>${reason.title}</strong>
				<small>эргүүлээд үз ♡</small>
			</span>
			<span class="reason-back"><span>♡</span>${reason.note}</span>
		`;
		let seen = false;
		button.addEventListener("click", () => {
			const isOpen = button.classList.toggle("open");
			button.setAttribute("aria-pressed", String(isOpen));
			button.setAttribute("aria-label", isOpen ? reason.note : reason.title + " — нээх");
			if (!seen) {
				seen = true;
				opened++;
				$("reasons-count").textContent = opened + " / 19 нээгдлээ";
				if (opened === 19) confetti();
			}
			sound.play("tap");
		});
		$("reasons-grid").append(button);
	});
	let taps = 0;
	$("mascot").onclick = () => {
		const messages = [
			"Намайг ажилтай байгааг харахгүй байна уу?",
			"За, үнэндээ ажилгүй л дээ.",
			"Өнөөдөр бялуу хуваалцах шаардлагагүй.",
			"Энэ сайтад хамгийн завгүй хүн нь би.",
		];
		toast(messages[taps++ % messages.length]);
		sound.play("tap");
	};
}

// 03. MATCHING CARDS ---------------------------------------------------------
function initMemory() {
	let version = 0;
	function reset() {
		const thisVersion = ++version;
		const symbols = ["🍰", "🌷", "⭐", "🍓", "🎀", "♡"];
		const cards = [...symbols, ...symbols];
		for (let i = cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[cards[i], cards[j]] = [cards[j], cards[i]];
		}
		let first = null;
		let locked = false;
		let pairs = 0;
		let moves = 0;
		$("memory").replaceChildren();
		$("memory-status").textContent = "0 / 6 хос";
		cards.forEach((symbol, index) => {
			const button = document.createElement("button");
			button.textContent = "✧";
			button.setAttribute("aria-label", "Карт " + (index + 1));
			button.onclick = () => {
				if (locked || button === first || button.classList.contains("matched")) return;
				button.textContent = symbol;
				button.setAttribute("aria-label", symbol);
				sound.play("tap");
				if (!first) {
					first = button;
					return;
				}
				moves++;
				const previous = first;
				first = null;
				if (previous.textContent === symbol) {
					button.classList.add("matched");
					previous.classList.add("matched");
					pairs++;
					$("memory-status").textContent = `${pairs}/6 хос · ${moves} оролдлого`;
					sound.play("star");
					if (pairs === 6) {
						confetti();
						toast("Бүх хос олдлоо. ♡");
					}
				} else {
					locked = true;
					setTimeout(() => {
						if (thisVersion !== version) return;
						button.textContent = previous.textContent = "✧";
						button.setAttribute("aria-label", "Хаалттай карт");
						previous.setAttribute("aria-label", "Хаалттай карт");
						locked = false;
					}, 750);
				}
			};
			$("memory").append(button);
		});
	}
	reset();
	$("memory-reset").onclick = reset;
}

// 04. CATCH NINETEEN STARS ---------------------------------------------------
function initCatch() {
	const canvas = $("catch");
	const ctx = canvas.getContext("2d");
	let active = false;
	let basket = 300;
	let score = 0;
	let hearts = 3;
	let items = [];
	let spawn = 0;
	let last = 0;
	let keys = {};

	function frame(time) {
		const dt = Math.min((time - last) / 1000, 0.04);
		last = time;
		ctx.fillStyle = "#fbf1df";
		ctx.fillRect(0, 0, 600, 430);
		ctx.strokeStyle = "#e9d6ba";
		for (let x = 0; x < 600; x += 40) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, 430);
			ctx.stroke();
		}
		if (active) {
			basket += ((keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)) * 420 * dt;
			basket = Math.max(45, Math.min(555, basket));
			spawn -= dt;
			if (spawn <= 0) {
				items.push({ x: 35 + Math.random() * 530, y: -25, bad: Math.random() < 0.22 });
				spawn = 0.48;
			}
			for (const item of items) {
				item.y += (125 + score * 3) * dt;
				if (item.y > 350 && item.y < 405 && Math.abs(item.x - basket) < 53) {
					item.y = 500;
					if (item.bad) {
						hearts--;
						sound.play("wrong");
					} else {
						score++;
						sound.play("star");
					}
				}
				if (score >= 19 || hearts <= 0) {
					active = false;
					$("catch-start").textContent = "Дахин ↻";
					if (score >= 19) {
						confetti();
						toast("19 од! Бүгд чинийх.");
					}
					break;
				}
			}
			items = items.filter((item) => item.y < 460);
			$("catch-status").textContent =
				`★ ${score}/19 · ${"♡".repeat(Math.max(0, hearts))}`;
		}
		ctx.font = "30px Georgia";
		ctx.textAlign = "center";
		for (const item of items) {
			ctx.fillStyle = item.bad ? "#8f939c" : "#db9c37";
			ctx.fillText(item.bad ? "☁" : "★", item.x, item.y);
		}
		ctx.fillStyle = "#cf8192";
		ctx.beginPath();
		ctx.roundRect(basket - 48, 365, 96, 35, [5, 5, 18, 18]);
		ctx.fill();
		ctx.fillStyle = "#fff";
		ctx.font = "20px Georgia";
		ctx.fillText("♡", basket, 391);
		if (!active) {
			ctx.fillStyle = "#765e4f";
			ctx.font = "23px Georgia";
			const message =
				score >= 19
					? "Nineteen wishes, caught."
					: hearts <= 0
						? "Дахиад нэг оролдлого?"
						: "Catch a little happiness";
			ctx.fillText(message, 300, 185);
		}
		requestAnimationFrame(frame);
	}

	$("catch-start").onclick = () => {
		active = !active;
		if (active) {
			score = 0;
			hearts = 3;
			items = [];
			spawn = 0;
		}
		$("catch-start").textContent = active ? "Зогсоох" : "Тоглох →";
	};
	function point(event) {
		const rect = canvas.getBoundingClientRect();
		basket = Math.max(
			45,
			Math.min(555, ((event.clientX - rect.left) / rect.width) * 600),
		);
	}
	canvas.onpointerdown = (event) => {
		canvas.setPointerCapture(event.pointerId);
		point(event);
	};
	canvas.onpointermove = (event) => {
		if (event.buttons) point(event);
	};
	window.addEventListener("keydown", (event) => {
		if (["TEXTAREA", "SELECT", "INPUT"].includes(document.activeElement.tagName)) return;
		if (active && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
			event.preventDefault();
			keys[event.key] = true;
		}
	});
	window.addEventListener("keyup", (event) => {
		keys[event.key] = false;
	});
	window.addEventListener("blur", () => {
		keys = {};
		active = false;
		$("catch-start").textContent = "Тоглох →";
	});
	requestAnimationFrame(frame);
}

// 05. NEW MINI-GAME: REPEAT THE LIGHT SEQUENCE -------------------------------
function initEcho() {
	const pads = [...document.querySelectorAll("[data-pad]")];
	let sequence = [];
	let round = 0;
	let index = 0;
	let accepting = false;
	let generation = 0;
	const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	async function flash(value, ms = 400) {
		pads[value].classList.add("lit");
		sound.play("pad" + value);
		await wait(ms);
		pads[value].classList.remove("lit");
	}

	async function showSequence() {
		const token = ++generation;
		accepting = false;
		index = 0;
		$("echo-start").disabled = true;
		$("echo-status").textContent = `Үе ${round} / 3 · Ажиглаарай…`;
		await wait(450);
		for (const value of sequence) {
			if (token !== generation) return;
			await flash(value);
			await wait(200);
		}
		if (token !== generation) return;
		accepting = true;
		$("echo-status").textContent = `Үе ${round} / 3 · Чиний ээлж`;
		$("echo-start").disabled = false;
		$("echo-start").textContent = "Дахин харах ↻";
	}

	$("echo-start").onclick = () => {
		if (!round || round > 3) {
			round = 1;
			sequence = Array.from({ length: 3 }, () => Math.floor(Math.random() * 4));
		}
		showSequence();
	};
	pads.forEach((pad, value) => {
		pad.onclick = async () => {
			if (!accepting) return;
			flash(value, 160);
			if (sequence[index] !== value) {
				accepting = false;
				$("echo-status").textContent = "Хмм… дахин хараад үзье?";
				sound.play("wrong");
				return;
			}
			index++;
			if (index === sequence.length) {
				accepting = false;
				round++;
				if (round > 3) {
					$("echo-status").textContent = "Гурван үе! Однууд чамайг таньдаг болжээ. ♡";
					$("echo-start").textContent = "Шинээр тоглох ↻";
					confetti();
					sound.play("win");
				} else {
					$("echo-start").disabled = true;
					sequence.push(Math.floor(Math.random() * 4));
					await wait(600);
					showSequence();
				}
			}
		};
	});
}

// 06. PHONE-FRIENDLY NOMIAPC -------------------------------------------------
function initCode() {
	const input = $("solution");
	const tokens = [
		"s[i]",
		"s[i-1]",
		"'W'",
		"'A'",
		"i",
		"0",
		"==",
		"!=",
		"&&",
		"||",
		"(",
		")",
	];
	for (const token of tokens) {
		const button = document.createElement("button");
		button.textContent = token;
		button.type = "button";
		button.onclick = () => {
			const start = input.selectionStart;
			const end = input.selectionEnd;
			input.value = input.value.slice(0, start) + token + input.value.slice(end);
			input.focus();
			input.setSelectionRange(start + token.length, start + token.length);
		};
		$("code-keyboard").append(button);
	}
	$("build-insert").onclick = () => {
		const current = $("build-current").value;
		const op = $("build-op").value;
		const previous = $("build-previous").value;
		if (!current || !op || !previous) {
			toast("Гурван хэсгийг сонгоорой.");
			return;
		}
		input.value = `s[i] == '${current}' ${op} (i == 0 || s[i-1] == '${previous}')`;
		toast("Нөхцөл орлоо. Submit дараарай.");
	};
	$("verdict-close").onclick = () => $("verdict-dialog").close();
	$("verdict-dialog").addEventListener("click", (event) => {
		if (event.target === $("verdict-dialog")) $("verdict-dialog").close();
	});
	$("submit").onclick = () => {
		let condition = input.value
			.trim()
			.replace(/[‘’]/g, "'")
			.replace(/[“”]/g, '"')
			.replace(/；/g, ";")
			.replace(/;\s*$/, "");
		if (!condition) {
			toast("Эхлээд нөхцөлөө бичээрэй.");
			input.focus();
			return;
		}
		// A phone may auto-insert a single space or smart punctuation.
		// Compare behavior, not the spelling of a particular solution.
		const source = `int answer = 0; for(int i=0;i<n;++i){ if(${condition}) ++answer; } return answer;`;
		const result = NomiaJudge.judge(source);
		const ac = result.status === "AC";
		const error = !["AC", "WA"].includes(result.status);
		$("verdict").textContent = ac
			? "Accepted ♡"
			: error
				? "Нөхцөлөө шалгаарай"
				: "Wrong Answer · try again";
		$("verdict-label").textContent = ac
			? "NOMIAPC · ACCEPTED"
			: error
				? "A TINY TYPO?"
				: "NOMIAPC · WRONG ANSWER";
		$("verdict-title").textContent = ac
			? "Мэдэж байсан юм! ♡"
			: error
				? "Бичвэр дээр жаахан гацчихлаа."
				: "Хмм… дахиад нэг үзэх үү?";
		$("verdict-message").textContent = ac
			? "EGOI Queen strikes again. Одоо бялуугаа идэж болно."
			: error
				? "if доторх нөхцөлийг л оруулаарай. Хаалт, тэмдэгтээ шалгаад эсвэл сонгох хувилбарыг ашиглаарай."
				: "Нэг жижиг зүйл зөрөөд байна. Бялуу чинь хүлээж байгаа шүү.";
		$("verdict-sticker").textContent = ac ? "AC ♡" : error ? "…?" : "WA?";
		$("verdict-dialog").classList.toggle("is-ac", ac);
		$("verdict-dialog").showModal();
		sound.play(ac ? "win" : "wrong");
		if (ac) confetti();
	};
}

// 07. GIFT, CANDLE AND ENVELOPE ----------------------------------------------
function initSurprises() {
	let gifts = 0;
	$("gift").onclick = () => {
		gifts++;
		const messages = [
			"Туузыг тайллаа. Дахиад.",
			"Жаахан тэвчээр…",
			"Өнөөдөр өөртөө хүссэн амттанаа авч өгөх эрх! ♡",
		];
		$("gift-text").textContent = messages[Math.min(gifts - 1, 2)];
		sound.play("tap");
		if (gifts === 3) {
			$("gift").innerHTML = "<span>🍰</span>";
			confetti();
			sound.play("win");
		}
	};
	$("candle").onclick = () => {
		if ($("candle").classList.contains("blown")) return;
		$("candle").classList.add("blown");
		$("wish-status").textContent = "Wish submitted successfully! ♡";
		$("wish-photo").hidden = false;
		confetti();
		sound.play("win");
	};
	$("open-letter").onclick = () => {
		$("envelope-scene").classList.add("opened");
		$("open-letter").setAttribute("aria-expanded", "true");
		$("letter-paper").hidden = false;
		$("open-letter").disabled = true;
		sound.play("secret");
		setTimeout(
			() => {
				$("letter-paper").focus({ preventScroll: true });
				$("letter-paper").scrollIntoView({
					behavior: reducedMotion ? "instant" : "smooth",
					block: "start",
				});
			},
			reducedMotion ? 0 : 850,
		);
	};
}

// 08. START -----------------------------------------------------------------
initReasons();
initMemory();
initCatch();
initEcho();
initCode();
initSurprises();
