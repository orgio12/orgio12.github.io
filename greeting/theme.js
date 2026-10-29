/* Two complete themes. The choice follows her between the page and the game. */
(() => {
	let theme = "light";
	try {
		theme = localStorage.getItem("nomia-theme") === "dark" ? "dark" : "light";
	} catch (_) {}
	function apply() {
		document.documentElement.dataset.theme = theme;
		const button = document.getElementById("theme-toggle");
		if (button) {
			button.textContent = theme === "dark" ? "☀ Light pink" : "☾ Dark tech";
			button.setAttribute("aria-pressed", String(theme === "dark"));
		}
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta) meta.content = theme === "dark" ? "#101522" : "#fff4f2";
	}
	apply();
	document.addEventListener("DOMContentLoaded", () => {
		apply();
		document.getElementById("theme-toggle")?.addEventListener("click", () => {
			theme = theme === "dark" ? "light" : "dark";
			try {
				localStorage.setItem("nomia-theme", theme);
			} catch (_) {}
			apply();
		});
	});
})();
