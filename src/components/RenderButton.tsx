import { message, save } from "@tauri-apps/plugin-dialog";
import { Child, Command } from "@tauri-apps/plugin-shell";
import { useContext, useState } from "react";
import InputsStateContext from "../contexts/InputsState";
import OptionsContext from "../contexts/Options";
import { getFfmpegArgs, SUPPORTED_EXTENSIONS } from "../functions/clipper";
import { secondsToDuration } from "../functions/seconds";
import Button from "./Button";

export default function () {
	const [inputs] = useContext(InputsStateContext);
	const options = useContext(OptionsContext),
		[status, setStatus] = useState(""),
		[child, setChild] = useState<Child | null>(null);

	return (
		<>
			<div className="w-1/2 whitespace-pre-wrap rounded bg-gray-950 p-4 text-center">
				Total video duration:{" "}
				{secondsToDuration(inputs.inputs.reduce((acc, cur) => acc + cur.segments.reduce((acc, cur) => acc + (cur[1] - cur[0]), 0), 0))}
				<br />
				{status.replace(/\x1b(.+?)m/g, "")}
			</div>
			{child ? (
				<Button onClick={() => child?.kill().catch(() => null)} className="w-56 bg-red-600">
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
							const output = await save({
								defaultPath: `${defaultPath} (clipped).${defaultExtension}`,
								filters: [{ name: "videos", extensions: SUPPORTED_EXTENSIONS }]
							});
							if (!output) return;

							try {
								const args = await getFfmpegArgs({ inputs, output, dryRun: options.dryRun });
								if (options.dryRun) return setStatus(`ffmpeg ${args.map(arg => (arg.includes(" ") ? `"${arg}"` : arg)).join(" ")}`);

								const command = Command.create("ffmpeg", args);

								command.stdout.on("data", data => setStatus(data));
								command.stderr.on("data", data => setStatus(data));
								command.on("error", error => setStatus(error));
								command.on("close", () => setChild(null));

								setChild(await command.spawn());
							} catch (error) {
								setStatus(`${error}`);
							}
						})();
					}}
					className="w-56"
				>
					Render
				</Button>
			)}
		</>
	);
}
