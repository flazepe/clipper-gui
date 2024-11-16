import {
	ButtonComponent,
	InputComponent,
	KeybindHintComponent,
	OptionsComponent,
	RenderButtonComponent,
	SideInputsComponent,
	SideRendersComponent
} from "@/components";
import { InputsStateContext, InputStateContext, RendersStateContext } from "@/contexts";
import { Input, isValidVideo, Render, SUPPORTED_EXTENSIONS } from "@/functions/clipper";
import { MenuCloseIcon, MenuOpenIcon } from "@/icons";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { message } from "@tauri-apps/plugin-dialog";
import { useContext, useEffect, useState } from "react";
import SimpleBar from "simplebar-react";

function App() {
	const [dragMessage, setDragMessage] = useState<string | null>(null),
		[inputs, setInputs] = useState(useContext(InputsStateContext)[0]),
		[input, setInput] = useState<Input | null>(null),
		inputState = useContext(InputStateContext),
		[renders, setRenders] = useState<Array<Render>>([]),
		[sideInputsToggled, setSideInputsToggled] = useState(false);

	inputState[0] = input;
	inputState[1] = setInput;

	useEffect(() => {
		const fns = [
				listen<{ paths: Array<string> }>(
					TauriEvent.DRAG_ENTER,
					event =>
						event.payload.paths.some(path => SUPPORTED_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext))) &&
						setDragMessage("Drop the input(s) NOW!")
				),
				listen(TauriEvent.DRAG_LEAVE, () => setDragMessage(null)),
				listen<{ paths: Array<string> }>(TauriEvent.DRAG_DROP, async event => {
					const paths = [];

					for (const path of event.payload.paths.filter(path => SUPPORTED_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext)))) {
						setDragMessage(`Processing input "${path}"`);

						if (await isValidVideo(path)) {
							paths.push(path);
						} else {
							message(`Input "${path}" is not a valid video.`, { kind: "error" });
						}
					}

					setDragMessage(null);

					const newInputs = {
						...inputs,
						inputs: [
							...inputs.inputs,
							...paths.map(path => ({
								_dndID: Math.random().toString(8),
								file: path,
								segments: [],
								videoTrack: 0,
								audioTrack: 0,
								subtitleTrack: null,
								speed: 1
							}))
						]
					};

					setInputs?.(newInputs);

					if (newInputs.inputs[0]) {
						setInput(newInputs.inputs[newInputs.inputs.length - 1]);
						setSideInputsToggled(true);
					}
				})
			],
			onContextMenu = (event: MouseEvent) => event.preventDefault(),
			onKeyDown = async (event: KeyboardEvent) => {
				if (event.key === "F5" || (event.ctrlKey && event.key.toUpperCase() === "R"))
					for (const render of renders) await render.child.kill().catch(() => null);

				if (event.key === "Escape") setSideInputsToggled(!sideInputsToggled);

				if (event.key === "ArrowUp" && input) {
					const previousInput = inputs.inputs[inputs.inputs.indexOf(input) - 1] ?? inputs.inputs[inputs.inputs.length - 1];
					if (previousInput) setInput(previousInput);
				}

				if (event.key === "ArrowDown" && input) {
					const nextInput = inputs.inputs[inputs.inputs.indexOf(input) + 1] ?? inputs.inputs[0];
					if (nextInput) setInput(nextInput);
				}
			};

		document.addEventListener("contextmenu", onContextMenu);
		document.addEventListener("keydown", onKeyDown);

		return () => {
			Promise.all(fns).then(fns => fns.forEach(fn => fn()));
			document.removeEventListener("contextmenu", onContextMenu);
			document.removeEventListener("keydown", onKeyDown);
		};
	});

	return (
		<InputsStateContext.Provider value={[inputs, setInputs]}>
			<RendersStateContext.Provider value={[renders, setRenders]}>
				{dragMessage && (
					<div className="fixed z-10 flex h-full w-full items-center justify-center bg-gray-700 p-10 text-5xl font-bold text-white">
						{dragMessage}
					</div>
				)}
				<div className="flex h-[7vh] items-center justify-between gap-2 bg-gray-900 p-2">
					<div className="w-1/6">
						<ButtonComponent onClick={() => setSideInputsToggled(!sideInputsToggled)}>
							<div className="w-8 fill-white">{sideInputsToggled ? <MenuOpenIcon /> : <MenuCloseIcon />}</div>
							{sideInputsToggled ? "Hide" : "Show"} Inputs <KeybindHintComponent>Esc</KeybindHintComponent>
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
					<div className={`w-1/4 flex-col gap-5 ${sideInputsToggled ? "flex" : "hidden"} bg-gray-900`}>
						<SimpleBar className="h-2/3 p-4">
							<SideInputsComponent />
						</SimpleBar>
						<SimpleBar className="h-1/3 p-4">
							<SideRendersComponent />
						</SimpleBar>
					</div>
					<div className={`flex flex-col items-center justify-center ${sideInputsToggled ? "w-3/4" : "w-full"}`}>
						{input ? (
							<InputComponent input={input} />
						) : (
							<>
								<div className="m-5 text-5xl font-bold">clipper-gui</div>
								<div className="text-2xl">Drag input(s) to this window to get started.</div>
							</>
						)}
					</div>
				</div>
			</RendersStateContext.Provider>
		</InputsStateContext.Provider>
	);
}

export default App;
