import {
	ButtonComponent,
	InputComponent,
	KeybindHintComponent,
	OptionsComponent,
	RenderButtonComponent,
	SideInputsComponent,
	SideRendersComponent
} from "@/components";
import { isValidVideo, SUPPORTED_EXTENSIONS } from "@/functions/clipper";
import { MenuCloseIcon, MenuOpenIcon } from "@/icons";
import StatesContext from "@/StatesContext";
import { convertFileSrc } from "@tauri-apps/api/core";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { message } from "@tauri-apps/plugin-dialog";
import { platform } from "@tauri-apps/plugin-os";
import { useContext, useEffect, useState } from "react";
import SimpleBar from "simplebar-react";

function App() {
	const [dragMessage, setDragMessage] = useState<string | null>(null),
		states = useContext(StatesContext),
		[inputs, setInputs] = useState(states.clipper.inputs[0]),
		[encoder, setEncoder] = useState(states.clipper.encoder[0]),
		[output, setOutput] = useState(states.clipper.output[0]),
		[sideInputsToggled, setSideInputsToggled] = useState(false),
		[currentInput, setCurrentInput] = useState(states.currentInput[0]),
		[renders, setRenders] = useState(states.renders[0]);

	useEffect(() => {
		const unlistens = [
				listen<{ paths: Array<string> }>(
					TauriEvent.DRAG_ENTER,
					event =>
						event.payload.paths.some(path => SUPPORTED_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext))) &&
						setDragMessage("Drop the input(s) NOW!")
				),
				listen(TauriEvent.DRAG_LEAVE, () => setDragMessage(null)),
				listen<{ paths: Array<string> }>(TauriEvent.DRAG_DROP, async event => {
					const entries = [];

					for (const file of event.payload.paths.filter(path => SUPPORTED_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext)))) {
						setDragMessage(`Processing input "${file}"`);

						if (await isValidVideo(file)) {
							entries.push({
								_dndID: Math.random(),
								_src:
									platform() === "windows"
										? convertFileSrc(file)
										: (inputs.entries.find(entry => entry.file === file)?._src ??
											URL.createObjectURL(await (await fetch(convertFileSrc(file))).blob())),
								file,
								segments: [],
								videoTrack: 0,
								audioTrack: 0,
								subtitleTrack: null,
								speed: 1
							});
						} else {
							message(`Input "${file}" is not a valid video.`, { kind: "error" });
						}
					}

					setDragMessage(null);

					const newInputs = {
						...inputs,
						entries: inputs.entries.concat(entries)
					};

					setInputs?.(newInputs);
					setCurrentInput(newInputs.entries[newInputs.entries.length - 1]);
				})
			],
			onContextMenu = (event: MouseEvent) => event.preventDefault(),
			onKeyDown = async (event: KeyboardEvent) => {
				if ((event.key === "F5" || (event.ctrlKey && event.key.toUpperCase() === "R")) && renders[0]) {
					event.preventDefault();
					return message("You have ongoing renders. Please cancel them before refreshing.", { kind: "warning" });
				}

				if (event.key === "Escape") setSideInputsToggled(!sideInputsToggled);
			};

		document.addEventListener("contextmenu", onContextMenu);
		document.addEventListener("keydown", onKeyDown);

		return () => {
			Promise.all(unlistens).then(unlistens => unlistens.forEach(unlisten => unlisten()));
			document.removeEventListener("contextmenu", onContextMenu);
			document.removeEventListener("keydown", onKeyDown);
		};
	});

	return (
		<StatesContext.Provider
			value={{
				clipper: {
					inputs: [inputs, setInputs],
					encoder: [encoder, setEncoder],
					output: [output, setOutput]
				},
				sideInputsToggled: [sideInputsToggled, setSideInputsToggled],
				currentInput: [currentInput, setCurrentInput],
				renders: [renders, setRenders]
			}}
		>
			{dragMessage && (
				<div className="fixed z-20 flex h-full w-full items-center justify-center break-all bg-gray-700 p-10 text-5xl font-bold text-white">
					{dragMessage}
				</div>
			)}
			<div className="flex h-[7vh] items-center justify-between gap-2 bg-gray-900 p-2">
				<div className="w-1/6">
					<ButtonComponent onClick={() => setSideInputsToggled(!sideInputsToggled)}>
						<div className="w-8 fill-white">{sideInputsToggled ? <MenuOpenIcon /> : <MenuCloseIcon />}</div>
						{sideInputsToggled ? "Hide" : "Show"} Inputs
						<KeybindHintComponent>Esc</KeybindHintComponent>
					</ButtonComponent>
				</div>
				<div className="w-4/6">
					<OptionsComponent />
				</div>
				<div className="w-1/6">
					<RenderButtonComponent />
				</div>
			</div>
			<div className="flex h-[93vh]">
				<div className={`fixed z-10 h-[93vh] w-1/3 flex-col gap-5 bg-gray-900 ${sideInputsToggled ? "flex" : "hidden"}`}>
					<SimpleBar className="m-2 h-2/3 p-4">
						<SideInputsComponent />
					</SimpleBar>
					<SimpleBar className="m-2 h-1/3 p-4">
						<SideRendersComponent />
					</SimpleBar>
				</div>
				<div className="flex w-full flex-col items-center justify-center">
					{currentInput ? (
						<InputComponent currentInput={currentInput} />
					) : (
						<>
							<div className="m-5 text-5xl font-bold">clipper-gui</div>
							<div className="text-2xl">Drag input(s) to this window to get started.</div>
						</>
					)}
				</div>
			</div>
		</StatesContext.Provider>
	);
}

export default App;
