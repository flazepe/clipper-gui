import { SideInputComponent } from "@/components";
import { InputsStateContext } from "@/contexts";
import { DndContext } from "@dnd-kit/core";
import { useContext } from "react";

export default function () {
	const [inputs, setInputs] = useContext(InputsStateContext);

	return (
		<>
			<div className="my-2 text-2xl font-bold uppercase">Inputs</div>
			{inputs.inputs[0] ? (
				<div className="flex flex-col gap-2 font-bold">
					<DndContext
						onDragEnd={event => {
							if (!event.over || event.active.id === event.over.id) return;

							const oldIndex = inputs.inputs.findIndex(input => input._dndID === event.active.id),
								newIndex = inputs.inputs.findIndex(input => input._dndID === event.over?.id),
								[oldInput] = inputs.inputs.splice(oldIndex, 1);

							inputs.inputs.splice(newIndex, 0, oldInput);
							setInputs?.({ ...inputs });
						}}
					>
						{inputs.inputs.map((input, index) => (
							<SideInputComponent input={input} key={index} />
						))}
					</DndContext>
				</div>
			) : (
				<div className="flex h-1/2 items-center justify-center text-xl">No inputs</div>
			)}
		</>
	);
}
