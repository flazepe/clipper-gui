import { Render } from "@/functions/clipper";
import { createContext, Dispatch, SetStateAction } from "react";

export default createContext<[Array<Render>, Dispatch<SetStateAction<Array<Render>>> | null]>([[], null]);
