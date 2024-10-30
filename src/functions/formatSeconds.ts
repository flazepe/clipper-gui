export default function (seconds: number) {
	const hours = Math.trunc(seconds / 3600);
	seconds -= hours * 3600;

	const minutes = Math.trunc(seconds / 60);
	seconds = Math.trunc(seconds - 60 * minutes);

	return `${hours ? `${hours}:` : ""}${hours ? minutes.toString().padStart(2, "0") : minutes}:${seconds
		.toString()
		.padStart(2, "0")}`;
}
