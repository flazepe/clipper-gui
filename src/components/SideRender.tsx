import { Render } from "@/functions/clipper";
import { CancelIcon } from "@/icons";

export default function ({ render }: { render: Render }) {
	return (
		<div className="flex flex-col text-lg">
			<div className="rounded-t bg-gray-800 p-2 text-center">{render.filename.split(/[/\\]/).pop()}</div>
			<div className="h-4 bg-slate-300">
				<div className="h-full bg-green-500" style={{ width: `${render.progress}%` }}></div>
			</div>
			<div
				onClick={() => render.child.kill().catch(() => null)}
				className="gap-b flex cursor-pointer items-center justify-center rounded-b bg-red-500 p-2 uppercase"
			>
				<CancelIcon className="w-7 fill-white" />
				Cancel
			</div>
		</div>
	);
}
