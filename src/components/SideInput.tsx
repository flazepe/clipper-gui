import { KeybindHintComponent } from "@/components";
import { Input } from "@/functions/clipper";
import { DeleteIcon, EditIcon } from "@/icons";
import StatesContext from "@/StatesContext";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useContext, useEffect } from "react";

export default function ({ input }: { input: Input }) {
	const {
			clipper: {
				inputs: [inputs, setInputs]
			},
			currentInput: [currentInput, setCurrentInput]
		} = useContext(StatesContext),
		{ attributes, listeners, setNodeRef, transform } = useDraggable({ id: input._dndID }),
		{ setNodeRef: setDroppableNodeRef } = useDroppable({ id: input._dndID });

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (document.activeElement?.tagName === "INPUT" || !currentInput) return;

			if (
				event.key === "ArrowUp" ||
				// Ctrl should not be pressed to avoid conflict with Ctrl + W
				(!event.ctrlKey && event.key.toUpperCase() === "W")
			) {
				const previousInput = inputs.entries[inputs.entries.indexOf(currentInput) - 1] ?? inputs.entries[inputs.entries.length - 1];
				if (previousInput) setCurrentInput?.(previousInput);
			}

			if (event.key === "ArrowDown" || event.key.toUpperCase() === "S") {
				const nextInput = inputs.entries[inputs.entries.indexOf(currentInput) + 1] ?? inputs.entries[0];
				if (nextInput) setCurrentInput?.(nextInput);
			}

			if (event.ctrlKey && event.key.toUpperCase() === "W") deleteInput(currentInput);
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	});

	const deleteInput = (input: Input) =>
		setInputs?.(inputs => {
			const index = inputs.entries.indexOf(input),
				[deletedInput] = inputs.entries.splice(index, 1);

			if (!inputs.entries.some(entry => entry._src === deletedInput._src)) URL.revokeObjectURL(deletedInput._src);

			if (currentInput === input) setCurrentInput?.(inputs.entries[Math.max(0, index - 1)] ?? null);
			return { ...inputs };
		});

	return (
		<div
			ref={setDroppableNodeRef}
			style={{ transform: CSS.Translate.toString(transform), opacity: transform ? 0.7 : 1 }}
			className="flex flex-col text-lg"
		>
			<div ref={setNodeRef} {...listeners} {...attributes} className="cursor-move break-all rounded-t bg-gray-800 p-2 text-center">
				{input.file.split(/[/\\]/).pop()}
			</div>
			<div className="flex">
				<div
					onClick={() => setCurrentInput?.(input)}
					className="flex w-1/2 cursor-pointer items-center justify-center gap-3 rounded-bl bg-gray-700 p-2 uppercase"
				>
					<EditIcon className="w-7 fill-white" />
					{currentInput === input ? "Editing" : "Edit"}
					{currentInput === input && (
						<>
							<KeybindHintComponent>↑</KeybindHintComponent>
							<KeybindHintComponent>↓</KeybindHintComponent>
						</>
					)}
				</div>
				<div
					onClick={() => deleteInput(input)}
					className="flex w-1/2 cursor-pointer items-center justify-center gap-3 rounded-br bg-red-600 p-2 uppercase"
				>
					<DeleteIcon className="w-7 fill-white" />
					Delete
					{currentInput === input && <KeybindHintComponent>Ctrl + W</KeybindHintComponent>}
				</div>
			</div>
		</div>
	);
}
