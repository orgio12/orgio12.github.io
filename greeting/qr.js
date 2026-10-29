(function () {
	"use strict";
	function start() {
		const $ = (s) => document.getElementById(s),
			SVG_NS = "http://www.w3.org/2000/svg";
		let current = "";
		function generate(url) {
			try {
				const parsed = new URL(url);
				if (!["https:", "http:"].includes(parsed.protocol))
					throw Error("Use an http or https website link.");
				if (["localhost", "127.0.0.1"].includes(parsed.hostname))
					throw Error("Do not print a localhost address. Publish the website first.");
				const qr = new window.QRLocal(0, 2);
				qr.addData(parsed.href);
				qr.make();
				const size = qr.getModuleCount(),
					margin = 4;
				const svg = document.createElementNS(SVG_NS, "svg");
				svg.setAttribute("viewBox", `0 0 ${size + margin * 2} ${size + margin * 2}`);
				svg.setAttribute("role", "img");
				svg.setAttribute("aria-label", "QR code linking to Nomia birthday website");
				svg.setAttribute("shape-rendering", "crispEdges");
				svg.style.background = "#fff";
				for (let y = 0; y < size; y++)
					for (let x = 0; x < size; x++)
						if (qr.isDark(y, x)) {
							const r = document.createElementNS(SVG_NS, "rect");
							r.setAttribute("x", String(x + margin));
							r.setAttribute("y", String(y + margin));
							r.setAttribute("width", "1");
							r.setAttribute("height", "1");
							r.setAttribute("fill", "#151515");
							svg.append(r);
						}
				$("qr").replaceChildren(svg);
				current = parsed.href;
				$("status").textContent = "QR ready. Scan with a phone before printing.";
				return true;
			} catch (e) {
				$("status").textContent = "QR not ready: " + e.message;
				current = "";
				return false;
			}
		}
		function png() {
			if (!current) {
				$("status").textContent = "Generate a QR first.";
				return;
			}
			const svg = $("qr").querySelector("svg"),
				data = new XMLSerializer().serializeToString(svg);
			const xml = new Blob([data], { type: "image/svg+xml;charset=utf-8" }),
				url = URL.createObjectURL(xml);
			const im = new Image();
			im.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = 900;
				canvas.height = 900;
				const ctx = canvas.getContext("2d");
				ctx.fillStyle = "#fff";
				ctx.fillRect(0, 0, 900, 900);
				ctx.imageSmoothingEnabled = false;
				ctx.drawImage(im, 0, 0, 900, 900);
				URL.revokeObjectURL(url);
				const a = document.createElement("a");
				a.download = "nomia-birthday-qr.png";
				a.href = canvas.toDataURL("image/png");
				a.click();
			};
			im.src = url;
		}
		$("generate").addEventListener("click", () => generate($("url").value.trim()));
		$("url").addEventListener("keydown", (e) => {
			if (e.key === "Enter") generate($("url").value.trim());
		});
		$("download").addEventListener("click", png);
		$("print").addEventListener("click", () => {
			if (!current) {
				$("status").textContent = "Generate a valid QR first.";
				return;
			}
			window.print();
		});
	}
	if (document.readyState === "loading")
		document.addEventListener("DOMContentLoaded", start);
	else start();
})();
