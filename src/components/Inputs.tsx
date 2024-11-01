import { useContext } from "react";
import InputsStateContext from "../contexts/InputsState";
import Button from "./Button";
import InputComponent from "./Input";
import Options from "./Options";
import RenderButton from "./RenderButton";

export default function () {
	const [inputs] = useContext(InputsStateContext);

	return (
		<div className="my-10 inline-flex h-full w-full flex-col items-center gap-5">
			<Button onClick={() => window.location.reload()} title="Reset">
				Reset
			</Button>
			<Options />
			<div className="m-5 flex flex-wrap justify-center gap-10">
				{inputs.inputs.map((input, index) => (
					<InputComponent input={input} key={index} />
				))}
			</div>
			<RenderButton />
		</div>
	);
}
