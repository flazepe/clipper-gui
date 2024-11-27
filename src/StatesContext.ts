import { createContext, Dispatch, SetStateAction } from "react";
import { Encoder, Output, Inputs, Input, Render } from "@/functions/clipper";

export interface States {
	clipper: {
		inputs: [Inputs, Dispatch<SetStateAction<Inputs>> | null];
		encoder: [Encoder, Dispatch<SetStateAction<Encoder>> | null];
		output: [Output, Dispatch<SetStateAction<Output>> | null];
	};
	sideInputsToggled: [boolean, Dispatch<SetStateAction<boolean>> | null];
	currentInput: [Input | null, Dispatch<SetStateAction<Input | null>> | null];
	renders: [Array<Render>, Dispatch<SetStateAction<Array<Render>>> | null];
}

export default createContext<States>({
	clipper: {
		inputs: [{ entries: [], fade: 0, resize: null, noVideo: false, noAudio: false }, null],
		encoder: [{ nvenc: false, hevc: false, preset: null, crf: null, cq: null }, null],
		output: [{ file: null, forceOverwrite: true, forceNotOverwrite: false, dryRun: false }, null]
	},
	sideInputsToggled: [false, null],
	currentInput: [null, null],
	renders: [[], null]
});
