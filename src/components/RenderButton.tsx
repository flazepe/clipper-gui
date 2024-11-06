import { message, save } from "@tauri-apps/plugin-dialog";
import { Child, Command } from "@tauri-apps/plugin-shell";
import { useContext, useState } from "react";
import InputsStateContext from "../contexts/InputsState";
import OptionsContext from "../contexts/Options";
import { getFfmpegArgs, SUPPORTED_EXTENSIONS } from "../functions/clipper";
import { durationToSeconds, secondsToDuration } from "../functions/seconds";
import CancelIcon from "../icons/Cancel";
import VideoVintageIcon from "../icons/VideoVintage";
import Button from "./Button";

export default function () {
	const [inputs] = useContext(InputsStateContext);
	const options = useContext(OptionsContext),
		[_status, setStatus] = useState(""),
		[child, setChild] = useState<Child | null>(null),
		[_progress, setProgress] = useState(0),
		totalDuration = inputs.inputs.reduce((acc, cur) => acc + cur.segments.reduce((acc, cur) => acc + (cur[1] - cur[0]), 0) / cur.speed, 0);

	/*
		<div className="flex w-64 flex-col justify-between text-sm">
			<div className="h-2 rounded bg-slate-300">
				<div className="h-full rounded bg-green-500" style={{ width: `${progress}%` }}></div>
			</div>
			{status.replace(/\x1b(.+?)m/g, "") || "aaa"}
		</div>
	*/

	return child ? (
		<Button
			onClick={() =>
				child
					?.kill()
					.then(() => {
						setChild(null);
						setProgress(100);
					})
					.catch(() => null)
			}
			className="bg-red-600"
		>
			<div className="w-8 fill-white">
				<CancelIcon />
			</div>
			Cancel Render
		</Button>
	) : (
		<Button
			onClick={() => {
				// Validations
				if (!inputs.inputs[0]) return message("No inputs given.", { kind: "error" });

				const badInput = inputs.inputs.find(input => !input.segments[0]);
				if (badInput) return message(`Input "${badInput.file} is missing segments.`, { kind: "error" });

				// Default filename
				const split = inputs.inputs[0].file.split("."),
					[defaultExtension, defaultPath] = [split.pop(), split.join(".")];

				// Run clipper and ffmpeg
				(async () => {
					const outputFile = await save({
						defaultPath: `${defaultPath} (clipped).${defaultExtension}`,
						filters: [{ name: "videos", extensions: SUPPORTED_EXTENSIONS }]
					});
					if (!outputFile) return;

					try {
						const args = await getFfmpegArgs({ inputs, outputFile, dryRun: options.dryRun });
						if (options.dryRun) return setStatus(`ffmpeg ${args.map(arg => (arg.includes(" ") ? `"${arg}"` : arg)).join(" ")}`);

						const command = Command.create("ffmpeg", args);

						command.stdout.on("data", data => setStatus(data));
						command.stderr.on("data", data => {
							console.log(data);
							const time = data.split("time=").pop()!.split(" ")[0];
							if (time.split(":").every(entry => !isNaN(Number(entry)))) setProgress((durationToSeconds(time) / totalDuration) * 100);
							setStatus(data);
						});
						command.on("error", error => setStatus(error));
						command.on("close", () => {
							setChild(null);
							setProgress(100);
						});

						setChild(await command.spawn());
					} catch (error) {
						setStatus(`${error}`);
					}
				})();
			}}
		>
			<div className="w-8 fill-white">
				<VideoVintageIcon />
			</div>
			Render ({secondsToDuration(totalDuration)})
		</Button>
	);
}
