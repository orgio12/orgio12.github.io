
'use strict';

const $ = x => document.getElementById(x),
	canvas = $('world'),
	g = canvas.getContext('2d'),
	sprite = new Image();

sprite.src = 'assets/character.png';

const W = 960,
	H = 540,
	worldW = 3300;

const themes = [
	{
		name: 'The little garden',
		sky: '#e9eee0',
		hill: '#c9d8b3',
		ground: '#b1c998',
		flower: '#e2a6b6'
	},
	{
		name: 'Peach-cloud valley',
		sky: '#fae9de',
		hill: '#e9c8bc',
		ground: '#d5ad9e',
		flower: '#e8b76c'
	},
	{
		name: 'The starlight picnic',
		sky: '#eae3f1',
		hill: '#c6b8d7',
		ground: '#ac9bc4',
		flower: '#e4b4ce'
	}
];

let level = 0,
	mode = 'intro',
	player,
	stars = [],
	enemies = [],
	platforms = [],
	particles = [],
	camera = 0,
	time = 0,
	last = 0,
	keys = {},
	action = null,
	checkpoint = 60,
	levelTime = 0,
	totalTime = 0,
	toast = '',
	toastLife = 0;


function reset() {
	player = {
		x: 60,
		y: 360,
		w: 42,
		h: 55,
		vx: 0,
		vy: 0,
		hp: 3,
		jumps: 0,
		inv: 0,
		dash: 0,
		cooldown: 0,
		facing: 1,
		ground: false
	};

	checkpoint = 60;
	camera = 0;
	levelTime = 0;

	particles = [];
	stars = [];
	platforms = [];
	enemies = [];

	for (let i = 0; i < 19; i++) {
		let x = 170 + i * 155,
			raised = i % 3 !== 0;

		let y = raised
			? ((i % 3 === 1) ? 342 - level * 12 : 270 + level * 10)
			: 455;

		stars.push({
			x,
			y: raised ? y - 35 : 420,
			taken: false
		});

		if (raised) {
			platforms.push({
				x: x - 55,
				y,
				w: 120,
				h: 15
			});
		}
	}

	for (let i = 0; i < 4 + level; i++) {
		enemies.push({
			base: 480 + i * 460,
			x: 480 + i * 460,
			y: 432,
			w: 44,
			h: 30,
			phase: i * 1.7
		});
	}

	$('level-title').textContent =
		String(level + 1).padStart(2, '0') + ' · ' + themes[level].name;

	hud();
}


function hud() {
	let n = stars.filter(s => s.taken).length;

	$('hud').textContent =
		'★ ' + n + ' / 19 · ' + '♡ '.repeat(Math.max(0, player.hp));

	document.querySelector('.dash').classList.toggle(
		'cooldown',
		player.cooldown > 0
	);
}


function show(tag, title, copy, label, fn) {
	mode = 'overlay';
	keys = {};

	$('modal-tag').textContent = tag;
	$('modal-title').innerHTML = title;
	$('modal-copy').textContent = copy;
	$('instructions').hidden = true;
	$('modal-action').textContent = label;
	$('overlay').hidden = false;

	action = fn;
}


function resume() {
	mode = 'playing';
	$('overlay').hidden = true;
	keys = {};
	last = performance.now();
}


function start() {
	reset();
	resume();
}


action = start;

$('modal-action').onclick = () => action?.();

$('pause').onclick = () => {
	if (mode === 'playing') {
		show(
			'TAKE YOUR TIME',
			'A tiny pause.',
			'Однууд хүлээж байж чадна.',
			'Үргэлжлүүлэх →',
			resume
		);
	} else if (
		mode === 'overlay' &&
		$('modal-tag').textContent === 'TAKE YOUR TIME'
	) {
		resume();
	}
};

$('fullscreen').onclick = async () => {
	try {
		if (!document.fullscreenElement) {
			await $('game-shell').requestFullscreen();
		} else {
			await document.exitFullscreen();
		}
	} catch {
		toast = 'Энэ browser бүтэн дэлгэцийг дэмжихгүй байна.';
		toastLife = 3;
	}
};


function jump() {
	if (mode !== 'playing' || player.jumps >= 2) return;

	player.vy = player.jumps === 0 ? -480 : -430;
	player.jumps++;
	player.ground = false;

	burst(player.x + 20, player.y + 50, '#ffffff', 6);
}


function dash() {
	if (mode !== 'playing' || player.cooldown > 0) return;

	player.dash = .24;
	player.cooldown = 2;
	player.inv = Math.max(player.inv, .35);

	burst(player.x + 20, player.y + 20, '#e4bb65', 10);
}


function press(k) {
	if (k === 'jump') jump();
	if (k === 'dash') dash();

	keys[k] = true;
}


function clear() {
	keys = {};

	document.querySelectorAll('.pressed').forEach(b =>
		b.classList.remove('pressed')
	);
}


document.querySelectorAll('[data-key]').forEach(b => {
	b.onpointerdown = e => {
		e.preventDefault();

		b.setPointerCapture(e.pointerId);
		b.classList.add('pressed');

		press(b.dataset.key);
	};

	const up = () => {
		keys[b.dataset.key] = false;
		b.classList.remove('pressed');
	};

	b.onpointerup = up;
	b.onpointercancel = up;
	b.onlostpointercapture = up;
});


const keymap = {
	ArrowLeft: 'left',
	a: 'left',
	A: 'left',
	ArrowRight: 'right',
	d: 'right',
	D: 'right',
	ArrowUp: 'jump',
	' ': 'jump',
	w: 'jump',
	W: 'jump',
	Shift: 'dash',
	x: 'dash',
	X: 'dash'
};


window.addEventListener('keydown', e => {
	if (e.key === 'Escape' || e.key === 'p') {
		if (!e.repeat) $('pause').click();
		return;
	}

	let k = keymap[e.key];

	if (k) {
		e.preventDefault();
		if (!e.repeat) press(k);
	}
});


window.addEventListener('keyup', e => {
	let k = keymap[e.key];

	if (k) keys[k] = false;
});


window.addEventListener('blur', () => {
	clear();

	if (mode === 'playing') $('pause').click();
});


document.addEventListener('visibilitychange', () => {
	if (document.hidden && mode === 'playing') $('pause').click();
});


window.addEventListener('resize', () => {
	clear();

	if (
		innerHeight > innerWidth &&
		innerWidth <= 750 &&
		mode === 'playing'
	) {
		$('pause').click();
	}
});


function burst(x, y, color, n) {
	for (let i = 0; i < n; i++) {
		particles.push({
			x,
			y,
			vx: (Math.random() - .5) * 170,
			vy: -Math.random() * 160,
			life: .8,
			color
		});
	}
}


function hit() {
	if (player.inv > 0) return;

	player.hp--;
	player.inv = 1.8;
	player.vy = -260;
	player.x = checkpoint;
	player.y = 360;
	player.jumps = 0;

	burst(player.x + 20, player.y + 25, '#d98f9b', 12);

	if (player.hp <= 0) {
		show(
			'A LITTLE DETOUR',
			'One more try?',
			'Зүгээр ээ. Энэ ертөнцөд дахин эхлэх эрх хязгааргүй.',
			'Энэ үеийг дахин тоглох →',
			start
		);
	}

	hud();
}


function update(dt) {
	time += dt;
	toastLife -= dt;

	if (mode !== 'playing') return;

	levelTime += dt;

	let p = player;

	p.inv = Math.max(0, p.inv - dt);
	p.dash = Math.max(0, p.dash - dt);
	p.cooldown = Math.max(0, p.cooldown - dt);

	let dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);

	if (dir) p.facing = dir;

	p.vx = p.dash > 0 ? p.facing * 610 : dir * 230;
	p.x = Math.max(0, Math.min(worldW - p.w, p.x + p.vx * dt));

	let oldBottom = p.y + p.h;

	p.vy += 1150 * dt;
	p.y += p.vy * dt;
	p.ground = false;

	if (p.y + p.h >= 460) {
		p.y = 460 - p.h;
		p.vy = 0;
		p.ground = true;
		p.jumps = 0;
	}

	for (let pl of platforms) {
		if (
			p.vy >= 0 &&
			oldBottom <= pl.y + 2 &&
			p.y + p.h >= pl.y &&
			p.x + p.w > pl.x &&
			p.x < pl.x + pl.w
		) {
			p.y = pl.y - p.h;
			p.vy = 0;
			p.ground = true;
			p.jumps = 0;
		}
	}

	if (p.x > checkpoint + 900) {
		checkpoint = p.x;
		toast = 'Бяцхан checkpoint ♡';
		toastLife = 2;
	}

	for (let s of stars) {
		if (
			!s.taken &&
			Math.hypot(
				p.x + p.w / 2 - s.x,
				p.y + p.h / 2 - s.y
			) < 43
		) {
			s.taken = true;
			burst(s.x, s.y, '#e4b348', 14);
		}
	}

	for (let e of enemies) {
		e.x = e.base +
			Math.sin(time * (.7 + level * .25) + e.phase) * 85;

		if (
			p.x + p.w > e.x &&
			p.x < e.x + e.w &&
			p.y + p.h > e.y &&
			p.y < e.y + e.h
		) {
			hit();
		}
	}

	if (p.x > 3150) {
		let count = stars.filter(s => s.taken).length;

		if (count < 19) {
			toast = 'Бэлгээ нээхэд дахиад ' +
				(19 - count) + ' од хэрэгтэй.';

			toastLife = 1;
		} else {
			totalTime += levelTime;

			if (level < 2) {
				show(
					'LEVEL ' + (level + 1) + ' COMPLETE',
					'Nineteen little stars.',
					'Бүгдийг нь оллоо! Дараагийн ертөнц чамайг хүлээж байна.',
					'Дараагийн ертөнц →',
					() => {
						level++;
						start();
					}
				);
			} else {
				show(
					'ALL 57 STARS FOUND',
					'You are the<br><em>little star.</em>',
					'Төрсөн өдрийн мэнд, Nomya. Чиний шинэ нас ийм олон гэрэлтэй байг. ♡',
					'Бүхнийг дахин тоглох ↻',
					() => {
						level = 0;
						totalTime = 0;
						start();
					}
				);
			}
		}
	}

	camera = Math.max(
		0,
		Math.min(worldW - W, p.x - W * .34)
	);

	for (let x of particles) {
		x.x += x.vx * dt;
		x.y += x.vy * dt;
		x.vy += 240 * dt;
		x.life -= dt;
	}

	particles = particles.filter(p => p.life > 0);

	hud();
}


function cloud(x, y, scale = 1, color = '#fffaf0') {
	g.fillStyle = color;
	g.beginPath();

	g.ellipse(x, y, 42 * scale, 16 * scale, 0, 0, Math.PI * 2);

	g.ellipse(
		x - 19 * scale,
		y - 10 * scale,
		20 * scale,
		22 * scale,
		0,
		0,
		Math.PI * 2
	);

	g.ellipse(
		x + 10 * scale,
		y - 16 * scale,
		25 * scale,
		26 * scale,
		0,
		0,
		Math.PI * 2
	);

	g.fill();
}


function star(x, y, r, fill) {
	g.fillStyle = fill;
	g.beginPath();

	for (let i = 0; i < 10; i++) {
		let a = -Math.PI / 2 + i * Math.PI / 5,
			rr = i % 2 ? r * .46 : r;

		g.lineTo(
			x + Math.cos(a) * rr,
			y + Math.sin(a) * rr
		);
	}

	g.closePath();
	g.fill();
}


function render() {
	let t = themes[level];

	g.fillStyle = t.sky;
	g.fillRect(0, 0, W, H);

	g.fillStyle = level === 2 ? '#fff4cb' : '#efd2a1';
	g.beginPath();
	g.arc(790 - camera * .04, 95, 40, 0, Math.PI * 2);
	g.fill();

	for (let i = 0; i < 9; i++) {
		let x = i * 220 - camera * .2;

		cloud(x, 100 + Math.sin(i) * 30, .85);
	}

	g.fillStyle = t.hill;

	for (let i = 0; i < 8; i++) {
		g.beginPath();

		g.ellipse(
			i * 300 - camera * .38,
			460,
			270,
			160 + (i % 3) * 25,
			0,
			Math.PI,
			0
		);

		g.fill();
	}

	g.save();
	g.translate(-camera, 0);

	g.fillStyle = t.ground;
	g.fillRect(0, 460, worldW, 80);

	g.fillStyle = '#fff7df66';
	g.fillRect(0, 460, worldW, 7);

	for (let i = 0; i < 100; i++) {
		let x = i * 37 + 14;

		g.strokeStyle = '#6e8a6844';
		g.beginPath();
		g.moveTo(x, 460);
		g.lineTo(x - 4, 448);
		g.stroke();

		if (i % 4 === 0) {
			g.fillStyle = t.flower;
			g.beginPath();
			g.arc(x - 4, 446, 5, 0, 7);
			g.fill();
		}
	}

	for (let pl of platforms) {
		g.fillStyle = t.ground;
		g.beginPath();
		g.roundRect(pl.x, pl.y, pl.w, pl.h, 7);
		g.fill();

		g.fillStyle = '#fff9e7';
		g.fillRect(pl.x + 5, pl.y, pl.w - 10, 4);
	}

	for (let s of stars) {
		if (!s.taken) {
			let y = s.y + Math.sin(time * 3 + s.x) * 4;

			g.fillStyle = '#fff3ba66';
			g.beginPath();
			g.arc(s.x, y, 23, 0, 7);
			g.fill();

			star(s.x, y, 14, '#d9a03d');
		}
	}

	for (let e of enemies) {
		cloud(e.x + 22, e.y + 19, .48, '#a29ba5');

		g.fillStyle = '#5e5363';
		g.fillRect(e.x + 13, e.y + 12, 3, 5);
		g.fillRect(e.x + 29, e.y + 12, 3, 5);

		g.beginPath();
		g.arc(e.x + 23, e.y + 25, 5, Math.PI, 0);
		g.strokeStyle = '#5e5363';
		g.stroke();
	}

	g.fillStyle = '#c67c91';
	g.beginPath();
	g.roundRect(3185, 405, 60, 55, 7);
	g.fill();

	g.fillStyle = '#f7dfa7';
	g.fillRect(3211, 405, 8, 55);
	g.fillRect(3180, 402, 70, 12);

	g.font = '18px Georgia';
	g.textAlign = 'center';
	g.fillStyle = '#74545d';
	g.fillText('a little gift', 3215, 385);

	let p = player;

	if (p) {
		g.fillStyle = '#574c3922';
		g.beginPath();
		g.ellipse(p.x + 21, 465, 22, 5, 0, 0, 7);
		g.fill();

		if (p.inv <= 0 || Math.floor(time * 14) % 2 === 0) {
			g.save();

			if (p.dash > 0) {
				g.shadowColor = '#ffd87d';
				g.shadowBlur = 20;
			}

			g.globalCompositeOperation = 'multiply';

			if (sprite.complete && sprite.naturalWidth) {
				g.drawImage(
					sprite,
					180,
					300,
					750,
					900,
					p.x - 7,
					p.y - 12,
					56,
					67
				);
			}

			g.restore();
		}

		if (p.cooldown <= 0) {
			star(p.x + 45, p.y + 4, 5, '#d5a345');
		}
	}

	for (let x of particles) {
		g.globalAlpha = Math.max(0, x.life);
		star(x.x, x.y, 4, x.color);
	}

	g.globalAlpha = 1;
	g.restore();

	if (toastLife > 0) {
		g.fillStyle = '#fffaf0ed';
		g.beginPath();
		g.roundRect(200, 90, 560, 40, 12);
		g.fill();

		g.fillStyle = '#745c4e';
		g.font = '15px Arial';
		g.textAlign = 'center';
		g.fillText(toast, 480, 116);
	}

	if (mode === 'playing') {
		g.fillStyle = '#fffaf088';
		g.fillRect(300, 515, 360, 4);

		g.fillStyle = '#c78a9b';

		g.fillRect(
			300,
			515,
			360 * stars.filter(s => s.taken).length / 19,
			4
		);
	}
}


function frame(t) {
	let dt = Math.min((t - last) / 1000, .033);

	last = t;

	update(dt);
	render();

	requestAnimationFrame(frame);
}


reset();
requestAnimationFrame(frame);
