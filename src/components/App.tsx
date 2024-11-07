import { listen, TauriEvent } from "@tauri-apps/api/event";
import { message } from "@tauri-apps/plugin-dialog";
import { useContext, useEffect, useState } from "react";
import InputsStateContext from "../contexts/InputsState";
import InputStateContext from "../contexts/InputState";
import { Input, isValidVideo, SUPPORTED_EXTENSIONS } from "../functions/clipper";
import MenuCloseIcon from "../icons/MenuClose";
import MenuOpenIcon from "../icons/MenuOpen";
import Button from "./Button";
import InputComponent from "./Input";
import Options from "./Options";
import RenderButton from "./RenderButton";
import SideInputsComponent from "./SideInputs";

function App(): JSX.Element {
	const [dragMessage, setDragMessage] = useState<string | null>(null),
		[inputs, setInputs] = useState(useContext(InputsStateContext)[0]),
		[input, setInput] = useState<Input | null>(null),
		inputState = useContext(InputStateContext),
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
		];

		return () => void Promise.all(fns).then(fns => fns.forEach(fn => fn()));
	});

	return (
		<InputsStateContext.Provider value={[inputs, setInputs]}>
			{dragMessage && (
				<div className="fixed left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-gray-700 p-10 text-5xl font-bold text-white">
					{dragMessage}
				</div>
			)}
			<div className="flex h-[6.5vh] items-center justify-between gap-2 bg-gray-900 p-2">
				<div className="w-1/6">
					<Button onClick={() => setSideInputsToggled(!sideInputsToggled)}>
						<div className="w-8 fill-white">{sideInputsToggled ? <MenuOpenIcon /> : <MenuCloseIcon />}</div>
						{sideInputsToggled ? "Hide" : "Show"} Inputs
					</Button>
				</div>
				<div className="w-4/6">
					<Options />
				</div>
				<div className="w-1/6">
					<RenderButton />
				</div>
			</div>
			<div className="flex h-[93.5vh] overflow-hidden">
				<div className={`w-1/4 flex-col gap-5 overflow-x-hidden overflow-y-scroll p-4 ${sideInputsToggled ? "flex" : "hidden"}`}>
					<SideInputsComponent />
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
		</InputsStateContext.Provider>
	);
}

export default App;
