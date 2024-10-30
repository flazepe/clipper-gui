import { Dispatch, SetStateAction, useRef, useState } from "react";
import formatSeconds from "../functions/formatSeconds";
import { Input } from "./App";
import Button from "./Button";

export default function ({ input, setInputs }: { input: Input; setInputs: Dispatch<SetStateAction<Input[]>> }) {
	const video = useRef<HTMLVideoElement>(null),
		[segmentStart, setSegmentStart] = useState(0),
		[segmentEnd, setSegmentEnd] = useState(0);

	return (
		<div>
			<video ref={video} src={input.src} controls className="w-96" />
			<div className="text-2xl font-bold text-center">
				{formatSeconds(segmentStart)}-{formatSeconds(segmentEnd)}
			</div>
			<div className="flex justify-center gap-2">
				<Button onClick={() => setSegmentStart(video.current?.currentTime ?? 0)} className="w-full">
					Start
				</Button>
				<Button onClick={() => setSegmentEnd(video.current?.currentTime ?? 0)} className="w-full">
					End
				</Button>
			</div>
			<Button
				onClick={() => {
					if (!segmentEnd || segmentStart >= segmentEnd || segmentEnd <= segmentStart) return;

					const segment = `${formatSeconds(segmentStart)}-${formatSeconds(segmentEnd)}`;

					setInputs(inputs => {
						const inputToEdit = inputs.find(entry => entry.id === input.id);
						if (inputToEdit && !inputToEdit.segments.includes(segment)) inputToEdit.segments.push(segment);
						return JSON.parse(JSON.stringify(inputs));
					});

					setSegmentStart(0);
					setSegmentEnd(0);
				}}
			>
				Add
			</Button>
		</div>
	);
}
