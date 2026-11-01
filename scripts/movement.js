/*	=======================================================================
	Movement veto via the preMoveToken pipeline (present in v13 and v14).

	A flat block: while narrative mode is on, cancel any non-GM token move and
	show the player a fading reminder. The GM moves freely. preMoveToken fires
	on the client that initiated the move, so each player's own client enforces
	this, no socket round-trip needed.
======================================================================= */

import { DL } from "./logger.js";
import { isNarrativeActive } from "./narrative.js";
import { showBlockToast } from "./ui.js";

function onPreMove(tokenDoc, movement, operation) {
	try {
		if (game.user.isGM) return true;		// GM is never blocked
		if (!isNarrativeActive()) return true;	// narrative mode off
		DL(`onPreMove(): blocked move of "${tokenDoc?.name}"`);
		showBlockToast();
		return false;							// cancel the move
	} catch (e) {
		DL(3, "onPreMove(): error", e);
		return true;							// never trap a token on a bug
	}
}

Hooks.on("preMoveToken", onPreMove);
