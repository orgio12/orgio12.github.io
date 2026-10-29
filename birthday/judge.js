
/* Small deterministic interpreter for the documented C++ subset. */

(function(root) {
	'use strict';

	function compile(src) {
		if (src.length > 12000) {
			throw Error('Code is too long.');
		}

		src = src
			.replace(/\/\*[\s\S]*?\*\//g, '')
			.replace(/\/\/[^\n]*/g, '');

		const t = [];
		let at = 0;

		const re = /\s*(\+\+|--|\+=|-=|\*=|\/=|==|!=|<=|>=|&&|\|\||[A-Za-z_]\w*|\d+|'[^'\n]'|[{}()[\];.,+\-*\/%<>=!?:])/y;

		while (at < src.length) {
			if (!src.slice(at).trim()) {
				break;
			}

			re.lastIndex = at;

			let m = re.exec(src);

			if (!m) {
				throw Error(
					'Unsupported syntax near: ' + src.slice(at, at + 18)
				);
			}

			t.push(m[1]);
			at = re.lastIndex;
		}

		let pos = 0;

		const peek = () => t[pos];

		const take = x => {
			if (peek() === x) {
				pos++;
				return true;
			}

			return false;
		};

		const need = x => {
			if (!take(x)) {
				throw Error(
					'Expected ' + x + ', found ' + (peek() || 'end of code')
				);
			}
		};

		const id = () => {
			let v = t[pos++];

			if (!/^[a-zA-Z_]\w*$/.test(v || '')) {
				throw Error('Expected a variable name');
			}

			return v;
		};

		const prec = {
			'||': 1,
			'&&': 2,
			'==': 3,
			'!=': 3,
			'<': 4,
			'>': 4,
			'<=': 4,
			'>=': 4,
			'+': 5,
			'-': 5,
			'*': 6,
			'/': 6,
			'%': 6
		};


		function expr(min = 0) {
			let a;

			if (['!', '-', '+', '++', '--'].includes(peek())) {
				const op = t[pos++];

				a = {
					k: 'un',
					op,
					a: expr(7)
				};
			} else if (take('(')) {
				a = expr();
				need(')');
			} else {
				let v = t[pos++];

				if (/^\d+$/.test(v || '')) {
					a = {
						k: 'lit',
						v: +v
					};
				} else if (/^'.'$/.test(v || '')) {
					a = {
						k: 'lit',
						v: v.charCodeAt(1)
					};
				} else if (v === 'true' || v === 'false') {
					a = {
						k: 'lit',
						v: v === 'true' ? 1 : 0
					};
				} else if (/^[A-Za-z_]\w*$/.test(v || '')) {
					a = {
						k: 'var',
						v
					};
				} else {
					throw Error('Expected an expression');
				}
			}

			while (true) {
				if (take('[')) {
					let ix = expr();

					need(']');

					a = {
						k: 'index',
						a,
						ix
					};
				} else if (take('.')) {
					let v = id();

					if (!['size', 'length'].includes(v)) {
						throw Error(
							'Only size() and length() are supported'
						);
					}

					need('(');
					need(')');

					a = {
						k: 'size',
						a
					};
				} else if (['++', '--'].includes(peek())) {
					a = {
						k: 'post',
						op: t[pos++],
						a
					};
				} else {
					break;
				}
			}

			while (
				prec[peek()] !== undefined &&
				prec[peek()] >= min
			) {
				let op = t[pos++];
				let b = expr(prec[op] + 1);

				a = {
					k: 'bin',
					op,
					a,
					b
				};
			}

			return a;
		}


		function simple() {
			if (['int', 'bool', 'char'].includes(peek())) {
				let type = t[pos++];
				let items = [];

				do {
					let name = id();
					let v = take('=')
						? expr()
						: { k: 'lit', v: 0 };

					items.push({
						name,
						v
					});
				} while (take(','));

				return {
					k: 'decl',
					items,
					type
				};
			}

			let a = expr();

			if (['=', '+=', '-=', '*=', '/='].includes(peek())) {
				return {
					k: 'assign',
					a,
					op: t[pos++],
					b: expr()
				};
			}

			return {
				k: 'expr',
				a
			};
		}


		function stmt() {
			if (take('{')) {
				let body = [];

				while (!take('}')) {
					if (pos >= t.length) {
						throw Error('Missing }');
					}

					body.push(stmt());
				}

				return {
					k: 'block',
					body
				};
			}

			if (take('if')) {
				need('(');

				let c = expr();

				need(')');

				let yes = stmt();
				let no = take('else') ? stmt() : null;

				return {
					k: 'if',
					c,
					yes,
					no
				};
			}

			if (take('while')) {
				need('(');

				let c = expr();

				need(')');

				return {
					k: 'while',
					c,
					body: stmt()
				};
			}

			if (take('for')) {
				need('(');

				let init = peek() === ';' ? null : simple();

				need(';');

				let c = peek() === ';'
					? { k: 'lit', v: 1 }
					: expr();

				need(';');

				let step = peek() === ')' ? null : simple();

				need(')');

				return {
					k: 'for',
					init,
					c,
					step,
					body: stmt()
				};
			}

			if (take('return')) {
				let a = expr();

				need(';');

				return {
					k: 'return',
					a
				};
			}

			if (take('break')) {
				need(';');

				return {
					k: 'break'
				};
			}

			if (take('continue')) {
				need(';');

				return {
					k: 'continue'
				};
			}

			if (take(';')) {
				return {
					k: 'block',
					body: []
				};
			}

			let a = simple();

			need(';');

			return a;
		}


		let body = [];

		while (pos < t.length) {
			body.push(stmt());
		}

		return {
			k: 'block',
			body
		};
	}


	function run(ast, s) {
		const scopes = [
			{
				s,
				n: s.length
			}
		];

		let fuel = 100000;

		const tick = () => {
			if (--fuel < 0) {
				throw Error('TLE');
			}
		};

		const scope = name => {
			for (let i = scopes.length - 1; i >= 0; i--) {
				if (Object.hasOwn(scopes[i], name)) {
					return scopes[i];
				}
			}

			throw Error('Unknown variable: ' + name);
		};

		const set = (a, v) => {
			if (
				a.k !== 'var' ||
				a.v === 's' ||
				a.v === 'n'
			) {
				throw Error('Invalid assignment');
			}

			scope(a.v)[a.v] = Math.trunc(v);

			return Math.trunc(v);
		};


		function ev(a) {
			tick();

			switch (a.k) {
				case 'lit':
					return a.v;

				case 'var':
					return scope(a.v)[a.v];

				case 'size': {
					let v = ev(a.a);

					if (typeof v !== 'string') {
						throw Error('size() requires a string');
					}

					return v.length;
				}

				case 'index': {
					let v = ev(a.a);
					let i = ev(a.ix);

					if (
						typeof v !== 'string' ||
						i < 0 ||
						i > v.length ||
						!Number.isInteger(i)
					) {
						throw Error('Index out of range');
					}

					return i === v.length ? 0 : v.charCodeAt(i);
				}

				case 'un': {
					let v = ev(a.a);

					if (a.op === '!') {
						return +!v;
					}

					if (a.op === '-') {
						return -v;
					}

					if (a.op === '+') {
						return +v;
					}

					return set(
						a.a,
						v + (a.op === '++' ? 1 : -1)
					);
				}

				case 'post': {
					let v = ev(a.a);

					set(
						a.a,
						v + (a.op === '++' ? 1 : -1)
					);

					return v;
				}

				case 'bin': {
					let x = ev(a.a);

					if (a.op === '&&') {
						return +(!!x && !!ev(a.b));
					}

					if (a.op === '||') {
						return +(!!x || !!ev(a.b));
					}

					let y = ev(a.b);

					switch (a.op) {
						case '+':
							return x + y;

						case '-':
							return x - y;

						case '*':
							return x * y;

						case '/':
							if (!y) {
								throw Error('Division by zero');
							}

							return Math.trunc(x / y);

						case '%':
							if (!y) {
								throw Error('Division by zero');
							}

							return x % y;

						case '==':
							return +(x === y);

						case '!=':
							return +(x !== y);

						case '<':
							return +(x < y);

						case '>':
							return +(x > y);

						case '<=':
							return +(x <= y);

						case '>=':
							return +(x >= y);
					}
				}
			}

			throw Error('Invalid expression');
		}


		function exec(a) {
			if (!a) return;

			tick();

			switch (a.k) {
				case 'block':
					scopes.push({});

					try {
						for (const b of a.body) {
							let r = exec(b);

							if (r) {
								return r;
							}
						}
					} finally {
						scopes.pop();
					}

					break;

				case 'decl':
					for (let x of a.items) {
						if (Object.hasOwn(scopes.at(-1), x.name)) {
							throw Error(
								'Duplicate variable: ' + x.name
							);
						}

						let v = ev(x.v);

						scopes.at(-1)[x.name] =
							a.type === 'bool'
								? +!!v
								: Math.trunc(v);
					}

					break;

				case 'expr':
					ev(a.a);
					break;

				case 'assign': {
					let b = ev(a.b);

					if (a.op === '=') {
						set(a.a, b);
					} else {
						let v = ev(a.a);

						if (a.op === '/=' && !b) {
							throw Error('Division by zero');
						}

						set(
							a.a,
							a.op === '+=' ? v + b
							: a.op === '-=' ? v - b
							: a.op === '*=' ? v * b
							: v / b
						);
					}

					break;
				}

				case 'if':
					return exec(ev(a.c) ? a.yes : a.no);

				case 'while':
				case 'for':
					scopes.push({});

					try {
						exec(a.init);

						while (ev(a.c)) {
							let r = exec(a.body);

							if (r?.k === 'return') {
								return r;
							}

							if (r?.k === 'break') {
								break;
							}

							exec(a.step);
						}
					} finally {
						scopes.pop();
					}

					break;

				case 'return':
					return {
						k: 'return',
						v: ev(a.a)
					};

				case 'break':
				case 'continue':
					return {
						k: a.k
					};
			}
		}


		let r = exec(ast);

		if (r?.k !== 'return') {
			throw Error('Missing return value');
		}

		return r.v;
	}


	function judge(src) {
		let ast;

		try {
			ast = compile(src);
		} catch (e) {
			return {
				status: 'CE',
				message: e.message
			};
		}

		const tests = [
			'WWAWWWAWA',
			'A',
			'W',
			'AW',
			'WA',
			'WW',
			'AAAA',
			'WWWW'
		];

		for (let n = 1; n <= 9; n++) {
			for (let m = 0; m < 2 ** n; m++) {
				tests.push(
					Array.from(
						{ length: n },
						(_, i) => m >> i & 1 ? 'W' : 'A'
					).join('')
				);
			}
		}

		tests.push(
			'W'.repeat(1000),
			'A'.repeat(1000),
			'AW'.repeat(500)
		);

		for (let i = 0; i < tests.length; i++) {
			let got;

			try {
				got = run(ast, tests[i]);
			} catch (e) {
				return {
					status: e.message === 'TLE' ? 'TLE' : 'RE',
					message: e.message,
					test: i + 1
				};
			}

			let expected = (
				tests[i].match(/W+/g) || []
			).length;

			if (got !== expected) {
				return {
					status: 'WA',
					test: i + 1,
					got,
					expected
				};
			}
		}

		return {
			status: 'AC',
			checked: tests.length
		};
	}


	root.NomyaJudge = {
		compile,
		run,
		judge
	};

})(typeof window === 'undefined' ? globalThis : window);
