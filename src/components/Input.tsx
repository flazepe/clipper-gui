import MultiRangeSlider from "multi-range-slider-react";
import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";
import { durationToSeconds, secondsToDuration } from "../functions/seconds";
import { Input } from "./App";
import Button from "./Button";

export default function ({ input, setInputs }: { input: Input; setInputs: Dispatch<SetStateAction<Input[]>> }) {
	const [video, setVideo] = useState<HTMLVideoElement | null>(null),
		[segmentStart, setSegmentStart] = useState(0),
		[segmentEnd, setSegmentEnd] = useState(0),
		segmentStartInput = useRef<HTMLInputElement>(null),
		segmentEndInput = useRef<HTMLInputElement>(null);

	return (
		<div className="flex w-full flex-col gap-2 rounded border-2 border-gray-500 p-5 lg:w-5/12">
			<div className="my-2 text-2xl font-bold">
				{input.name}
				<span onClick={() => setInputs(inputs => inputs.filter(entry => entry !== input))} className="ml-2 cursor-pointer text-red-500">
					(delete)
				</span>
			</div>
			<video
				src={input.src}
				ref={useCallback((video: HTMLVideoElement | null) => setVideo(video), [])}
				onLoadedMetadata={event => {
					setVideo(event.currentTarget);
					setSegmentEnd(event.currentTarget.duration);
				}}
				onTimeUpdate={event => {
					const currentTime = event.currentTarget.currentTime;
					if (!(currentTime >= segmentStart && currentTime <= segmentEnd)) event.currentTarget.pause();
				}}
				onClick={event => {
					const currentTime = event.currentTarget.currentTime;
					return event.currentTarget.paused && currentTime >= segmentStart && currentTime <= segmentEnd
						? event.currentTarget.play()
						: event.currentTarget.pause();
				}}
			/>
			{video && segmentEnd > 0 && (
				<>
					<div className="flex flex-col gap-5 text-center text-2xl">
						<MultiRangeSlider
							min={0}
							max={video.duration}
							minValue={segmentStart}
							maxValue={segmentEnd}
							labels={[""]}
							minCaption={secondsToDuration(segmentStart)}
							maxCaption={secondsToDuration(segmentEnd)}
							step={1}
							ruler={false}
							barInnerColor="#7272ff"
							barLeftColor="gray"
							barRightColor="gray"
							onInput={event => {
								if (event.minValue !== segmentStart) video.currentTime = event.minValue;
								if (event.maxValue !== segmentEnd) video.currentTime = Math.max(0, event.maxValue - 1);

								setSegmentStart(event.minValue);
								if (segmentStartInput.current) segmentStartInput.current.value = secondsToDuration(event.minValue);

								setSegmentEnd(event.maxValue);
								if (segmentEndInput.current) segmentEndInput.current.value = secondsToDuration(event.maxValue);
							}}
						/>
						<div className="flex items-center justify-center gap-2">
							<input
								ref={segmentStartInput}
								type="text"
								defaultValue={secondsToDuration(segmentStart)}
								onBlur={event => {
									const seconds = durationToSeconds(event.currentTarget.value);

									if (seconds >= 0 && seconds < segmentEnd) {
										setSegmentStart(seconds);
										event.currentTarget.value = secondsToDuration(seconds).toString();
									} else {
										event.currentTarget.value = secondsToDuration(segmentStart).toString();
									}
								}}
								className="w-28 text-center"
							/>
							-
							<input
								ref={segmentEndInput}
								type="text"
								defaultValue={secondsToDuration(segmentEnd)}
								onBlur={event => {
									const seconds = durationToSeconds(event.currentTarget.value);

									if (seconds <= video.duration && seconds > segmentStart) {
										setSegmentEnd(seconds);
										event.currentTarget.value = secondsToDuration(seconds).toString();
									} else {
										event.currentTarget.value = secondsToDuration(segmentEnd).toString();
									}
								}}
								className="w-28 text-center"
							/>
						</div>
						<div className="flex justify-center gap-2">
							<Button
								onClick={() => {
									video.currentTime = segmentStart;
									video.play();
								}}
								className="w-1/3"
							>
								Play ({secondsToDuration(segmentEnd - segmentStart)})
							</Button>
							<Button
								onClick={() => {
									if (!segmentEnd || segmentStart >= segmentEnd || segmentEnd <= segmentStart) return;

									setInputs(inputs => {
										if (!input.segments.find(segment => segment[0] === segmentStart && segment[1] === segmentEnd))
											input.segments.push([segmentStart, segmentEnd]);
										return [...inputs];
									});
								}}
								className="w-1/3"
							>
								Add Segment
							</Button>
						</div>
					</div>
					{!!input.segments.length && <div className="text-2xl font-bold">Segments</div>}
					{input.segments.map((segment, index) => (
						<div className="w-80 cursor-pointer text-xl" key={index}>
							<span
								onClick={() => {
									setSegmentStart(segment[0]);
									setSegmentEnd(segment[1]);
									video.currentTime = segment[0];
									video.play();
								}}
							>
								{segment.map(entry => secondsToDuration(entry, true)).join("-")} ({secondsToDuration(segment[1] - segment[0], true)})
							</span>
							<span
								onClick={() =>
									setInputs(inputs => {
										const inputToEdit = inputs.find(entry => entry === input);
										if (inputToEdit) inputToEdit.segments.splice(index, 1);
										return [...inputs];
									})
								}
								className="ml-2 text-red-500"
							>
								(delete)
							</span>
						</div>
					))}
				</>
			)}
		</div>
	);
}
