export function secondsToDuration(seconds: number, padAll = false) {
	if (isNaN(seconds)) seconds = 0;

	const hours = Math.trunc(seconds / 3600);
	seconds -= hours * 3600;

	const minutes = Math.trunc(seconds / 60);
	seconds = Math.trunc(seconds - 60 * minutes);

	let formattedHours = "",
		formattedMinutes = "",
		formattedSeconds = seconds.toString().padStart(2, "0");

	if (padAll) {
		if (hours) formattedHours = `${hours.toString().padStart(2, "0")}:`;
		formattedMinutes = minutes.toString().padStart(2, "0");
	} else {
		if (hours) formattedHours = `${hours}:`;
		formattedMinutes = hours ? minutes.toString().padStart(2, "0") : minutes.toString();
	}

	return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
}

export function durationToSeconds(duration: string) {
	const split = duration.toString().split(":").map(Number);
	if (split.some(entry => isNaN(entry))) return 0;

	switch (split.length) {
		case 1:
			return split[0];
		case 2:
			return split[0] * 60 + split[1];
		case 3:
			return split[0] * 3600 + split[1] * 60 + split[2];
		default:
			return 0;
	}
}
