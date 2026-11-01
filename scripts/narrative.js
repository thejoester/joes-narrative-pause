/*	=======================================================================
	Narrative Mode state.

	An independent on/off flag, not tied to game.paused. The GM owns it:
	toggling persists the world-scope setting (GM only), broadcasts over the
	socket, and applies the visuals locally. Players receive the broadcast and
	restore from the persisted setting on load, they never write it (avoids the
	non-GM world-write permission error).
======================================================================= */

import { MOD_ID, DL } from "./logger.js";
import { getSetting } from "./settings.js";
import { applyNarrativeUI } from "./ui.js";
import { LT } from "./localization.js";

const CHANNEL = `module.${MOD_ID}`;
let _active = false;		// client-cached state, read by the movement veto

/*	Current narrative-mode state on this client. */
export function isNarrativeActive() {
	return _active;
}

/*	Apply state on this client: cache it and update the visuals. */
function applyLocal(active) {
	_active = !!active;
	applyNarrativeUI(_active);
	// Keep the scene-control toggle button in sync with the new state.
	try { ui.controls?.render?.(); } catch (e) { DL(2, "applyLocal(): controls render failed", e); }
	DL(`applyLocal(): narrative mode ${_active ? "ON" : "OFF"}`);
}

/*	GM: set narrative mode on/off. Persists, optionally drives the real pause,
	broadcasts to all clients, and applies locally. No-op for players. */
export async function setActive(active) {
	if (!game.user.isGM) {
		ui.notifications?.warn(LT.notify.gmOnly());
		return;
	}
	const next = !!active;
	try { await game.settings.set(MOD_ID, "narrativeActive", next); }
	catch (e) { DL(3, "setActive(): persist failed", e); }

	if (getSetting("alsoPauseGame", false)) {
		try { game.togglePause(next, { broadcast: true }); }
		catch (e) { DL(2, "setActive(): togglePause failed", e); }
	}

	try { game.socket.emit(CHANNEL, { cmd: "set", active: next }); }
	catch (e) { DL(3, "setActive(): emit failed", e); }

	applyLocal(next);
}

/*	GM: flip narrative mode. */
export async function toggle() {
	return setActive(!_active);
}

/*	Receive GM broadcasts and apply them locally. */
function registerSocket() {
	game.socket.on(CHANNEL, (msg) => {
		try {
			if (msg?.cmd !== "set") return;
			applyLocal(!!msg.active);
		} catch (e) {
			DL(3, "socket handler error", e);
		}
	});
	DL(`registerSocket(): listening on ${CHANNEL}`);
}

/*	Called from the ready hook on every client: listen and restore state. */
export function initNarrative() {
	registerSocket();
	applyLocal(!!getSetting("narrativeActive", false));
}

/*	GM keybind to toggle narrative mode. Default Shift+Space (verify it does not
	collide with Foundry's pan/measure in testing). */
Hooks.once("init", () => {
	game.keybindings.register(MOD_ID, "toggleNarrative", {
		name: "joes-narrative-pause.keybind.toggleName",
		hint: "joes-narrative-pause.keybind.toggleHint",
		editable: [{ key: "Space", modifiers: ["Shift"] }],
		onDown: () => { if (game.user.isGM) toggle(); return true; },
		restricted: true
	});
});
