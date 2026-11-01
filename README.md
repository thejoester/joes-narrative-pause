# Joe's Narrative Pause

A FoundryVTT module that gives the GM a "narrative mode" to freeze player token movement during exposition, without throwing up the full pause screen.

## What it does

- The GM toggles Narrative Mode with a keybind (default **Shift+Space**), the scene-control button, or the module API.
- While it is on:
  - A pulsing border glow (default red) frames the screen as a reminder the mode is active.
  - A gold-bordered **Narrative Mode** banner sits at the top-center of the screen.
  - Any player who tries to move a token (drag or arrow keys) has the move cancelled and sees a fading reminder in the top third of the screen (default *No Walking, GM Talking!*).
- The GM can still move tokens freely.

Narrative Mode is an independent state, not Foundry's built-in pause. An optional setting can additionally enable the real pause.

## Installation

In Foundry's **Add-on Modules** tab, choose **Install Module** and paste this manifest URL:

```
https://github.com/thejoester/joes-narrative-pause/releases/latest/download/module.json
```

## Toggling it

- **Keybind:** default **Shift+Space** (GM only, re-bindable in Configure Controls).
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

## Compatibility

FoundryVTT v14 (verified), v13 (minimum).
