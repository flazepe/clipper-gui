import { createContext, Dispatch, SetStateAction } from "react";
import { Input } from "../functions/clipper";

export default createContext<[Input | null, Dispatch<SetStateAction<Input | null>> | null]>([null, null]);
