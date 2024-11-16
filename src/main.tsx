import { AppComponent } from "@/components";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "simplebar-react/dist/simplebar.min.css";
import "./style.css";

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<AppComponent />
	</StrictMode>
);
