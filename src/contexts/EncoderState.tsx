import { createContext, Dispatch, SetStateAction } from "react";
import { Encoder } from "@/functions/clipper";

export default createContext<[Encoder, Dispatch<SetStateAction<Encoder>> | null]>([
	{ nvenc: false, hevc: false, preset: null, crf: null, cq: null },
	null
]);
