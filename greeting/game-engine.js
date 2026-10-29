/* GAME RULES AND PHYSICS — independent of the DOM and drawing code. */
(function (root) {
	"use strict";

	const FLOOR = 400;
	const WORLD_WIDTH = 3300;
	const VIEW_WIDTH = 960;

	class Adventure {
		constructor(levels) {
			this.levels = levels;
			this.events = [];
			this.secretVisited = false;
			this.loadLevel(0);
		}

		loadLevel(index, saved = null) {
			this.level = index;
			this.theme = this.levels[index];
			this.mode = "playing";
			this.time = 0;
			this.camera = 0;
			this.checkpoint = saved?.checkpoint || 65;
			this.secretVisited = saved?.secretVisited || false;
			this.player = {
				x: this.checkpoint,
				y: FLOOR - 55,
				w: 42,
				h: 55,
				vx: 0,
				vy: 0,
				hp: 5,
				jumps: 0,
				grounded: true,
				invincible: 0,
				dashTime: 0,
				dashCooldown: 0,
				shootCooldown: 0,
				facing: 1,
			};
			this.stars = [];
			this.platforms = [];
			this.enemies = [];
			this.bullets = [];
			this.particles = [];
			this.secret = { x: 1130, y: 332 };
			this.nearSecret = false;
			this.events = [];

			for (let i = 0; i < 19; i++) {
				const x = 180 + i * 155;
				const raised = i % 3 !== 0;
				const platformY = i % 3 === 1 ? 300 - this.theme.platformOffset : 230;
				this.stars.push({
					x,
					y: raised ? platformY - 30 : FLOOR - 35,
					taken: Boolean(saved?.stars?.[i]),
				});
				if (raised) this.platforms.push({ x: x - 58, y: platformY, w: 125, h: 18 });
			}

			for (let i = 0; i < this.theme.enemyCount; i++) {
				const base = 540 + i * (2350 / this.theme.enemyCount);
				this.enemies.push({
					x: base,
					base,
					y: FLOOR - 38,
					w: 48,
					h: 38,
					hp: saved?.enemies?.[i] ?? this.theme.enemyHealth,
					maxHp: this.theme.enemyHealth,
					phase: i * 1.7,
					hurt: 0,
					fireClock: this.theme.fireInterval + i * 0.4,
				});
			}
		}

		get collected() {
			return this.stars.filter((star) => star.taken).length;
		}
		get remaining() {
			return this.enemies.filter((enemy) => enemy.hp > 0).length;
		}

		emit(type, value = "") {
			this.events.push({ type, value });
		}

		burst(x, y, color, count = 10) {
			for (let i = 0; i < count; i++) {
				this.particles.push({
					x,
					y,
					color,
					life: 0.7,
					vx: (Math.random() - 0.5) * 140,
					vy: -Math.random() * 140,
				});
			}
		}

		jump() {
			const p = this.player;
			if (this.mode !== "playing" || p.jumps >= 2) return;
			p.vy = p.jumps === 0 ? -465 : -420;
			p.jumps++;
			p.grounded = false;
			this.burst(p.x + 20, p.y + 55, "#fff7df", 6);
			this.emit("sound", "jump");
		}

		dash() {
			const p = this.player;
			if (this.mode !== "playing" || p.dashCooldown > 0) return;
			p.dashTime = 0.23;
			p.dashCooldown = 2;
			p.invincible = Math.max(p.invincible, 0.32);
			this.burst(p.x + 20, p.y + 25, "#e5b652");
		}

		shoot() {
			const p = this.player;
			if (this.mode !== "playing" || p.shootCooldown > 0) return;
			p.shootCooldown = 0.27;
			const origin = { x: p.x + 21, y: p.y + 30 };
			const targets = this.enemies.filter((e) => e.hp > 0 && Math.abs(e.x - p.x) < 640);
			targets.sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x));
			const target = targets[0];
			let dx = p.facing;
			let dy = 0;
			if (target) {
				dx = target.x + 24 - origin.x;
				dy = target.y + 19 - origin.y;
				const length = Math.hypot(dx, dy) || 1;
				dx /= length;
				dy /= length;
				p.facing = dx < 0 ? -1 : 1;
			}
			this.bullets.push({
				...origin,
				vx: dx * 560,
				vy: dy * 560,
				friendly: true,
				life: 1.5,
			});
			this.emit("sound", "shoot");
		}

		hurtPlayer() {
			const p = this.player;
			if (p.invincible > 0 || this.mode !== "playing") return;
			p.hp--;
			p.invincible = 1.6;
			p.vy = -190;
			this.burst(p.x + 20, p.y + 25, "#d592a4");
			this.emit("sound", "hit");
			if (p.hp <= 0) {
				this.mode = "lost";
				this.emit("lost");
			}
		}

		retry() {
			const p = this.player;
			p.hp = 5;
			p.x = this.checkpoint;
			p.y = FLOOR - p.h;
			p.vy = 0;
			p.jumps = 0;
			p.invincible = 2;
			this.bullets = [];
			this.mode = "playing";
		}

		openSecret() {
			if (!this.nearSecret || this.mode !== "playing") return false;
			this.mode = "secret";
			this.emit("sound", "secret");
			return true;
		}

		claimSecret() {
			if (this.secretVisited) return;
			this.secretVisited = true;
			this.player.hp = 5;
			this.emit("sound", "win");
			this.emit("save");
		}

		snapshot() {
			return {
				version: 2,
				level: this.level,
				checkpoint: this.checkpoint,
				stars: this.stars.map((s) => s.taken),
				enemies: this.enemies.map((e) => e.hp),
				secretVisited: this.secretVisited,
			};
		}

		update(dt, input) {
			if (this.mode !== "playing") return;
			this.time += dt;
			const p = this.player;
			p.invincible = Math.max(0, p.invincible - dt);
			p.dashTime = Math.max(0, p.dashTime - dt);
			p.dashCooldown = Math.max(0, p.dashCooldown - dt);
			p.shootCooldown = Math.max(0, p.shootCooldown - dt);
			const direction = Number(Boolean(input.right)) - Number(Boolean(input.left));
			if (direction) p.facing = direction;
			if (input.shoot) this.shoot();
			p.vx = p.dashTime > 0 ? p.facing * 590 : direction * 220;
			p.x = Math.max(0, Math.min(WORLD_WIDTH - p.w, p.x + p.vx * dt));
			const oldBottom = p.y + p.h;
			p.vy += 1120 * dt;
			p.y += p.vy * dt;
			p.grounded = false;

			if (p.y + p.h >= FLOOR) {
				p.y = FLOOR - p.h;
				p.vy = 0;
				p.grounded = true;
				p.jumps = 0;
			}
			for (const platform of this.platforms) {
				if (
					p.vy >= 0 &&
					oldBottom <= platform.y + 2 &&
					p.y + p.h >= platform.y &&
					p.x + p.w > platform.x &&
					p.x < platform.x + platform.w
				) {
					p.y = platform.y - p.h;
					p.vy = 0;
					p.grounded = true;
					p.jumps = 0;
				}
			}

			if (p.x > this.checkpoint + 800) {
				this.checkpoint = p.x;
				this.emit("toast", "Checkpoint ♡");
				this.emit("save");
			}

			for (const star of this.stars) {
				if (!star.taken && Math.hypot(p.x + 21 - star.x, p.y + 27 - star.y) < 38) {
					star.taken = true;
					this.burst(star.x, star.y, "#e4b348", 12);
					this.emit("sound", "star");
					this.emit("save");
				}
			}

			this.updateEnemies(dt);
			this.updateBullets(dt);
			this.camera = Math.max(0, Math.min(WORLD_WIDTH - VIEW_WIDTH, p.x - 310));
			this.nearSecret = Math.hypot(p.x - this.secret.x, p.y - this.secret.y) < 85;
			for (const particle of this.particles) {
				particle.x += particle.vx * dt;
				particle.y += particle.vy * dt;
				particle.vy += 240 * dt;
				particle.life -= dt;
			}
			this.particles = this.particles.filter((p) => p.life > 0);

			if (p.x > 3140 && this.mode === "playing") {
				if (this.collected === 19 && this.remaining === 0) {
					this.mode = "complete";
					this.emit("sound", "win");
					this.emit("complete");
				}
			}
		}

		updateEnemies(dt) {
			const p = this.player;
			for (const enemy of this.enemies) {
				if (enemy.hp <= 0) continue;
				enemy.x =
					enemy.base + Math.sin(this.time * this.theme.enemySpeed + enemy.phase) * 55;
				enemy.hurt = Math.max(0, enemy.hurt - dt);
				if (
					p.x + p.w > enemy.x &&
					p.x < enemy.x + enemy.w &&
					p.y + p.h > enemy.y &&
					p.y < enemy.y + enemy.h
				)
					this.hurtPlayer();
				if (Math.abs(enemy.x - p.x) > 650) continue;
				enemy.fireClock -= dt;
				if (enemy.fireClock <= 0) {
					enemy.fireClock = this.theme.fireInterval;
					const dx = p.x + 21 - (enemy.x + 24);
					const dy = p.y + 30 - (enemy.y + 20);
					const length = Math.hypot(dx, dy) || 1;
					this.bullets.push({
						x: enemy.x + 24,
						y: enemy.y + 20,
						vx: (dx / length) * this.theme.bulletSpeed,
						vy: (dy / length) * this.theme.bulletSpeed,
						friendly: false,
						life: 5,
					});
				}
			}
		}

		updateBullets(dt) {
			for (const bullet of this.bullets) {
				bullet.x += bullet.vx * dt;
				bullet.y += bullet.vy * dt;
				bullet.life -= dt;
				if (bullet.life <= 0) continue;
				if (bullet.friendly) {
					for (const enemy of this.enemies) {
						if (enemy.hp <= 0) continue;
						if (
							bullet.x > enemy.x - 7 &&
							bullet.x < enemy.x + enemy.w + 7 &&
							bullet.y > enemy.y - 7 &&
							bullet.y < enemy.y + enemy.h + 7
						) {
							enemy.hp--;
							enemy.hurt = 0.16;
							bullet.life = 0;
							this.burst(bullet.x, bullet.y, enemy.hp ? "#d6c4da" : "#f7d8e0", 8);
							this.emit("sound", enemy.hp ? "tap" : "star");
							this.emit("save");
							break;
						}
					}
				} else {
					const p = this.player;
					if (
						bullet.x > p.x - 5 &&
						bullet.x < p.x + p.w + 5 &&
						bullet.y > p.y - 5 &&
						bullet.y < p.y + p.h + 5
					) {
						bullet.life = 0;
						this.hurtPlayer();
					}
				}
			}
			this.bullets = this.bullets.filter((b) => b.life > 0);
		}
	}

	root.NomiaAdventure = Adventure;
})(typeof window === "undefined" ? globalThis : window);
