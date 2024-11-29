import { ButtonComponent, KeybindHintComponent } from "@/components";
import { getFfmpegArgs, isValidVideo, Render, SUPPORTED_AUDIO_EXTENSIONS, SUPPORTED_VIDEO_EXTENSIONS } from "@/functions/clipper";
import { durationToSeconds, secondsToDuration } from "@/functions/seconds";
import { VideoIcon } from "@/icons";
import StatesContext from "@/StatesContext";
import { appLogDir } from "@tauri-apps/api/path";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { message, save } from "@tauri-apps/plugin-dialog";
import { BaseDirectory, mkdir, writeTextFile } from "@tauri-apps/plugin-fs";
import { Command } from "@tauri-apps/plugin-shell";
import { useContext, useEffect } from "react";

export default function () {
	const {
			clipper: {
				inputs: [inputs],
				encoder: [encoder],
				output: [output]
			},
			sideInputsToggled: [, setSideInputsToggled],
			renders: [renders, setRenders]
		} = useContext(StatesContext),
		totalDuration = inputs.entries.reduce((acc, cur) => acc + cur.segments.reduce((acc, cur) => acc + (cur[1] - cur[0]), 0) / cur.speed, 0),
		render = async () => {
			if (!inputs.entries[0]) return message("No inputs given.", { kind: "error" });

			for (const input of inputs.entries) {
				if (!input.segments[0]) return message(`Input "${input.file}" is missing segments.`, { kind: "error" });
				if (!(await isValidVideo(input.file))) return message(`Input "${input.file}" is deleted.`, { kind: "error" });
			}

			const split = inputs.entries[0].file.split("."),
				[defaultExtension, defaultPath] = [split.pop(), split.join(".")];

			output.file = await save({
				defaultPath: `${defaultPath} (clipped).${defaultExtension}`,
				filters: [
					{ name: "Video files", extensions: SUPPORTED_VIDEO_EXTENSIONS },
					{ name: "Audio files", extensions: SUPPORTED_AUDIO_EXTENSIONS }
				]
			});

			if (!output.file) return;

			if (inputs.entries.some(entry => entry.file === output.file))
				return message("Please pick a different output that does not conflict with one of the inputs.", { kind: "error" });

			if (SUPPORTED_AUDIO_EXTENSIONS.some(ext => output.file?.toLowerCase().endsWith(ext)) && !inputs.noVideo)
				return message(`You are rendering into an audio file. Please turn on the "No Video" option to avoid errors.`, { kind: "error" });

			try {
				const args = await getFfmpegArgs({ inputs, encoder, output }),
					commandString = `ffmpeg ${args.map(arg => (arg.includes(" ") ? `"${arg}"` : arg)).join(" ")}`;

				if (output.dryRun) {
					await writeText(commandString);
					return message("Wrote the ffmpeg command to clipboard.");
				}

				await mkdir(await appLogDir(), { recursive: true });

				await writeTextFile("ffmpeg.log", `${renders[0] ? "\n\n" : ""}${commandString}\n\n`, {
					baseDir: BaseDirectory.AppLog,
					append: !!renders[0]
				});

				const command = Command.create("ffmpeg", args),
					child = await command.spawn(),
					render: Render = { filename: output.file, progress: 0, child };

				setRenders?.(renders => [...renders, render]);
				setSideInputsToggled?.(true);

				command.stdout.on("data", data => {
					data = `[${render.filename}] ${data}`;

					console.log(data);

					writeTextFile("ffmpeg.log", data, {
						baseDir: BaseDirectory.AppLog,
						append: true
					}).catch(() => null);
				});
				command.stderr.on("data", data => {
					data = `[${render.filename}] ${data}`;

					console.log(data);

					writeTextFile("ffmpeg.log", data, {
						baseDir: BaseDirectory.AppLog,
						append: true
					}).catch(() => null);

					const time = data.split("time=").pop()!.split(" ")[0];

					if (time.split(":").every(entry => !isNaN(Number(entry)))) {
						render.progress = (durationToSeconds(time) / totalDuration) * 100;
						setRenders?.(renders => [...renders]);
					}
				});
				command.on("close", async close => {
					setRenders?.(renders => renders.filter(entry => entry !== render));

					if (![0, 1].includes(close.code ?? 0))
						message(
							`[${render.filename}] ffmpeg exited with code ${close.code}. Please check the ffmpeg.log file in ${await appLogDir()}.`,
							{ kind: "error" }
						);
				});
				command.on("error", error => message(error, { kind: "error" }));
			} catch (error) {
				message(`${error}`, { kind: "error" });
			}
		};

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) =>
			document.activeElement?.tagName !== "INPUT" &&
			// Ctrl should not be pressed to avoid conflict with Ctrl + R
			!event.ctrlKey &&
			event.key.toUpperCase() === "R" &&
			render();
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	});

	return (
		<ButtonComponent onClick={render}>
			<VideoIcon className="w-8 fill-white" />
			Render ({secondsToDuration(totalDuration)}) <KeybindHintComponent>R</KeybindHintComponent>
		</ButtonComponent>
	);
}
