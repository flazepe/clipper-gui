import InputController from "@/classes/InputController";
import { KeybindHintComponent } from "@/components";
import { secondsToDuration } from "@/functions/seconds";
import { DeleteIcon, PlayIcon } from "@/icons";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function ({ controller: c, segment }: { controller: InputController; segment: [number, number] }) {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: segment.toString() }),
		{ setNodeRef: setDroppableNodeRef } = useDroppable({ id: segment.toString() }),
		isCurrentSegment = segment.toString() === `${c.segmentStart},${c.segmentEnd}`;

	return (
		<div
			ref={setDroppableNodeRef}
			style={{ transform: CSS.Translate.toString(transform), opacity: transform ? 0.7 : 1 }}
			className="flex min-w-72 flex-col rounded bg-gray-700 text-xl font-bold"
		>
			<div ref={setNodeRef} {...listeners} {...attributes} className="cursor-move rounded-t bg-gray-800 p-2 text-center">
				{segment.map(entry => secondsToDuration(entry, true)).join("-")}
			</div>
			<div className="flex">
				<div onClick={() => c.playSegment(segment)} className="flex w-1/2 cursor-pointer justify-center gap-2 p-2">
					<PlayIcon className="w-8 fill-white" />
					{secondsToDuration(segment[1] - segment[0], true)}
					{isCurrentSegment && <KeybindHintComponent>P</KeybindHintComponent>}
				</div>
				<div onClick={() => c.deleteSegment(segment)} className="flex w-1/2 cursor-pointer justify-center gap-2 rounded-br bg-red-600 p-2">
					<DeleteIcon className="w-8 fill-white" />
					{isCurrentSegment && <KeybindHintComponent>Back</KeybindHintComponent>}
				</div>
			</div>
		</div>
	);
}
