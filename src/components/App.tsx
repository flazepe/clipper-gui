import { listen, TauriEvent } from "@tauri-apps/api/event";
import { useContext, useEffect, useState } from "react";
import InputsStateContext from "../contexts/InputsState";
import InputStateContext from "../contexts/InputState";
import { Input, SUPPORTED_EXTENSIONS } from "../functions/clipper";
import InputComponent from "./Input";
import SideInputsComponent from "./SideInputs";
import Options from "./Options";
import RenderButton from "./RenderButton";
import Button from "./Button";

function App(): JSX.Element {
	const [isDragged, setIsDragged] = useState(false),
		[inputs, setInputs] = useState(useContext(InputsStateContext)[0]),
		[input, setInput] = useState<Input | null>(null),
		inputState = useContext(InputStateContext),
		[sideInputsToggled, setSideInputsToggled] = useState(false);

	inputState[0] = input;
	inputState[1] = setInput;

	useEffect(() => {
		const fns = [
			listen<{ paths: Array<string> }>(TauriEvent.DRAG_ENTER, event => event.payload.paths.length && setIsDragged(true)),
			listen(TauriEvent.DRAG_LEAVE, () => setIsDragged(false)),
			listen<{ paths: Array<string> }>(TauriEvent.DRAG_DROP, event => {
				setIsDragged(false);

				const newInputs = {
					...inputs,
					inputs: [
						...inputs.inputs,
						...event.payload.paths
							.filter(path => SUPPORTED_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext)))
							.map(path => ({
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

		if (input === null && inputs.inputs[0]) {
			setSideInputsToggled(true);
			setInput(inputs.inputs[0]);
		}

		return () => void Promise.all(fns).then(fns => fns.forEach(fn => fn()));
	});

	return (
		<InputsStateContext.Provider value={[inputs, setInputs]}>
			{isDragged && (
				<div className="fixed left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-gray-700 text-5xl font-bold text-white">
					Drop the file(s) NOW!
				</div>
			)}
			<div className="flex h-[6vh] justify-between gap-2 bg-gray-900 p-2">
				<div className="w-1/6">
					<Button onClick={() => setSideInputsToggled(!sideInputsToggled)}>{sideInputsToggled ? "Hide" : "Show"} Inputs</Button>
				</div>
				<div className="w-4/6">
					<Options />
				</div>
				<div className="w-1/6">
					<RenderButton />
				</div>
			</div>
			<div className="flex h-[94vh] overflow-hidden">
				{sideInputsToggled && (
					<div className="flex w-2/12 flex-col gap-5 overflow-y-scroll p-4">
						<SideInputsComponent />
					</div>
				)}
				<div className={`flex flex-col items-center justify-center ${sideInputsToggled ? "w-10/12" : "w-full"}`}>
					{input ? (
						<InputComponent input={input} />
					) : (
						<>
							<div className="m-5 text-5xl font-bold">clipper-gui</div>
							<div className="text-2xl">Drag video(s) to this window to get started.</div>
						</>
					)}
				</div>
			</div>
		</InputsStateContext.Provider>
	);
}

export default App;
