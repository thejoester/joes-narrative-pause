/*	=======================================================================
	Settings registration. Registered in the init hook so they exist before
	the ready hook wires everything together. The keybind is registered in
	narrative.js (it owns toggle()).
======================================================================= */

import { MOD_ID, DL } from "./logger.js";

/*	Read a setting with a safe fallback if it is not registered yet. */
export function getSetting(key, fallback = undefined) {
	try { return game.settings.get(MOD_ID, key); }
	catch { return fallback; }
}

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

	// Whether the border flash shows on every screen, or GM only.
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

	DL("init(): settings registered");
});
