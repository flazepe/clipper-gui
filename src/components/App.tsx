import { convertFileSrc } from "@tauri-apps/api/core";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { save } from "@tauri-apps/plugin-dialog";
import { Child } from "@tauri-apps/plugin-shell";
import { useEffect, useState } from "react";
import { createFfmpegCommand, generateClipperArgs } from "../functions/clipper";
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
		[noVideo, setNoVideo] = useState(false),
		[noAudio, setNoAudio] = useState(false),
		[dryRun, setDryRun] = useState(false),
		[status, setStatus] = useState(""),
		[child, setChild] = useState<Child | null>(null);

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
				<Button onClick={() => window.location.reload()}>Reset</Button>
				<div className="flex cursor-pointer items-center gap-5">
					<div className="flex items-center gap-2 text-xl">
						<div onClick={() => setFade(!fade)} className="flex gap-2 text-xl">
							<input type="checkbox" checked={!!fade} readOnly />
							Fade
						</div>
						{
							<input
								type="number"
								min={0}
								defaultValue="0.5"
								step="0.1"
								onChange={event => setFade(Number(event.currentTarget.value))}
								readOnly={!fade}
								className="w-20"
							/>
						}
					</div>
					<div onClick={() => setNoVideo(!noVideo)} className="flex gap-2 text-xl">
						<input type="checkbox" checked={!!noVideo} readOnly />
						No Video
					</div>
					<div onClick={() => setNoAudio(!noAudio)} className="flex gap-2 text-xl">
						<input type="checkbox" checked={!!noAudio} readOnly />
						No Audio
					</div>
					<div onClick={() => setDryRun(!dryRun)} className="flex gap-2 text-xl">
						<input type="checkbox" checked={!!dryRun} readOnly />
						Dry Run
					</div>
				</div>
				<div className="m-5 flex flex-wrap justify-center gap-10">
					{inputs.map((input, index) => (
						<Input input={input} setInputs={setInputs} key={index} />
					))}
				</div>
				<div className="whitespace-pre-wrap">{status.replace(/\x1b(.+?)m/g, "")}</div>
				<div className="flex gap-2">
					{child ? (
						<Button onClick={() => child?.kill().catch(() => null)}>Cancel Render</Button>
					) : (
						<Button
							onClick={() => {
								(async () => {
									const output = await save({
										defaultPath: "output.mp4",
										filters: [{ name: "videos", extensions: SUPPORTED_EXTENSIONS }]
									});
									if (!output) return;

									try {
										const args = generateClipperArgs({ inputs, fade, noVideo, noAudio, output });
										if (dryRun) return setStatus(`clipper ${args.map(arg => (arg.includes(" ") ? `"${arg}"` : arg)).join(" ")}`);

										const command = await createFfmpegCommand(args);

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
						>
							Render
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

export default App;
