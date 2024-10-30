export default function (seconds: number, padAll = false) {
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
