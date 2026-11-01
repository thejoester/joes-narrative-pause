/*	=======================================================================
	Joe's Narrative Pause.

	Narrative Mode is an independent on/off flag, not tied to game.paused. The
	GM owns it: toggling persists the world-scope setting (GM only), broadcasts
	over the socket, and applies the visuals locally. Players receive the
	broadcast and restore from the persisted setting on load, they never write
	it (avoids the non-GM world-write permission error).

	Movement is blocked in the preMoveToken pipeline (present in v13 and v14):
	a non-GM token move is cancelled on that player's own client while the mode
	is on. The GM moves freely.
======================================================================= */

import { MOD_ID, DL, getSetting } from "./logger.js";
import { applyNarrativeUI, showBlockToast } from "./ui.js";

const CHANNEL = `module.${MOD_ID}`;
let _active = false;		// client-cached state, read by the movement veto

/*	=======================================================================
	State
======================================================================= */

/*	Current narrative-mode state on this client. */
function isNarrativeActive() {
	return _active;
}

/*	Apply state on this client: cache it, update the visuals, sync the button. */
function applyLocal(active) {
	_active = !!active;
	applyNarrativeUI(_active);
	try { ui.controls?.render?.(); } catch (e) { DL(2, "applyLocal(): controls render failed", e); }
	DL(`applyLocal(): narrative mode ${_active ? "ON" : "OFF"}`);
}

/*	GM: set narrative mode on/off. Persists, optionally drives the real pause,
	broadcasts to all clients, and applies locally. No-op for players. */
async function setActive(active) {
	if (!game.user.isGM) {
		ui.notifications?.warn(game.i18n.localize("joes-narrative-pause.notify.gmOnly"));
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
async function toggle() {
	return setActive(!_active);
}

/*	=======================================================================
	Movement veto
======================================================================= */

Hooks.on("preMoveToken", (tokenDoc) => {
	try {
		if (game.user.isGM) return true;		// GM is never blocked
		if (!_active) return true;				// narrative mode off
		DL(`preMoveToken: blocked move of "${tokenDoc?.name}"`);
		showBlockToast();
		return false;							// cancel the move
	} catch (e) {
		DL(3, "preMoveToken: error", e);
		return true;							// never trap a token on a bug
	}
});

/*	=======================================================================
	Settings + keybind (init)
======================================================================= */

Hooks.once("init", () => {
	const reg = (key, data) => game.settings.register(MOD_ID, key, data);

	// Persisted on/off state. Hidden; the GM toggles it via keybind/button/API.
	reg("narrativeActive", {
		scope: "world", config: false, type: Boolean, default: false
	});

	// Master toggle for the pulsing border glow.
	reg("borderEnabled", {
		name: "joes-narrative-pause.settings.borderEnabledName",
		hint: "joes-narrative-pause.settings.borderEnabledHint",
		scope: "world", config: true, type: Boolean, default: true, requiresReload: false
	});

	// Border glow color (rendered as a native color picker via ColorField).
	reg("tintColor", {
		name: "joes-narrative-pause.settings.tintColorName",
		hint: "joes-narrative-pause.settings.tintColorHint",
		scope: "world", config: true, requiresReload: false,
		type: new foundry.data.fields.ColorField({ required: true, nullable: false, initial: "#ff0000" }),
		default: "#ff0000"
	});

	// Persistent top-center banner text while narrative mode is on.
	reg("bannerText", {
		name: "joes-narrative-pause.settings.bannerTextName",
		hint: "joes-narrative-pause.settings.bannerTextHint",
		scope: "world", config: true, type: String, default: "Narrative Mode", requiresReload: false
	});

	// Message shown to a player whose move was blocked.
	reg("blockMessage", {
		name: "joes-narrative-pause.settings.blockMessageName",
		hint: "joes-narrative-pause.settings.blockMessageHint",
		scope: "world", config: true, type: String, default: "No Walking, GM Talking!", requiresReload: false
	});

	// Seconds the block toast stays up before it finishes fading.
	reg("toastDuration", {
		name: "joes-narrative-pause.settings.toastDurationName",
		hint: "joes-narrative-pause.settings.toastDurationHint",
		scope: "world", config: true, type: Number, default: 5, requiresReload: false,
		range: { min: 1, max: 20, step: 1 }
	});

	// Whether players also see the top-center banner.
	reg("showBannerToPlayers", {
		name: "joes-narrative-pause.settings.showBannerToPlayersName",
		hint: "joes-narrative-pause.settings.showBannerToPlayersHint",
		scope: "world", config: true, type: Boolean, default: false, requiresReload: false
	});

	// Whether the border glow shows on every screen, or GM only.
	reg("tintAllClients", {
		name: "joes-narrative-pause.settings.tintAllClientsName",
		hint: "joes-narrative-pause.settings.tintAllClientsHint",
		scope: "world", config: true, type: Boolean, default: false, requiresReload: false
	});

	// Also drive Foundry's real pause when narrative mode toggles.
	reg("alsoPauseGame", {
		name: "joes-narrative-pause.settings.alsoPauseGameName",
		hint: "joes-narrative-pause.settings.alsoPauseGameHint",
		scope: "world", config: true, type: Boolean, default: false, requiresReload: false
	});

	reg("debugLevel", {
		name: "joes-narrative-pause.settings.debugLevelName",
		hint: "joes-narrative-pause.settings.debugLevelHint",
		scope: "world", config: true, type: String,
		choices: {
			none: "joes-narrative-pause.settings.debugLevelNone",
			error: "joes-narrative-pause.settings.debugLevelError",
			warn: "joes-narrative-pause.settings.debugLevelWarn",
			all: "joes-narrative-pause.settings.debugLevelAll"
		},
		default: "none", requiresReload: false
	});

	// GM keybind. Default Shift+Space (verify it does not collide with
	// Foundry's pan/measure in testing).
	game.keybindings.register(MOD_ID, "toggleNarrative", {
		name: "joes-narrative-pause.keybind.toggleName",
		hint: "joes-narrative-pause.keybind.toggleHint",
		editable: [{ key: "Space", modifiers: ["Shift"] }],
		onDown: () => { if (game.user.isGM) toggle(); return true; },
		restricted: true
	});

	console.log(`%cNarrative Pause | init`, "color: #c77dff; font-weight: bold;");
});

/*	=======================================================================
	Wiring: socket, restore, API, scene control (ready)
======================================================================= */

Hooks.once("ready", () => {
	try {
		game.socket.on(CHANNEL, (msg) => {
			try { if (msg?.cmd === "set") applyLocal(!!msg.active); }
			catch (e) { DL(3, "socket handler error", e); }
		});

		applyLocal(!!getSetting("narrativeActive", false));		// restore persisted state

		const api = { toggle, setActive, isActive: isNarrativeActive };
		globalThis.narrativePause = api;
		const mod = game.modules.get(MOD_ID);
		if (mod) mod.api = api;

		DL("ready(): Narrative Pause initialized");
	} catch (e) {
		DL(3, "ready(): init failed", e);
	}
});

/*	GM-only scene-control toggle. Handles both the v13 array shape and the v14
	record shape of the control set; active reflects isNarrativeActive() and is
	re-rendered on every state change. */
Hooks.on("getSceneControlButtons", (controls) => {
	if (!game.user.isGM) return;

	const tool = {
		name: "narrativePause",
		title: game.i18n.localize("joes-narrative-pause.controls.toolTitle"),
		icon: "fas fa-comment-dots",
		toggle: true,
		active: isNarrativeActive(),
		onClick: (active) => setActive(active),			// v13
		onChange: (event, active) => setActive(active)	// v14
	};

	if (Array.isArray(controls)) {
		const token = controls.find(c => c.name === "token" || c.name === "tokens");
		if (token?.tools) token.tools.push(tool);
	} else if (controls && typeof controls === "object") {
		const token = controls.tokens ?? controls.token;
		if (token?.tools) token.tools[tool.name] = tool;
	}
});
