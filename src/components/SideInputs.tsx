import { SideInputComponent } from "@/components";
import StatesContext from "@/StatesContext";
import { DndContext } from "@dnd-kit/core";
import { useContext } from "react";

export default function () {
	const {
		clipper: {
			inputs: [inputs, setInputs]
		}
	} = useContext(StatesContext);

	return (
		<>
			<div className="my-2 text-2xl font-bold uppercase">Inputs</div>
			{!inputs.inputs[0] && <div className="flex justify-center text-xl font-bold uppercase text-gray-400">Empty</div>}
			<div className="flex flex-col gap-4 font-bold">
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
		</>
	);
}
