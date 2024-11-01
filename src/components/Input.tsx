import MultiRangeSlider from "multi-range-slider-react";
import { useCallback } from "react";
import InputController from "../classes/InputController";
import { durationToSeconds, secondsToDuration } from "../functions/seconds";
import { Input } from "./App";
import Button from "./Button";

export default function ({ input }: { input: Input }) {
	const c = new InputController(input);

	return (
		<div className="flex w-full flex-col gap-2 rounded border-2 border-gray-500 p-5 lg:w-5/12">
			<div className="my-2 text-2xl font-bold">
				{c.input.filename}
				<span onClick={() => c.delete()} className="ml-2 cursor-pointer text-red-500">
					(delete)
				</span>
			</div>
			<video
				src={c.input.src}
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
							<Button onClick={() => c.addCurrentSegment()} className="w-1/3">
								Add Segment
							</Button>
						</div>
						<div className="flex justify-between">
							<div className="flex items-center gap-2">
								Video track:
								<input
									type="number"
									min={0}
									defaultValue={0}
									onChange={event => (c.input.videoTrack = Number(event.currentTarget.value))}
									className="w-14"
								/>
							</div>
							<div className="flex items-center gap-2">
								Audio track:
								<input
									type="number"
									min={0}
									defaultValue={0}
									onChange={event => (c.input.audioTrack = Number(event.currentTarget.value))}
									className="w-14"
								/>
							</div>
							<div className="flex items-center gap-2">
								Subtitle track:
								<input
									type="number"
									min={0}
									className="w-14"
									onChange={event => (c.input.subtitleTrack = event.currentTarget.value ? Number(event.currentTarget.value) : null)}
								/>
							</div>
						</div>
					</div>
					{!!c.input.segments.length && <div className="text-2xl font-bold">Segments</div>}
					{c.input.segments.map((segment, index) => (
						<div className="w-80 cursor-pointer text-xl" key={index}>
							<span onClick={() => c.playSegment(segment)}>
								{segment.map(entry => secondsToDuration(entry, true)).join("-")} ({secondsToDuration(segment[1] - segment[0], true)})
							</span>
							<span onClick={() => c.deleteSegment(index)} className="ml-2 text-red-500">
								(delete)
							</span>
						</div>
					))}
				</>
			)}
		</div>
	);
}
