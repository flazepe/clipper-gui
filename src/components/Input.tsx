import MultiRangeSlider from "multi-range-slider-react";
import { useCallback, useContext } from "react";
import { durationToSeconds, secondsToDuration } from "../functions/seconds";
import { Input } from "./App";
import Button from "./Button";
import InputController from "../classes/InputController";
import InputsStateContext from "../contexts/InputsState";

export default function ({ input }: { input: Input }) {
	const [, setInputs] = useContext(InputsStateContext),
		c = new InputController(input);

	return (
		<div className="flex w-full flex-col gap-2 rounded border-2 border-gray-500 p-5 lg:w-5/12">
			<div className="my-2 text-2xl font-bold">
				{input.name}
				<span onClick={() => setInputs!(inputs => inputs.filter(entry => entry !== input))} className="ml-2 cursor-pointer text-red-500">
					(delete)
				</span>
			</div>
			<video
				src={input.src}
				ref={useCallback((video: HTMLVideoElement | null) => c.setVideo(video), [])}
				onLoadedMetadata={event => {
					c.setVideo(event.currentTarget);
					c.setSegmentEnd(event.currentTarget.duration);
				}}
				onTimeUpdate={event => {
					const currentTime = event.currentTarget.currentTime;
					if (!(currentTime >= c.segmentStart && currentTime <= c.segmentEnd)) event.currentTarget.pause();
				}}
				onClick={() => c.playorPause()}
			/>
			{c.ready && (
				<>
					<div className="flex flex-col gap-5 text-center text-2xl">
						<MultiRangeSlider
							min={0}
							max={c.duration}
							minValue={c.segmentStart}
							maxValue={c.segmentEnd}
							labels={[""]}
							minCaption={secondsToDuration(c.segmentStart)}
							maxCaption={secondsToDuration(c.segmentEnd)}
							step={1}
							ruler={false}
							barInnerColor="#7272ff"
							barLeftColor="gray"
							barRightColor="gray"
							onInput={event => {
								if (event.minValue !== c.segmentStart) c.currentTime = event.minValue;
								if (event.maxValue !== c.segmentEnd) c.currentTime = Math.max(0, event.maxValue - 1);

								c.setSegmentStart(event.minValue);
								if (c.segmentStartInput.current) c.segmentStartInput.current.value = secondsToDuration(event.minValue);

								c.setSegmentEnd(event.maxValue);
								if (c.segmentEndInput.current) c.segmentEndInput.current.value = secondsToDuration(event.maxValue);
							}}
						/>
						<div className="flex items-center justify-center gap-2">
							<input
								ref={c.segmentStartInput}
								type="text"
								defaultValue={secondsToDuration(c.segmentStart)}
								onBlur={event => {
									const seconds = durationToSeconds(event.currentTarget.value);

									if (seconds >= 0 && seconds < c.segmentEnd) {
										c.setSegmentStart(seconds);
										event.currentTarget.value = secondsToDuration(seconds).toString();
									} else {
										event.currentTarget.value = secondsToDuration(c.segmentStart).toString();
									}
								}}
								className="w-28 text-center"
							/>
							-
							<input
								ref={c.segmentEndInput}
								type="text"
								defaultValue={secondsToDuration(c.segmentEnd)}
								onBlur={event => {
									const seconds = durationToSeconds(event.currentTarget.value);

									if (seconds <= c.duration && seconds > c.segmentStart) {
										c.setSegmentEnd(seconds);
										event.currentTarget.value = secondsToDuration(seconds).toString();
									} else {
										event.currentTarget.value = secondsToDuration(c.segmentEnd).toString();
									}
								}}
								className="w-28 text-center"
							/>
						</div>
						<div className="flex justify-center gap-2">
							<Button
								onClick={() => {
									c.currentTime = c.segmentStart;
									c.play();
								}}
								className="w-1/3"
							>
								Play ({secondsToDuration(c.segmentEnd - c.segmentStart)})
							</Button>
							<Button
								onClick={() => {
									if (!c.segmentEnd || c.segmentStart >= c.segmentEnd || c.segmentEnd <= c.segmentStart) return;

									setInputs!(inputs => {
										if (!input.segments.find(segment => segment[0] === c.segmentStart && segment[1] === c.segmentEnd))
											input.segments.push([c.segmentStart, c.segmentEnd]);
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
									c.setSegmentStart(segment[0]);
									c.setSegmentEnd(segment[1]);
									c.currentTime = segment[0];
									c.play();
								}}
							>
								{segment.map(entry => secondsToDuration(entry, true)).join("-")} ({secondsToDuration(segment[1] - segment[0], true)})
							</span>
							<span
								onClick={() =>
									setInputs!(inputs => {
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
