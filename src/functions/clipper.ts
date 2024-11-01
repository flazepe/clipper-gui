import { Command } from "@tauri-apps/plugin-shell";
import { Input } from "../components/Input";
import { Options } from "../components/Options";

export function generateClipperArgs({ inputs, options, output }: { inputs: Array<Input>; options: Options; output: string }) {
	const args: Array<string> = [];

	for (const input of inputs) {
		args.push("-i", input.path);
		if (!options.noVideo) args.push("-vt", input.videoTrack.toString());
		if (!options.noAudio) args.push("-at", input.audioTrack.toString());
		if (input.subtitleTrack !== null) args.push("-st", input.subtitleTrack.toString());
		for (const segment of input.segments) args.push("-s", segment.join("-"));
	}

	if (options.fade) args.push(options.fade === true ? "-f" : `-f=${options.fade}`);
	if (options.noVideo) args.push("-vn");
	if (options.noAudio) args.push("-an");
	args.push("-y", output);

	return args;
}

export async function createFfmpegCommand(args: Array<string>) {
	return new Promise<Command<string>>(async (resolve, reject) => {
		try {
			const ffmpegCommand = await dryRunClipper(args),
				ffmpegArgs = (ffmpegCommand.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [])
					.slice(1)
					.map(entry => (entry.includes(" ") ? entry.slice(1, -1) : entry));
			resolve(Command.create("ffmpeg", ffmpegArgs));
		} catch (error) {
			reject(error);
		}
	});
}

function dryRunClipper(args: Array<string>) {
	return new Promise<string>((resolve, reject) => {
		const command = Command.create("clipper", [...args, "-d"]); // Force dry run to get the ffmpeg command
		command.on("error", data => reject(data));
		command.stderr.on("data", data => reject(data));
		command.stdout.on("data", data => (data.startsWith("ffmpeg ") ? resolve(data) : reject(data)));
		command.on("close", close => resolve(`Closed with error code ${close.code}.`));
		command.spawn().catch(() => reject("An error occurred."));
	});
}
