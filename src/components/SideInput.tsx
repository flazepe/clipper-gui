import { KeybindHintComponent } from "@/components";
import { InputsStateContext, InputStateContext } from "@/contexts";
import { Input } from "@/functions/clipper";
import { DeleteIcon, EditIcon } from "@/icons";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useContext, useEffect } from "react";

export default function ({ input }: { input: Input }) {
	const [, setInputs] = useContext(InputsStateContext),
		[currentInput, setInput] = useContext(InputStateContext),
		{ attributes, listeners, setNodeRef, transform } = useDraggable({ id: input._dndID }),
		{ setNodeRef: setDroppableNodeRef } = useDroppable({ id: input._dndID });

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => event.ctrlKey && event.key.toLowerCase() === "w" && currentInput && deleteInput(currentInput);
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	});

	const deleteInput = (input: Input) =>
		setInputs?.(inputs => {
			const index = inputs.inputs.indexOf(input);
			inputs.inputs.splice(index, 1);
			if (currentInput === input) setInput?.(inputs.inputs[Math.max(0, index - 1)] ?? null);
			return { ...inputs };
		});

	return (
		<div
			ref={setDroppableNodeRef}
			style={{ transform: CSS.Translate.toString(transform), opacity: transform ? 0.7 : 1 }}
			className="flex flex-col text-lg"
		>
			<div ref={setNodeRef} {...listeners} {...attributes} className="cursor-move rounded-t bg-gray-800 p-2 text-center">
				{input.file.split(/[/\\]/).pop()}
			</div>
			<div className="flex">
				<div
					onClick={() => setInput?.(input)}
					className="flex w-1/2 cursor-pointer items-center justify-center gap-3 rounded-bl bg-gray-700 p-2 uppercase"
				>
					<EditIcon className="w-7 fill-white" />
					{currentInput === input ? "Editing" : "Edit"}
				</div>
				<div
					onClick={() => deleteInput(input)}
					className="flex w-1/2 cursor-pointer items-center justify-center gap-3 rounded-br bg-red-500 p-2 uppercase"
				>
					<DeleteIcon className="w-7 fill-white" />
					Delete
					{currentInput === input && <KeybindHintComponent>Ctrl + W</KeybindHintComponent>}
				</div>
			</div>
		</div>
	);
}
