import { listen, TauriEvent } from "@tauri-apps/api/event";
import { useContext, useEffect, useState } from "react";
import InputsStateContext from "../contexts/InputsState";
import { SUPPORTED_EXTENSIONS } from "../functions/clipper";
import Inputs from "./Inputs";

function App(): JSX.Element {
	const [isDragged, setIsDragged] = useState(false),
		[inputs, setInputs] = useState(useContext(InputsStateContext)[0]);

	useEffect(() => {
		const fns = [
			listen<{ paths: Array<string> }>(TauriEvent.DRAG_ENTER, event => event.payload.paths.length && setIsDragged(true)),
			listen(TauriEvent.DRAG_LEAVE, () => setIsDragged(false)),
			listen<{ paths: Array<string> }>(TauriEvent.DRAG_DROP, event => {
				setIsDragged(false);

				setInputs?.({
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
				});
			})
		];

		return () => void Promise.all(fns).then(fns => fns.forEach(fn => fn()));
	});

	return (
		<InputsStateContext.Provider value={[inputs, setInputs]}>
			<div className="flex min-h-screen flex-col items-center p-4">
				{isDragged && (
					<div
						className={`fixed left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-gray-700 text-5xl font-bold text-white`}
					>
						Drop the file(s) NOW!
					</div>
				)}
				<div className="text-4xl font-bold">clipper-gui</div>
				<Inputs />
			</div>
		</InputsStateContext.Provider>
	);
}

export default App;
