import { createContext } from "react";

export default createContext<{ dryRun: boolean }>({ dryRun: false });
