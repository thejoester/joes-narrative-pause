/*	=======================================================================
	Wiring: restore state on ready, expose the API, and add the GM scene-control
	toggle button.
======================================================================= */

import { MOD_ID, DL } from "./logger.js";
import { initNarrative, toggle, setActive, isNarrativeActive } from "./narrative.js";
import { getSetting } from "./settings.js";
import { LT } from "./localization.js";

Hooks.once("init", () => {
	console.log(`%cNarrative Pause | init`, "color: #c77dff; font-weight: bold;");
});

Hooks.once("ready", () => {
	try {
		initNarrative();		// listen on the socket and restore persisted state

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
	record shape of the control set; aria-pressed is the truth for the toggle
	state, so reflect isNarrativeActive() into it. */
Hooks.on("getSceneControlButtons", (controls) => {
	if (!game.user.isGM) return;

	const tool = {
		name: "narrativePause",
		title: LT.controls.toolTitle(),
		icon: "fas fa-comment-dots",
		toggle: true,
		active: isNarrativeActive(),
		onClick: (active) => setActive(active),		// v13
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
