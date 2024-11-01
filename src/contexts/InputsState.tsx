import { createContext, Dispatch, SetStateAction } from "react";
import { Input } from "../components/Input";

export default createContext<[Array<Input>, Dispatch<SetStateAction<Array<Input>>> | null]>([[], null]);
