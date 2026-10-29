/* Shared, optional sound effects. All sounds are synthesized locally. */
window.NomiaSound = (() => {
	let context;
	let enabled = false;
	try {
		enabled = localStorage.getItem("nomia-sound") === "on";
	} catch (_) {}

	function wake() {
		if (!enabled) return;
		try {
			context ||= new (window.AudioContext || window.webkitAudioContext)();
			if (context.state === "suspended") context.resume().catch(() => {});
		} catch (_) {}
	}

	function note(frequency, delay = 0, duration = 0.12, type = "sine") {
		if (!enabled || !context || context.state !== "running") return;
		const oscillator = context.createOscillator();
		const gain = context.createGain();
		const start = context.currentTime + delay;
		oscillator.type = type;
		oscillator.frequency.value = frequency;
		gain.gain.setValueAtTime(0, start);
		gain.gain.linearRampToValueAtTime(0.045, start + 0.01);
		gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
		oscillator.connect(gain);
		gain.connect(context.destination);
		oscillator.start(start);
		oscillator.stop(start + duration);
	}

	function play(name) {
		const melodies = {
			tap: [440],
			jump: [330, 520],
			star: [660, 880],
			shoot: [510],
			hit: [220, 165],
			win: [523, 659, 784, 1047],
			wrong: [330, 294],
			secret: [440, 554, 659, 880],
			pad0: [262],
			pad1: [330],
			pad2: [392],
			pad3: [523],
		};
		(melodies[name] || melodies.tap).forEach((f, i) => note(f, i * 0.09));
	}

	function bind(button) {
		function label() {
			button.textContent = enabled ? "♪ Sound on" : "♪ Sound off";
			button.setAttribute("aria-pressed", String(enabled));
		}
		label();
		button.addEventListener("click", () => {
			enabled = !enabled;
			try {
				localStorage.setItem("nomia-sound", enabled ? "on" : "off");
			} catch (_) {}
			wake();
			label();
			if (enabled) play("star");
		});
	}

	document.addEventListener("pointerdown", wake);
	document.addEventListener("keydown", wake);
	return { play, bind, wake };
})();
