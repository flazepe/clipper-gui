import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useContext, useEffect } from "react";
import InputsStateContext from "../contexts/InputsState";
import InputStateContext from "../contexts/InputState";
import { Input } from "../functions/clipper";
import DeleteIcon from "../icons/Delete";
import EditIcon from "../icons/Edit";

export default function ({ input }: { input: Input }) {
	const [inputs, setInputs] = useContext(InputsStateContext),
		[currentInput, setInput] = useContext(InputStateContext),
		{ attributes, listeners, setNodeRef, transform } = useDraggable({ id: input._dndID }),
		{ setNodeRef: setDroppableNodeRef } = useDroppable({ id: input._dndID });

	useEffect(() => {
		const fn = (event: KeyboardEvent) => event.ctrlKey && event.key.toLowerCase() === "w" && deleteInput();
		document.addEventListener("keyup", fn);
		return () => document.removeEventListener("keyup", fn);
	});

	const deleteInput = () => {
		const index = inputs.inputs.indexOf(input);
		inputs.inputs.splice(index, 1);

		setInputs?.({ ...inputs });
		setInput?.(inputs.inputs[index - 1] ?? null);
	};

	return (
		<div
			ref={setNodeRef}
			style={{ transform: CSS.Translate.toString(transform), opacity: transform ? 0.7 : 1 }}
			className="flex cursor-pointer flex-col text-lg"
		>
			<div ref={setDroppableNodeRef} {...listeners} {...attributes} className="cursor-move rounded-t bg-gray-800 p-2 text-center">
				{input.file.split(/[/\\]/).pop()}
			</div>
			<div className="flex">
				<div onClick={() => setInput?.(input)} className="flex w-1/2 items-center justify-center gap-3 rounded-bl bg-gray-700 p-2 uppercase">
					<div className="w-7 fill-white">
						<EditIcon />
					</div>
					{currentInput === input ? "Editing" : "Edit"}
				</div>
				<div onClick={deleteInput} className={`flex w-1/2 items-center justify-center gap-3 rounded-br bg-red-500 p-2 uppercase`}>
					<div className="w-7 fill-white">
						<DeleteIcon />
					</div>
					Delete
				</div>
			</div>
		</div>
	);
}
