/* DRAWING ONLY — change the world's art here without changing game rules. */
window.NomiaRenderer = class {
	constructor(canvas) {
		this.ctx = canvas.getContext("2d");
		this.sprite = new Image();
		this.sprite.src = "assets/character.png";
		this.ink = "#51443d";
	}

	path(points, fill, stroke = this.ink, width = 2) {
		const g = this.ctx;
		g.beginPath();
		points(g);
		if (fill) {
			g.fillStyle = fill;
			g.fill();
		}
		if (stroke) {
			g.strokeStyle = stroke;
			g.lineWidth = width;
			g.stroke();
		}
	}

	ellipse(x, y, rx, ry, fill, stroke = null, width = 2) {
		this.path((g) => g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2), fill, stroke, width);
	}

	star(x, y, radius, fill, outline = true) {
		this.path(
			(g) => {
				for (let i = 0; i < 10; i++) {
					const angle = -Math.PI / 2 + (i * Math.PI) / 5;
					const r = i % 2 ? radius * 0.48 : radius;
					g.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
				}
				g.closePath();
			},
			fill,
			outline ? "#a58449" : null,
			1.5,
		);
	}

	cloud(x, y, scale = 1, fill = "#fffaf0", stroke = null) {
		const g = this.ctx;
		g.save();
		g.translate(x, y);
		g.scale(scale, scale);
		this.path(
			(c) => {
				c.moveTo(-40, 10);
				c.bezierCurveTo(-58, -4, -43, -25, -26, -19);
				c.bezierCurveTo(-24, -48, 12, -47, 22, -24);
				c.bezierCurveTo(48, -32, 63, 4, 39, 12);
				c.bezierCurveTo(15, 20, -24, 18, -40, 10);
			},
			fill,
			stroke,
			2.5,
		);
		g.restore();
	}

	draw(engine) {
		const g = this.ctx;
		const dark = document.documentElement.dataset.theme === "dark";
		const theme = dark
			? {
					...engine.theme,
					sky: ["#111b2c", "#201b32", "#151b35"][engine.level],
					hill: ["#1c3444", "#3a2a43", "#292e50"][engine.level],
					ground: ["#2b4750", "#4b3751", "#3b4160"][engine.level],
					accent: "#dcafcf",
				}
			: engine.theme;
		this.ink = dark ? "#8d829f" : "#51443d";
		const time = engine.time;
		g.clearRect(0, 0, 960, 540);
		g.fillStyle = theme.sky;
		g.fillRect(0, 0, 960, 540);
		this.ellipse(790 - engine.camera * 0.03, 92, 33, 33, "#efce89");
		g.save();
		g.globalAlpha = 0.75;
		for (let i = 0; i < 8; i++)
			this.cloud(i * 240 - engine.camera * 0.13, 95 + Math.sin(i) * 30, 0.75);
		g.restore();
		for (let i = 0; i < 9; i++)
			this.ellipse(
				i * 260 - engine.camera * 0.3,
				408,
				240,
				135 + (i % 2) * 35,
				theme.hill,
			);
		g.save();
		g.translate(-engine.camera, 0);

		// Soft paper ground; controls sit in the empty lower margin.
		g.fillStyle = theme.ground;
		g.fillRect(0, 400, 3300, 140);
		this.path(
			(c) => {
				c.moveTo(0, 400);
				c.lineTo(3300, 400);
			},
			null,
			"#748060",
			2,
		);
		for (let i = 0; i < 100; i++) {
			const x = i * 37 + 14;
			if (i % 4 === 0) {
				this.path(
					(c) => {
						c.moveTo(x, 400);
						c.quadraticCurveTo(x - 2, 389, x + 2, 380);
					},
					null,
					"#829366",
					1.5,
				);
				for (let k = 0; k < 5; k++)
					this.ellipse(
						x + 2 + Math.cos(k * 1.26) * 4,
						379 + Math.sin(k * 1.26) * 4,
						3,
						3,
						theme.accent,
					);
				this.ellipse(x + 2, 379, 2, 2, "#f8e3ac");
			}
			if (i % 13 === 0) this.mushroom(x + 15, 400, 0.6, theme.accent);
		}

		for (const platform of engine.platforms) {
			this.path(
				(c) => c.roundRect(platform.x, platform.y, platform.w, 18, 9),
				"#f5e4bb",
				"#9c8966",
				2,
			);
			this.path(
				(c) => {
					c.moveTo(platform.x + 9, platform.y + 5);
					c.lineTo(platform.x + platform.w - 9, platform.y + 5);
				},
				null,
				"#fffaf0",
				3,
			);
		}

		// The large mushroom disguises the optional secret-room doorway.
		this.mushroom(engine.secret.x + 20, 400, 1.5, "#c895a8");
		this.path(
			(c) => c.roundRect(engine.secret.x + 9, 370, 22, 30, [12, 12, 0, 0]),
			"#8d6f67",
			"#6b5650",
			1.5,
		);
		this.star(engine.secret.x + 38, 357 + Math.sin(time * 2) * 3, 5, "#f4d18a");

		for (const star of engine.stars) {
			if (star.taken) continue;
			const y = star.y + Math.sin(time * 3 + star.x) * 4;
			this.ellipse(star.x, y, 20, 20, "#fff1b940");
			this.star(star.x, y, 13, "#f1cc70");
		}
		for (const enemy of engine.enemies) if (enemy.hp > 0) this.enemy(enemy, time);
		for (const bullet of engine.bullets) {
			if (bullet.friendly) this.star(bullet.x, bullet.y, 7, "#f6d987");
			else {
				this.ellipse(bullet.x, bullet.y, 7, 7, "#d5b6ce", "#92778c", 1.5);
				this.ellipse(bullet.x - 2, bullet.y - 2, 2, 2, "#fff7ef");
			}
		}

		// Gift only opens once stars AND enemies are complete.
		const ready = engine.collected === 19 && engine.remaining === 0;
		this.path((c) => c.roundRect(3190, 349, 58, 51, 5), "#d997ac", "#88646b", 2);
		g.fillStyle = "#f6dda3";
		g.fillRect(3214, 349, 9, 51);
		this.path((c) => c.roundRect(3185, 344, 68, 13, 3), "#e9bac8", "#88646b", 2);
		this.path(
			(c) => {
				c.moveTo(3219, 344);
				c.bezierCurveTo(3180, 310, 3190, 374, 3219, 344);
				c.bezierCurveTo(3258, 310, 3248, 374, 3219, 344);
			},
			null,
			"#ae7d89",
			4,
		);
		g.textAlign = "center";
		g.font = '12px "Nomia Sans", sans-serif';
		g.fillStyle = "#6d5748";
		g.fillText(ready ? "your little gift ♡" : "19 stars + all clouds", 3219, 320);

		this.player(engine.player, time, dark);
		for (const particle of engine.particles) {
			g.globalAlpha = Math.max(0, particle.life / 0.7);
			this.star(particle.x, particle.y, 4, particle.color, false);
		}
		g.globalAlpha = 1;
		g.restore();
		// Fine dotted paper texture ties foreground and background together.
		g.fillStyle = "#80654d08";
		for (let x = 0; x < 960; x += 24)
			for (let y = 0; y < 540; y += 24) g.fillRect(x, y, 1, 1);
	}

	mushroom(x, floor, scale, color) {
		const g = this.ctx;
		g.save();
		g.translate(x, floor);
		g.scale(scale, scale);
		this.path((c) => c.roundRect(-6, -25, 12, 25, 4), "#f6e6c6", "#948270", 1.5);
		this.path(
			(c) => {
				c.moveTo(-21, -22);
				c.quadraticCurveTo(0, -62, 21, -22);
				c.quadraticCurveTo(0, -15, -21, -22);
			},
			color,
			"#826a6d",
			1.5,
		);
		this.ellipse(-6, -30, 4, 3, "#fff0e4");
		this.ellipse(8, -27, 3, 2, "#fff0e4");
		g.restore();
	}

	enemy(enemy, time) {
		const g = this.ctx;
		const cx = enemy.x + 24;
		const cy = enemy.y + 23 + Math.sin(time * 4 + enemy.phase) * 1.5;
		this.ellipse(cx, 401, 23, 4, "#675b4320");
		this.cloud(cx, cy, 0.5, enemy.hurt > 0 ? "#fff6dc" : "#e3d3df", this.ink);
		this.ellipse(cx - 7, cy - 3, 1.5, 2.5, this.ink);
		this.ellipse(cx + 8, cy - 3, 1.5, 2.5, this.ink);
		this.ellipse(cx - 14, cy + 2, 4, 2, "#dda5b8");
		this.ellipse(cx + 15, cy + 2, 4, 2, "#dda5b8");
		this.path(
			(c) => {
				c.moveTo(cx - 4, cy + 5);
				c.quadraticCurveTo(cx, cy + 1, cx + 4, cy + 5);
			},
			null,
			this.ink,
			1.5,
		);
		// A little bubble wand makes incoming shots visible and playful.
		this.path(
			(c) => {
				c.moveTo(cx + 20, cy + 6);
				c.lineTo(cx + 31, cy - 2);
			},
			null,
			this.ink,
			2,
		);
		this.ellipse(cx + 33, cy - 4, 4, 4, "#d0b3cb", this.ink, 1.5);
		for (let i = 0; i < enemy.maxHp; i++)
			this.ellipse(
				cx - (enemy.maxHp - 1) * 4 + i * 8,
				enemy.y - 14,
				2.7,
				2.7,
				i < enemy.hp ? "#bc7e98" : "#fff5e9",
				"#9b7385",
				1,
			);
	}

	player(player, time, dark = false) {
		const g = this.ctx;
		this.ellipse(player.x + 21, 402, 22, 4, "#675b4320");
		if (player.invincible > 0 && Math.floor(time * 12) % 2 === 0) return;
		const bounce =
			player.grounded && Math.abs(player.vx) > 1 ? Math.sin(time * 18) * 2 : 0;
		g.save();
		if (player.dashTime > 0) {
			g.shadowColor = "#f5d27c";
			g.shadowBlur = 16;
		}
		if (dark) {
			g.beginPath();
			g.roundRect(player.x - 8, player.y - 17 + bounce, 58, 72, 24);
			g.clip();
		} else {
			g.globalCompositeOperation = "multiply";
		}
		if (this.sprite.complete && this.sprite.naturalWidth) {
			// Original image pixels: no redrawing or replacement of her character.
			g.drawImage(
				this.sprite,
				180,
				300,
				750,
				900,
				player.x - 8,
				player.y - 17 + bounce,
				58,
				72,
			);
		}
		g.restore();
		const wandX = player.x + 21 + player.facing * 30;
		this.path(
			(c) => {
				c.moveTo(wandX - player.facing * 6, player.y + 40);
				c.lineTo(wandX + player.facing * 6, player.y + 25);
			},
			null,
			"#715952",
			2,
		);
		this.star(wandX + player.facing * 7, player.y + 22, 7, "#eccb7b");
	}
};
