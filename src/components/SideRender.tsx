import { Render } from "@/functions/clipper";
import { CancelIcon } from "@/icons";
import StatesContext from "@/StatesContext";
import { useContext } from "react";

export default function ({ render }: { render: Render }) {
	const {
		renders: [, setRenders]
	} = useContext(StatesContext);

	return (
		<div className="flex flex-col text-lg">
			<div className="rounded-t bg-gray-800 p-2 text-center">{render.filename.split(/[/\\]/).pop()}</div>
			<div className="h-4 bg-slate-300">
				<div className="h-full bg-green-500" style={{ width: `${render.progress}%` }}></div>
			</div>
			<div
				onClick={() => {
					render.child.kill().catch(() => null);
					setRenders?.(renders => renders.filter(entry => entry !== render)); // In case killing does not emit the close event
				}}
				className="flex cursor-pointer items-center justify-center gap-2 rounded-b bg-red-600 p-2 uppercase"
			>
				<CancelIcon className="w-7 fill-white" />
				Cancel
			</div>
		</div>
	);
}
