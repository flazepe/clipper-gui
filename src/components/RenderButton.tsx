import { ButtonComponent } from "@/components";
import { getFfmpegArgs, SUPPORTED_EXTENSIONS } from "@/functions/clipper";
import { durationToSeconds, secondsToDuration } from "@/functions/seconds";
import { CancelIcon, VideoVintageIcon } from "@/icons";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { message, save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { Child, Command } from "@tauri-apps/plugin-shell";
import { useContext, useState } from "react";
import { EncoderStateContext, InputsStateContext, OutputContext } from "../contexts";

export default function () {
	const [inputs] = useContext(InputsStateContext);
	const [encoder] = useContext(EncoderStateContext);
	const output = useContext(OutputContext),
		[status, setStatus] = useState(""),
		[child, setChild] = useState<Child | null>(null),
		[progress, setProgress] = useState(0),
		totalDuration = inputs.inputs.reduce((acc, cur) => acc + cur.segments.reduce((acc, cur) => acc + (cur[1] - cur[0]), 0) / cur.speed, 0);

	return child ? (
		<div className="fixed inset-0 z-10 flex h-full w-full items-center justify-center bg-[#000000e6]">
			<div className="flex w-2/5 flex-col justify-between gap-5 rounded bg-gray-800 p-4 text-center">
				{status}
				<div className="flex flex-col gap-5">
					<div className="h-4 rounded bg-slate-300">
						<div className="h-full rounded bg-green-500" style={{ width: `${progress}%` }}></div>
					</div>
					<ButtonComponent
						onClick={() =>
							child
								.kill()
								.then(() => {
									setChild(null);
									setProgress(0);
								})
								.catch(() => null)
						}
						className="bg-red-600"
					>
						<CancelIcon className="w-8 fill-white" />
						Cancel Render
					</ButtonComponent>
				</div>
			</div>
		</div>
	) : (
		<ButtonComponent
			onClick={async () => {
				if (!inputs.inputs[0]) return message("No inputs given.", { kind: "error" });

				const badInput = inputs.inputs.find(input => !input.segments[0]);
				if (badInput) return message(`Input "${badInput.file}" is missing segments.`, { kind: "error" });

				const split = inputs.inputs[0].file.split("."),
					[defaultExtension, defaultPath] = [split.pop(), split.join(".")];

				output.file = await save({
					defaultPath: `${defaultPath} (clipped).${defaultExtension}`,
					filters: [{ name: "videos", extensions: SUPPORTED_EXTENSIONS }]
				});
				if (!output.file) return;

				try {
					const args = await getFfmpegArgs({ inputs, encoder, output }),
						commandString = `ffmpeg ${args.map(arg => (arg.includes(" ") ? `"${arg}"` : arg)).join(" ")}`;

					if (output.dryRun) {
						await writeText(commandString);
						return message("Wrote the ffmpeg command to clipboard.");
					}

					await writeTextFile("ffmpeg.log", `${commandString}\n\n`);

					const command = Command.create("ffmpeg", args);

					command.stdout.on("data", data => {
						console.log(data);
						setStatus(data);
						writeTextFile("ffmpeg.log", data, { append: true }).catch(() => null);
					});
					command.stderr.on("data", data => {
						console.log(data);
						setStatus(data);
						writeTextFile("ffmpeg.log", data, { append: true }).catch(() => null);

						const time = data.split("time=").pop()!.split(" ")[0];
						if (time.split(":").every(entry => !isNaN(Number(entry)))) setProgress((durationToSeconds(time) / totalDuration) * 100);
					});
					command.on("close", close => {
						setChild(null);
						setProgress(100);
						if (![0, 1].includes(close.code ?? 0)) message(`ffmpeg exited with code ${close.code}.`, { kind: "error" });
					});
					command.on("error", error => message(error, { kind: "error" }));

					setChild(await command.spawn());
				} catch (error) {
					message(`${error}`, { kind: "error" });
				}
			}}
		>
			<VideoVintageIcon className="w-8 fill-white" />
			Render ({secondsToDuration(totalDuration)})
		</ButtonComponent>
	);
}
