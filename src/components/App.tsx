import { convertFileSrc } from "@tauri-apps/api/core";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { save } from "@tauri-apps/plugin-dialog";
import { Command } from "@tauri-apps/plugin-shell";
import { useEffect, useState } from "react";
import generateClipperArgs from "../functions/generateClipperArgs";
import Button from "./Button";
import Input from "./Input";

const SUPPORTED_EXTENSIONS = ["avi", "flv", "mkv", "mov", "mp4"];

export interface Input {
	name: string;
	path: string;
	src: string;
	segments: Array<[number, number]>;
}

function App(): JSX.Element {
	const [isDragged, setIsDragged] = useState(false),
		[inputs, setInputs] = useState<Array<Input>>([]),
		[fade, setFade] = useState<boolean | number>(false),
		[noVideo, setNoVideo] = useState<boolean>(false),
		[noAudio, setNoAudio] = useState<boolean>(false),
		[logs, setLogs] = useState("");

	useEffect(() => {
		const fns = [
			listen(TauriEvent.DRAG_ENTER, () => setIsDragged(true)),
			listen(TauriEvent.DRAG_LEAVE, () => setIsDragged(false)),
			listen<{ paths: Array<string> }>(TauriEvent.DRAG_DROP, event => {
				setIsDragged(false);

				setInputs([
					...inputs,
					...event.payload.paths
						.filter(path => SUPPORTED_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext)))
						.map(path => ({
							name: path.split(/[/\\]/).pop()!,
							path: path,
							src: convertFileSrc(path),
							segments: []
						}))
				]);
			})
		];

		return () => {
			Promise.all(fns).then(fns => fns.forEach(fn => fn()));
		};
	});

	return (
		<div className="min-h-screen">
			{isDragged && (
				<div className={`fixed left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-gray-700 text-5xl font-bold text-white`}>
					Drop the file NOW!
				</div>
			)}
			<div className="my-10 inline-flex h-full w-full flex-col items-center gap-5">
				<div className="text-5xl font-bold">clipper-gui</div>
				<Button
					onClick={() => {
						setInputs([]);
						setLogs("");
					}}
				>
					Clear All Inputs
				</Button>
				<div className="flex cursor-pointer flex-col justify-center gap-5">
					<div className="flex items-center gap-2 text-xl">
						<div onClick={() => setFade(!fade)} className="flex gap-2 text-xl">
							<input type="checkbox" checked={!!fade} readOnly />
							Fade
						</div>
						{!!fade && (
							<input
								type="number"
								min={0}
								defaultValue="0.5"
								step="0.1"
								onChange={event => setFade(Number(event.currentTarget.value))}
								className="w-20"
							/>
						)}
					</div>
					<div onClick={() => setNoVideo(!noVideo)} className="flex gap-2 text-xl">
						<input type="checkbox" checked={!!noVideo} readOnly />
						No Video
					</div>
					<div onClick={() => setNoAudio(!noAudio)} className="flex gap-2 text-xl">
						<input type="checkbox" checked={!!noAudio} readOnly />
						No Audio
					</div>
				</div>
				<div className="m-5 flex flex-wrap justify-center gap-10">
					{inputs.map((input, index) => (
						<Input input={input} setInputs={setInputs} key={index} />
					))}
				</div>
				<Button
					onClick={() => {
						(async () => {
							const output = await save({
								defaultPath: "output.mp4",
								filters: [{ name: "videos", extensions: SUPPORTED_EXTENSIONS }]
							});
							if (!output) return;

							setLogs("Running...");

							const command = Command.create("clipper", generateClipperArgs({ inputs, fade, noVideo, noAudio, output }));

							command.on("error", error => {
								console.log("[error]", error);
								setLogs(`Error: ${error}`);
							});
							command.on("close", close => {
								console.log("[close]", close);
								if (!close.code) setLogs("Done!");
							});

							command.stdout.on("data", data => {
								console.log(`[stdout] ${data}`);
								setLogs(data);
							});
							command.stderr.on("data", data => console.log(`[stderr] ${data}`));

							await command.spawn();
						})();
					}}
				>
					Clip
				</Button>
				<div className="whitespace-pre-wrap">
					clipper {generateClipperArgs({ inputs, fade, noVideo, noAudio, output: "<output>" }).join(" ")}
					<br />
					{logs.replace(/\x1b(.+?)m/g, "")}
				</div>
			</div>
		</div>
	);
}

export default App;
