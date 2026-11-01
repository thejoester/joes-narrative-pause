# Joe's Narrative Pause

A FoundryVTT module that gives the GM a "narrative mode" to freeze player token movement during exposition, without throwing up the full pause screen.

## What it does

- The GM toggles Narrative Mode with a keybind (default **Shift+Space**), the scene-control button, or the module API.
- While it is on:
  - A pulsing border glow (default red) frames the screen as a reminder the mode is active.
  - A gold-bordered **Narrative Mode** banner sits at the top-center of the screen.
  - Any player who tries to move a token (drag or arrow keys) has the move cancelled and sees a fading reminder in the top third of the screen (default *No Walking, GM Talking!*).
- The GM can still move tokens freely.

Narrative Mode is an independent state, not Foundry's built-in pause (which does not actually stop token movement). An optional setting can additionally drive the real pause.

## Toggling it

- **Keybind:** default **Shift+Space** (GM only, rebindable in Configure Controls).
- **Scene control:** a toggle button in the token controls (GM only).
- **API:** see below.

## Settings

All settings are world-scope (set by the GM).

- **Show the border glow** (default on): show the pulsing border while Narrative Mode is active.
- **Border glow color** (default red): color of the border glow, chosen with a color picker.
- **Banner text** (default "Narrative Mode"): the top-center banner label.
- **Blocked-move message** (default "No Walking, GM Talking!"): what a blocked player sees.
- **Message duration (seconds)** (default 5): how long the blocked-move message stays up before it fades.
- **Show banner to players** (default off): when on, players also see the top-center banner.
- **Flash border on all screens** (default off): when off, only the GM sees the border glow; when on, everyone does.
- **Also pause the game** (default off): also toggle Foundry's built-in pause when Narrative Mode toggles.
- **Debug logging** (default none): console logging verbosity.

## How it works

Movement is blocked in the `preMoveToken` pipeline: while Narrative Mode is on, a non-GM token move is cancelled on that player's own client. State is held in a hidden world setting, broadcast over the module socket when the GM toggles, and restored on load, so late-joiners and refreshes stay in sync.

## Compatibility

FoundryVTT v14 (verified), v13 (minimum). No build step, plain ES modules.
