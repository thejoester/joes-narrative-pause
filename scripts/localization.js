/*	=======================================================================
	Dynamic localization helper
	- LT.some.key()         => game.i18n.localize("joes-narrative-pause.some.key")
	- LT.some.key({ a: 1 }) => game.i18n.format(...) with placeholders
======================================================================= */

import { DL } from "./logger.js";

export const LT = makeNode("joes-narrative-pause");

/*	L: localize a key (no placeholders) */
export function L(key) {
	try {
		if (typeof key !== "string") { DL(2, "L(): key must be string", { key }); return String(key); }
		const s = game.i18n.localize(key);
		if (s === key) DL(2, "L(): missing key", { key });
		return s;
	} catch (err) {
		DL(3, "L(): error", err);
		return key;
	}
}

/*	LF: format a key with {placeholders} */
export function LF(key, data = {}) {
	try {
		const out = game.i18n.format(key, data);
		if (out === key) DL(2, "LF(): missing key", { key, data });
		return out;
	} catch (err) {
		DL(3, "LF(): error", err);
		return key;
	}
}

/*	Any property chain becomes a key path under "joes-narrative-pause". */
function makeNode(key) {
	const fn = (data) => (data && typeof data === "object" ? LF(key, data) : L(key));
	return new Proxy(fn, {
		get(_t, prop) {
			if (prop === "prototype" || prop === "name" || prop === "length") return undefined;
			if (prop === "_key") return key;
			return makeNode(key ? key + "." + String(prop) : String(prop));
		}
	});
}
