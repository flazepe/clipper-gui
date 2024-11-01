import { createContext } from "react";
import { Options } from "../components/Options";

export default createContext<Options>({ dryRun: false });
