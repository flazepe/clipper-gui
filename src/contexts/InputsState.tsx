import { createContext, Dispatch, SetStateAction } from "react";
import { Inputs } from "../functions/clipper";

export default createContext<[Inputs, Dispatch<SetStateAction<Inputs>> | null]>([{ inputs: [], fade: 0, noVideo: false, noAudio: false }, null]);
