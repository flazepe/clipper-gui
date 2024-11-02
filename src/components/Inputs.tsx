import { useContext } from "react";
import InputsStateContext from "../contexts/InputsState";
import Button from "./Button";
import InputComponent from "./Input";
import Options from "./Options";
import RenderButton from "./RenderButton";
import { DndContext } from "@dnd-kit/core";

export default function () {
	const [inputs, setInputs] = useContext(InputsStateContext);

	return (
		<div className="my-10 inline-flex h-full w-full flex-col items-center gap-5">
			<Button onClick={() => window.location.reload()} title="Reset">
				Reset
			</Button>
			<Options />
			<div className="m-5 flex flex-wrap justify-center gap-10">
				<DndContext
					onDragEnd={event => {
						if (!event.over || event.active.id === event.over.id) return;

						const [oldInput] = inputs.inputs.splice(
							inputs.inputs.findIndex(input => input._dndID === event.active.id),
							1
						);

						inputs.inputs.splice(
							inputs.inputs.findIndex(input => input._dndID === event.over!.id),
							0,
							oldInput
						);

						setInputs?.({ ...inputs });
					}}
				>
					{inputs.inputs.map((input, index) => (
						<InputComponent input={input} key={index} />
					))}
				</DndContext>
			</div>
			<RenderButton />
		</div>
	);
}
