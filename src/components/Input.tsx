import MultiRangeSlider from "multi-range-slider-react";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import formatSeconds from "../functions/formatSeconds";
import { Input } from "./App";
import Button from "./Button";

export default function ({ input, setInputs }: { input: Input; setInputs: Dispatch<SetStateAction<Input[]>> }) {
	const [video, setVideo] = useState<HTMLVideoElement | null>(null),
		[segmentStart, setSegmentStart] = useState(0),
		[segmentEnd, setSegmentEnd] = useState(0);

	return (
		<div className="flex w-full flex-col gap-2 rounded border-2 border-gray-500 p-5 lg:w-5/12">
			<div className="my-2 text-xl font-bold">
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
				onClick={event => (event.currentTarget.paused ? event.currentTarget.play() : event.currentTarget.pause())}
			/>
			{video && segmentEnd > 0 && (
				<>
					<div className="text-center text-2xl font-bold">
						<div
							onClick={() => {
								video.currentTime = segmentStart;
								video.play();
							}}
							className="cursor-pointer"
						>
							{formatSeconds(segmentStart)}-{formatSeconds(segmentEnd)}
						</div>
						<MultiRangeSlider
							min={0}
							max={video.duration}
							minValue={segmentStart}
							maxValue={segmentEnd}
							labels={[formatSeconds(video.currentTime), formatSeconds(video.duration)]}
							minCaption={formatSeconds(segmentStart)}
							maxCaption={formatSeconds(segmentEnd)}
							step={1}
							ruler={false}
							barInnerColor="#7272ff"
							barLeftColor="gray"
							barRightColor="gray"
							onChange={() => video.play()}
							onInput={event => {
								if (event.minValue !== segmentStart) video.currentTime = event.minValue;
								if (event.maxValue !== segmentEnd) video.currentTime = Math.max(0, event.maxValue - 1);
								setSegmentStart(event.minValue);
								setSegmentEnd(event.maxValue);
							}}
							className="border-none"
						/>
					</div>
					<Button
						onClick={() => {
							if (!segmentEnd || segmentStart >= segmentEnd || segmentEnd <= segmentStart) return;

							setInputs(inputs => {
								if (!input.segments.find(segment => segment[0] === segmentStart && segment[1] === segmentEnd))
									input.segments.push([segmentStart, segmentEnd]);
								return [...inputs];
							});
						}}
					>
						Add
					</Button>
					<div className="text-xl font-bold">Segments</div>
					{input.segments.map((segment, index) => (
						<div className="cursor-pointer" key={index}>
							<span
								onClick={() => {
									setSegmentStart(segment[0]);
									setSegmentEnd(segment[1]);
									video.currentTime = segment[0];
									video.play();
								}}
							>
								{segment.map(formatSeconds).join("-")}
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
