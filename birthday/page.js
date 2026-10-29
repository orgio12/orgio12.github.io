
'use strict';

const $ = id => document.getElementById(id);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;


let toastTimer;

function toast(s) {
	$('toast').textContent = s;
	$('toast').hidden = false;

	clearTimeout(toastTimer);

	toastTimer = setTimeout(
		() => $('toast').hidden = true,
		3500
	);
}


function confetti() {
	if (reduce) return;

	for (let i = 0; i < 65; i++) {
		let e = document.createElement('i');

		e.className = 'confetti';
		e.style.left = Math.random() * 100 + '%';
		e.style.background = [
			'#d96883',
			'#e7ba68',
			'#9ebfa8',
			'#ba9ec6'
		][i % 4];

		e.style.animationDelay = Math.random() * .6 + 's';

		$('confetti').append(e);

		setTimeout(() => e.remove(), 3300);
	}
}


const reasons = [
    'Инээмсэглэл чинь. 😊',
    'Жижигхэн зүйлд баярлаж чаддаг чинь. 😍',
    'Бусдыг ойлгохыг хичээдэг зан чинь. 🤗',
    'Халамжтай, тусч байдал чинь. 💗',
    'Том мөрөөдөлтэй чинь. 🌠',
    'Түүнийхээ төлөө хөдөлмөрлөдөг чинь. 💪',
    'Жаахан хүүхэд шиг байдал чинь. 🤪',
    'Хүмүүстэй найрсаг байдаг чинь. 🥰',
    'Чиний ухаан. 🧠',
    'Ичингүйрэх үе чинь. 🙈',
    'Хөгжилддөг хэв маяг чинь. 😂',
    'Амттай юманд дуртай чинь. 🍰',
    'Өхөөрдөм юм хараад баярладаг чинь. 🧸',
    'Эрч хүчтэй байдаг чинь. ⚡',
    'Өрсөлдөх дуртай зан чинь. 🏆',
    'Үнэнч байдал чинь. 🤞',
    'Сайхан сэтгэл чинь. ❤️',
    'Хамгийн шударга хүн болохоор чинь. ⚖️',
    'Зүгээр л чи болохоор. ♡ 💖'
];
let opened = 0;

reasons.forEach((s, i) => {
	let b = document.createElement('button');

	b.className = 'reason';

	b.innerHTML =
		'<span>' +
		String(i + 1).padStart(2, '0') +
		'</span><br>tap to open ♡';

	b.setAttribute(
		'aria-label',
		'Шалтгаан ' + (i + 1) + '-г нээх'
	);

	b.onclick = () => {
		if (b.classList.contains('open')) return;

		b.classList.add('open');
		b.textContent = s;
		b.setAttribute('aria-label', s);

		$('reasons-count').textContent =
			++opened + ' / 19 нээгдлээ';

		if (opened === 19) confetti();
	};

	$('reasons-grid').append(b);
});


let taps = 0;

$('mascot').onclick = () => toast([
    'Би гоё Номиагийн зургийг хамгаалж байна.',
	'Намайг ажилтай байгааг харахгүй байна уу?',
	'За, үнэндээ ажилгүй л дээ.',
	'Өнөөдөр бялуу хуваалцах шаардлагагүй.',
	'Энэ сайт дээрх хамгийн завгүй хүн нь би.'
][taps++ % 4]);


let memoryVersion = 0;

function resetMemory() {
	let version = ++memoryVersion;

	let symbols = [
		'🍰',
		'🌷',
		'⭐',
		'🍓',
		'🎀',
		'♡'
	];

	let cards = [...symbols, ...symbols];

	for (let i = cards.length - 1; i; i--) {
		let j = Math.floor(Math.random() * (i + 1));

		[cards[i], cards[j]] = [cards[j], cards[i]];
	}

	let first = null,
		locked = false,
		pairs = 0,
		moves = 0;

	$('memory').replaceChildren();
	$('memory-status').textContent = '0 / 6 хос';

	cards.forEach((s, i) => {
		let b = document.createElement('button');

		b.textContent = '✧';
		b.setAttribute('aria-label', 'Карт ' + (i + 1));

		b.onclick = () => {
			if (
				locked ||
				b === first ||
				b.classList.contains('matched')
			) return;

			b.textContent = s;
			b.setAttribute('aria-label', s);

			if (!first) {
				first = b;
				return;
			}

			moves++;

			let previous = first;

			first = null;

			if (previous.textContent === s) {
				b.classList.add('matched');
				previous.classList.add('matched');

				pairs++;

				$('memory-status').textContent =
					pairs + '/6 хос · ' + moves + ' оролдлого';

				if (pairs === 6) {
					confetti();

					toast(
						'Ой тогтоолт: 100. Бялуу авах эрх: нээлттэй.'
					);
				}
			} else {
				locked = true;

				setTimeout(() => {
					if (version !== memoryVersion) return;

					b.textContent = previous.textContent = '✧';

					b.setAttribute(
						'aria-label',
						'Хаалттай карт'
					);

					previous.setAttribute(
						'aria-label',
						'Хаалттай карт'
					);

					locked = false;
				}, 700);
			}
		};

		$('memory').append(b);
	});
}

resetMemory();

$('memory-reset').onclick = resetMemory;


let gifts = 0;

$('gift').onclick = () => {
	gifts++;

	$('gift-text').textContent =
		gifts === 1
			? 'Туузыг тайллаа. Дахиад.'
			: gifts === 2
				? 'Жаахан тэвчээр…'
				: gifts === 3
					? 'Өнөөдөр өөртөө хүссэн амттанаа авч өгөх эрх! ♡'
					: 'Хоосон хайрцаг бас хөөрхөн шүү.';

	if (gifts === 3) {
		$('gift').innerHTML = '<span>🍰</span>';
		confetti();
	}
};


$('candle').onclick = () => {
	if ($('candle').classList.contains('blown')) return;

	$('candle').classList.add('blown');

	$('wish-status').textContent =
		'Wish submitted successfully! ♡';

	$('wish-photo').hidden = false;

	confetti();
};


$('solution').addEventListener('keydown', e => {
	if (e.key === 'Tab') {
		e.preventDefault();

		let x = e.target,
			a = x.selectionStart,
			b = x.selectionEnd;

		x.value =
			x.value.slice(0, a) +
			'    ' +
			x.value.slice(b);

		x.selectionStart = x.selectionEnd = a + 4;
	}
});


$('submit').onclick = () => {
	let btn = $('submit');

	btn.disabled = true;

	$('verdict').textContent = 'Judging…';

	setTimeout(() => {
		try {
			let r = NomyaJudge.judge($('solution').value);

			const msg = {
				AC: 'Accepted · 100 points. За, мэдэж байсан юм. ♡',
				WA: 'Wrong Answer on test ' + r.test + '. Компьютертой санал зөрөлдлөө.',
				CE: 'Syntax error · ' + r.message,
				RE: 'Runtime error · ' + r.message,
				TLE: 'Time limit exceeded · Энэ давталт удах нь ээ.'
			};

			$('verdict').textContent = msg[r.status];

			$('verdict').style.color =
				r.status === 'AC' ? '#49754b' : '#a34d60';

			if (r.status === 'AC') confetti();
		} finally {
			btn.disabled = false;
		}
	}, 100);
};


const cv = $('catch'),
	ctx = cv.getContext('2d');

let active = false,
	basket = 300,
	score = 0,
	hearts = 3,
	items = [],
	spawn = 0,
	last = 0,
	keys = {};


function drawCatch(dt) {
	ctx.clearRect(0, 0, 600, 430);

	ctx.fillStyle = '#fbf1df';
	ctx.fillRect(0, 0, 600, 430);

	ctx.strokeStyle = '#e9d6ba';

	for (let x = 0; x < 600; x += 40) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, 430);
		ctx.stroke();
	}

	if (active) {
		basket += (
			(keys.ArrowRight ? 1 : 0) -
			(keys.ArrowLeft ? 1 : 0)
		) * 420 * dt;

		basket = Math.max(45, Math.min(555, basket));

		spawn -= dt;

		if (spawn <= 0) {
			items.push({
				x: 35 + Math.random() * 530,
				y: -25,
				bad: Math.random() < .22
			});

			spawn = .48;
		}

		for (const o of items) {
			o.y += (125 + score * 3) * dt;

			if (
				o.y > 350 &&
				o.y < 405 &&
				Math.abs(o.x - basket) < 53
			) {
				o.y = 500;

				if (o.bad) {
					hearts--;
				} else {
					score++;
				}
			}

			if (score >= 19 || hearts <= 0) {
				active = false;

				$('catch-start').textContent = 'Дахин ↻';

				if (score >= 19) {
					confetti();
					toast('19 од! Бүгд чинийх.');
				}

				break;
			}
		}

		items = items.filter(o => o.y < 460);

		$('catch-status').textContent =
			'★ ' + score + '/19 · ' +
			'♡'.repeat(Math.max(0, hearts));
	}

	ctx.font = '30px Georgia';
	ctx.textAlign = 'center';

	items.forEach(o => {
		ctx.fillStyle = o.bad ? '#8f939c' : '#db9c37';

		ctx.fillText(
			o.bad ? '☁' : '★',
			o.x,
			o.y
		);
	});

	ctx.fillStyle = '#cf8192';
	ctx.beginPath();

	ctx.roundRect(
		basket - 48,
		365,
		96,
		35,
		[5, 5, 18, 18]
	);

	ctx.fill();

	ctx.fillStyle = '#fff';
	ctx.font = '20px Georgia';
	ctx.fillText('♡', basket, 391);

	if (!active) {
		ctx.fillStyle = '#765e4f';
		ctx.font = '23px Georgia';

		ctx.fillText(
			score >= 19
				? 'Nineteen wishes, caught.'
				: hearts <= 0
					? 'Дахиад нэг оролдлого?'
					: 'Catch a little happiness',
			300,
			185
		);
	}
}


function frame(t) {
	const dt = Math.min((t - last) / 1000, .04);

	last = t;

	drawCatch(dt);

	requestAnimationFrame(frame);
}

requestAnimationFrame(frame);


$('catch-start').onclick = () => {
	active = !active;

	if (active) {
		score = 0;
		hearts = 3;
		items = [];
		spawn = 0;

		$('catch-start').textContent = 'Зогсоох';
	} else {
		$('catch-start').textContent = 'Тоглох →';
	}
};


function point(e) {
	let r = cv.getBoundingClientRect();

	basket = Math.max(
		45,
		Math.min(
			555,
			(e.clientX - r.left) / r.width * 600
		)
	);
}


cv.onpointerdown = e => {
	cv.setPointerCapture(e.pointerId);
	point(e);
};

cv.onpointermove = e => {
	if (e.buttons) point(e);
};


window.addEventListener('keydown', e => {
	if (document.activeElement.tagName === 'TEXTAREA') return;

	if (
		active &&
		['ArrowLeft', 'ArrowRight'].includes(e.key)
	) {
		e.preventDefault();
		keys[e.key] = true;
	}
});


window.addEventListener('keyup', e => {
	keys[e.key] = false;
});


window.addEventListener('blur', () => {
	keys = {};
	active = false;

	$('catch-start').textContent = 'Тоглох →';
});
