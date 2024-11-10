import { Output } from "@/functions/clipper";
import { createContext } from "react";

export default createContext<Output>({ file: null, forceOverwrite: true, forceNotOverwrite: false, dryRun: false });
