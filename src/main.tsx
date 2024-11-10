import { AppComponent } from "@/components";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<AppComponent />
	</StrictMode>
);
