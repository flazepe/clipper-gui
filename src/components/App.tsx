import { convertFileSrc } from "@tauri-apps/api/core";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import InputsStateContext from "../contexts/InputsState";
import { Input, SUPPORTED_EXTENSIONS } from "./Input";
import Inputs from "./Inputs";

function App(): JSX.Element {
	const [isDragged, setIsDragged] = useState(false),
		[inputs, setInputs] = useState<Array<Input>>([]);

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
							filename: path.split(/[/\\]/).pop()!,
							path: path,
							src: convertFileSrc(path),
							segments: [],
							videoTrack: 0,
							audioTrack: 0,
							subtitleTrack: null
						}))
				]);
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
						Drop the file NOW!
					</div>
				)}
				<div className="text-4xl font-bold">clipper-gui</div>
				<Inputs />
			</div>
		</InputsStateContext.Provider>
	);
}

export default App;
