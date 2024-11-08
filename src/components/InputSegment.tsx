import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import InputController from "../classes/InputController";
import { secondsToDuration } from "../functions/seconds";
import DeleteIcon from "../icons/Delete";
import PlayIcon from "../icons/Play";

export default function ({ controller: c, segment }: { controller: InputController; segment: [number, number] }) {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: segment.toString() }),
		{ setNodeRef: setDroppableNodeRef } = useDroppable({ id: segment.toString() });

	return (
		<div
			ref={setDroppableNodeRef}
			{...listeners}
			{...attributes}
			style={{ transform: CSS.Translate.toString(transform), opacity: transform ? 0.7 : 1 }}
			className="flex min-w-52 flex-col rounded bg-gray-700 text-xl font-bold"
		>
			<div ref={setNodeRef} className="cursor-move rounded-t bg-gray-800 p-2 text-center">
				{segment.map(entry => secondsToDuration(entry, true)).join("-")}
			</div>
			<div className="flex">
				<div onClick={() => c.playSegment(segment)} className="flex w-4/5 cursor-pointer items-center">
					<PlayIcon className="w-8 fill-white" />
					{secondsToDuration(segment[1] - segment[0], true)}
				</div>
				<div onClick={() => c.deleteSegment(segment)} className="flex w-1/5 cursor-pointer rounded-br bg-red-500 p-2">
					<DeleteIcon className="w-8 fill-white" />
				</div>
			</div>
		</div>
	);
}
