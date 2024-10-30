import { convertFileSrc } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { Command } from "@tauri-apps/plugin-shell";
import { useEffect, useState } from "react";
import generateClipperArgs from "../functions/generateClipperArgs";
import Button from "./Button";
import Video from "./Video";

const SUPPORTED_EXTENSIONS = ["avi", "flv", "mkv", "mov", "mp4"];

export interface Input {
	id: number;
	name: string;
	path: string;
	src: string;
	segments: Array<string>;
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

				const lastID = inputs.length ? inputs[inputs.length - 1].id : 0;

				setInputs([
					...inputs,
					...event.payload.paths
						.filter(path => SUPPORTED_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext)))
						.map((path, index) => ({
							id: lastID + index + 1,
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
				<div
					className={`bg-gray-700 fixed w-full h-full top-0 left-0 z-10 text-white justify-center items-center flex text-5xl font-bold`}
				>
					Drop the file NOW!
				</div>
			)}
			<div className="inline-flex flex-col w-full h-full items-center">
				<div className="font-bold text-5xl m-5">Clipper</div>
				<Button
					onClick={() => {
						setInputs([]);
						setLogs("");
					}}
				>
					Clear All Inputs
				</Button>
				<div className="cursor-pointer">
					<div onClick={() => setFade(!fade)} className="text-xl gap-2 flex">
						<input type="checkbox" checked={!!fade} readOnly />
						Fade
					</div>
					<div onClick={() => setNoVideo(!noVideo)} className="text-xl gap-2 flex">
						<input type="checkbox" checked={!!noVideo} readOnly />
						No Video
					</div>
					<div onClick={() => setNoAudio(!noAudio)} className="text-xl gap-2 flex">
						<input type="checkbox" checked={!!noAudio} readOnly />
						No Audio
					</div>
				</div>
				<div className="lg:flex flex-wrap gap-5 justify-center m-5">
					{inputs.map((input, index) => (
						<div className="border-gray-500 border-2 p-5 rounded" key={index}>
							<div className="font-bold text-xl my-2">
								{input.name}
								<span
									onClick={() => setInputs(inputs.filter(entry => entry.id !== input.id))}
									className="text-red-500 ml-2 cursor-pointer"
								>
									(delete)
								</span>
							</div>
							<Video input={input} setInputs={setInputs} />
							<div className="text-xl font-bold">Segments</div>
							{input.segments.map((segment, index) => (
								<div key={index}>
									{segment}
									<span
										onClick={() => {
											input.segments.splice(input.segments.indexOf(segment), 1);
											setInputs(JSON.parse(JSON.stringify(inputs)));
										}}
										className="text-red-500 ml-2 cursor-pointer"
									>
										(delete)
									</span>
								</div>
							))}
						</div>
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

							const command = Command.create(
								"clipper",
								generateClipperArgs({ inputs, fade, noVideo, noAudio, output })
							);

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
					Run
				</Button>
				<div className="whitespace-pre-wrap">{logs.replace(/\x1b(.+?)m/g, "")}</div>
			</div>
		</div>
	);
}

export default App;
