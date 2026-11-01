/*	=======================================================================
	On-screen visuals: the border flash (momentary confirmation cue), the
	persistent top-center banner, and the player block toast. Structure and
	keyframes live in styles/narrative-pause.css; only the dynamic bits
	(tint color, text, duration) are set inline here.
======================================================================= */

import { getSetting } from "./settings.js";

const FLASH_ID = "jnp-flash";
const BANNER_ID = "jnp-banner";
const TOAST_ID = "jnp-toast";

let _toastTimer = null;

/*	Apply the persistent visuals for a state change. The border glow stays up
	(pulsing opacity) the whole time narrative mode is on. */
export function applyNarrativeUI(active) {
	if (active) {
		showBorder();
		showBanner();
	} else {
		hideBorder();
		hideBanner();
	}
}

/*	Persistent inset glow that pulses while narrative mode is on. GM only unless
	tintAllClients is on. */
function showBorder() {
	if (!getSetting("borderEnabled", true)) return;
	if (!game.user.isGM && !getSetting("tintAllClients", false)) return;
	const color = getSetting("tintColor", "#ff0000");

	let el = document.getElementById(FLASH_ID);
	if (!el) {
		el = document.createElement("div");
		el.id = FLASH_ID;
		el.className = "jnp-flash";
		document.body.appendChild(el);
	}
	el.style.boxShadow = `inset 0 0 140px 28px ${color}`;
}

/*	Remove the border glow. */
function hideBorder() {
	document.getElementById(FLASH_ID)?.remove();
}

/*	Persistent top-center banner while narrative mode is on. Shown to the GM
	always, and to players when showBannerToPlayers is on. */
function showBanner() {
	if (!game.user.isGM && !getSetting("showBannerToPlayers", false)) return;
	const text = getSetting("bannerText", "Narrative Mode");

	let el = document.getElementById(BANNER_ID);
	if (!el) {
		el = document.createElement("div");
		el.id = BANNER_ID;
		el.className = "jnp-banner";
		document.body.appendChild(el);
	}
	el.textContent = text;
}

/*	Remove the banner. */
function hideBanner() {
	document.getElementById(BANNER_ID)?.remove();
}

/*	Top-third toast shown to a player whose move was blocked. Debounced: a drag
	fires repeatedly, so reuse one element and restart its fade rather than
	stacking copies. */
export function showBlockToast() {
	const dur = Number(getSetting("toastDuration", 5)) || 5;
	const msg = getSetting("blockMessage", "No Walking, GM Talking!");

	let el = document.getElementById(TOAST_ID);
	if (!el) {
		el = document.createElement("div");
		el.id = TOAST_ID;
		el.className = "jnp-toast";
		document.body.appendChild(el);
	}
	el.textContent = msg;

	// Restart the fade from the top.
	el.style.setProperty("--jnp-toast-dur", `${dur}s`);
	el.classList.remove("jnp-toast-show");
	void el.offsetWidth;		// force reflow so the animation replays
	el.classList.add("jnp-toast-show");

	clearTimeout(_toastTimer);
	_toastTimer = setTimeout(() => { el.remove(); _toastTimer = null; }, dur * 1000 + 250);
}

/*	Tear everything down (e.g. on disable). */
export function clearAllUI() {
	document.getElementById(FLASH_ID)?.remove();
	document.getElementById(BANNER_ID)?.remove();
	document.getElementById(TOAST_ID)?.remove();
	clearTimeout(_toastTimer);
	_toastTimer = null;
}
