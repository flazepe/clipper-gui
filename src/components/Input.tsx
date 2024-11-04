import { DndContext } from "@dnd-kit/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import MultiRangeSlider from "multi-range-slider-react";
import { useCallback } from "react";
import InputController from "../classes/InputController";
import { Input } from "../functions/clipper";
import { durationToSeconds, secondsToDuration } from "../functions/seconds";
import AddIcon from "../icons/Add";
import PlayIcon from "../icons/Play";
import Button from "./Button";
import InputSegmentComponent from "./InputSegment";

export default function ({ input }: { input: Input }) {
	const c = new InputController(input);

	return (
		<>
			<div className="flex h-5/6">
				<div className="flex w-60 flex-col items-center justify-center gap-2 bg-gray-950 p-5 text-xl">
					<div className="text-2xl font-bold uppercase">Tracks</div>
					Video
					<input
						type="number"
						min={0}
						value={c.input.videoTrack}
						onChange={event => c.setTrack("video", Number(event.currentTarget.value))}
						className="w-20 text-center"
					/>
					Audio
					<input
						type="number"
						min={0}
						value={c.input.audioTrack}
						onChange={event => c.setTrack("audio", Number(event.currentTarget.value))}
						className="w-20 text-center"
					/>
					<div onClick={() => c.setTrack("subtitle", c.input.subtitleTrack !== null ? -1 : 0)} className="flex cursor-pointer gap-2">
						<input type="checkbox" checked={c.input.subtitleTrack !== null} readOnly />
						Subtitle
					</div>
					{c.input.subtitleTrack !== null && (
						<input
							type="number"
							min={0}
							required={false}
							value={c.input.subtitleTrack}
							onChange={event => c.setTrack("subtitle", Number(event.currentTarget.value))}
							className="w-20 text-center"
						/>
					)}
				</div>
				<div className="flex flex-col justify-center gap-5 overflow-y-auto p-5">
					<div className="text-center text-2xl font-bold">{c.filename}</div>
					<video
						src={convertFileSrc(c.input.file)}
						ref={useCallback((video: HTMLVideoElement | null) => c.setVideo(video), [])}
						onLoadedMetadata={event => {
							c.setVideo(event.currentTarget);
							c.setSegmentEnd(Math.trunc(event.currentTarget.duration));
						}}
						onTimeUpdate={event => {
							const currentTime = Math.trunc(event.currentTarget.currentTime);
							if (currentTime < c.segmentStart || currentTime >= c.segmentEnd) event.currentTarget.pause();
						}}
						onClick={() => c.playorPause()}
						className="h-[55%] w-screen"
					/>
					{c.ready && (
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
									if (event.maxValue !== c.segmentEnd) c.currentTime = event.maxValue;

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
							<div className="flex gap-2">
								<Button onClick={() => c.playSegment([c.segmentStart, c.segmentEnd])} className="w-1/2">
									<div className="w-10 fill-white">
										<PlayIcon />
									</div>
									Play ({secondsToDuration(c.segmentEnd - c.segmentStart)})
								</Button>
								<Button onClick={() => c.addCurrentSegment()} className="w-1/2">
									<div className="w-10 fill-white">
										<AddIcon />
									</div>
									Add
								</Button>
							</div>
						</div>
					)}
				</div>
				<div className="w-60 bg-gray-950" />
			</div>
			<div className="flex h-full w-full items-center gap-4 overflow-y-hidden overflow-x-scroll bg-gray-950 p-4">
				<DndContext
					onDragEnd={event => {
						if (!event.over || event.active.id === event.over.id) return;

						const oldIndex = input.segments.findIndex(segment => segment.toString() === event.active.id),
							newIndex = input.segments.findIndex(segment => segment.toString() === event.over!.id),
							[oldSegment] = input.segments.splice(oldIndex, 1);

						input.segments.splice(newIndex, 0, oldSegment);

						c.setInputs?.({ ...c.inputs });
					}}
				>
					{c.input.segments.map((segment, index) => (
						<InputSegmentComponent controller={c} segment={segment} key={index} />
					))}
				</DndContext>
			</div>
		</>
	);
}
