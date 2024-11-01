import { createContext } from "react";
import { Options } from "../components/Options";

export default createContext<Options>({ fade: false, noVideo: false, noAudio: false, dryRun: false });
