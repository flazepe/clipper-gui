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
			{!inputs.entries[0] && <div className="text-center text-xl font-bold uppercase text-gray-400">Empty</div>}
			<div className="flex flex-col gap-4 font-bold">
				<DndContext
					onDragEnd={event => {
						if (!event.over || event.active.id === event.over.id) return;

						const oldIndex = inputs.entries.findIndex(input => input._dndID === event.active.id),
							newIndex = inputs.entries.findIndex(input => input._dndID === event.over?.id),
							[oldInput] = inputs.entries.splice(oldIndex, 1);

						inputs.entries.splice(newIndex, 0, oldInput);
						setInputs?.({ ...inputs });
					}}
				>
					{inputs.entries.map((input, index) => (
						<SideInputComponent input={input} key={index} />
					))}
				</DndContext>
			</div>
		</>
	);
}
