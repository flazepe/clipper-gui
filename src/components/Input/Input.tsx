import InputController from "@/classes/InputController";
import { InputSegmentsComponent, InputTracksComponent, InputVideoComponent } from "@/components";
import { Input } from "@/functions/clipper";
import { useEffect } from "react";

export default function ({ currentInput }: { currentInput: Input }) {
	const c = new InputController(currentInput);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === " ") c.playorPause();
			if (event.key === "ArrowLeft" || event.key.toUpperCase() === "A") c.currentTime -= event.shiftKey ? 1 : event.ctrlKey ? 5 : 3;
			if (event.key === "ArrowRight" || event.key.toUpperCase() === "D") c.currentTime += event.shiftKey ? 1 : event.ctrlKey ? 5 : 3;
			if (event.key === "F11") c.fullscreen();
			if (event.key === "Enter") c.addCurrentSegment();
			if (event.key === "Backspace") c.deleteSegment([c.segmentStart, c.segmentEnd]);
			if (event.key.toUpperCase() === "Q") c.currentTime < c.segmentEnd && c.setSegmentStart(c.currentTime);
			if (event.key.toUpperCase() === "E") c.currentTime > c.segmentStart && c.setSegmentEnd(c.currentTime);
			if (event.key.toUpperCase() === "P") c.playSegment([c.segmentStart, c.segmentEnd]);
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	});

	return (
		<>
			<div className="flex h-5/6 w-full bg-gray-950">
				<div className="flex w-1/6 flex-col items-center justify-center gap-10 p-5 text-xl">
					<InputTracksComponent controller={c} />
				</div>
				<div className="flex w-4/6 flex-col justify-center gap-5 overflow-y-auto overflow-x-hidden bg-black p-5">
					<InputVideoComponent controller={c} />
				</div>
				<div className="w-1/6" />
			</div>
			<div className="flex h-1/6 w-full items-center bg-gray-950 px-8">
				<InputSegmentsComponent controller={c} />
			</div>
		</>
	);
}
