export const MOD_ID = "joes-narrative-pause";

/*	=======================================================================
	Styled console logger
	DL("msg")        => info
	DL(2, "msg")     => warn
	DL(3, "msg")     => error
	Second arg may be an object to dump.
======================================================================= */
export function DL(intLogType, stringLogMsg, objObject = null) {
	const now = new Date();
	const timestamp = now.toTimeString().split(" ")[0]; // "HH:MM:SS"

	// Allow DL("msg") and DL("msg", obj)
	if (typeof intLogType === "string") {
		objObject = stringLogMsg;
		stringLogMsg = intLogType;
		intLogType = 1;
	}

	// Setting may not be registered yet during early init
	let debugLevel = "none";
	try { debugLevel = game.settings.get(MOD_ID, "debugLevel"); } catch { debugLevel = "all"; }

	const levelMap = { none: 4, error: 3, warn: 2, all: 1 };
	const currentLevel = levelMap[debugLevel] ?? 4;
	if (intLogType < currentLevel) return;

	// File and line of the caller
	const stack = new Error().stack.split("\n");
	let fileInfo = "Unknown Source";
	for (let i = 2; i < stack.length; i++) {
		const m = stack[i].trim().match(/(\/[^)]+):(\d+):(\d+)/);
		if (m) {
			const [, filePath, lineNumber] = m;
			fileInfo = `${filePath.split("/").pop()}:${lineNumber}`;
			break;
		}
	}

	const msg = `[${fileInfo}] ${stringLogMsg}`;
	const base = "color: #c77dff; font-weight: bold;";

	const write = (label, style, obj) => {
		if (obj) console.log(`%cNarrative Pause [${timestamp}] | ${label}${msg}`, style, obj);
		else console.log(`%cNarrative Pause [${timestamp}] | ${label}${msg}`, style);
	};

	switch (intLogType) {
		case 2: write("WARNING: ", "color: orange; font-weight: bold;", objObject); break;
		case 3: write("ERROR: ", "color: red; font-weight: bold;", objObject); break;
		default: write("", base, objObject);
	}
}
