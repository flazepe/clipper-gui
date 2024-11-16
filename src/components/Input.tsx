import InputController from "@/classes/InputController";
import { ButtonComponent, InputSegmentComponent, KeybindHintComponent } from "@/components";
import { Input } from "@/functions/clipper";
import { durationToSeconds, secondsToDuration } from "@/functions/seconds";
import { AddIcon, PlayIcon } from "@/icons";
import { DndContext } from "@dnd-kit/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import MultiRangeSlider from "multi-range-slider-react";
import { useCallback, useEffect } from "react";
import SimpleBar from "simplebar-react";

export default function ({ input }: { input: Input }) {
	const c = new InputController(input);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === " ") c.playorPause();
			if (event.key === "Enter") c.addCurrentSegment();
			if (event.key === "Backspace") c.deleteSegment(c.input.segments[c.input.segments.length - 1]);
			if (event.key === "ArrowLeft") c.currentTime -= event.shiftKey ? 1 : event.ctrlKey ? 5 : 3;
			if (event.key === "ArrowRight") c.currentTime += event.shiftKey ? 1 : event.ctrlKey ? 5 : 3;
			if (event.key.toUpperCase() === "S") c.setSegmentStart(c.currentTime);
			if (event.key.toUpperCase() === "E") c.setSegmentEnd(c.currentTime);
			if (event.key.toUpperCase() === "P") c.playSegment([c.segmentStart, c.segmentEnd]);
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	});

	return (
		<>
			<div className="flex h-5/6">
				<div className="flex w-60 flex-col items-center justify-center gap-10 bg-gray-950 p-5 text-xl">
					<div className="flex flex-col gap-2">
						<div className="text-2xl font-bold uppercase">Tracks</div>
						Video:
						<input
							type="number"
							min={0}
							value={c.input.videoTrack}
							onChange={event => c.setTrack("video", Number(event.currentTarget.value))}
							className="w-20"
						/>
						Audio:
						<input
							type="number"
							min={0}
							value={c.input.audioTrack}
							onChange={event => c.setTrack("audio", Number(event.currentTarget.value))}
							className="w-20"
						/>
						<div onClick={() => c.setTrack("subtitle", c.input.subtitleTrack !== null ? -1 : 0)} className="flex cursor-pointer gap-2">
							<input type="checkbox" checked={c.input.subtitleTrack !== null} readOnly />
							Subtitle:
						</div>
						{c.input.subtitleTrack === null ? (
							<input type="number" value="" readOnly className="w-20" />
						) : (
							<input
								type="number"
								min={0}
								value={c.input.subtitleTrack}
								onChange={event => c.setTrack("subtitle", Number(event.currentTarget.value))}
								className="w-20"
							/>
						)}
					</div>
					<div className="flex flex-col gap-2">
						<div className="text-2xl font-bold uppercase">Speed</div>
						Multiplier
						<input
							type="number"
							min={0.5}
							max={100}
							value={c.input.speed}
							onChange={event => c.setSpeed(Number(event.currentTarget.value))}
							className="w-20"
						/>
					</div>
				</div>
				<div className="flex flex-col justify-center gap-5 overflow-y-auto overflow-x-hidden p-5">
					<div className="text-center text-2xl font-bold">{c.filename}</div>
					<video
						ref={useCallback((video: HTMLVideoElement | null) => c.setVideo(video), [])}
						src={convertFileSrc(c.input.file)}
						controls
						onLoadedMetadata={event => {
							c.setVideo(event.currentTarget);
							c.setSegmentStart(0);
							c.setSegmentEnd(Math.trunc(event.currentTarget.duration));
						}}
						onTimeUpdate={event => {
							const currentTime = Math.trunc(event.currentTarget.currentTime);
							if (currentTime < c.segmentStart || currentTime >= c.segmentEnd) event.currentTarget.pause();
						}}
						onClick={event => {
							event.preventDefault();
							c.playorPause();
						}}
						onFocus={event => event.currentTarget.blur()}
						className="h-3/5 w-screen"
					/>
					{c.ready && (
						<div className="flex flex-col gap-5 text-2xl">
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
								barInnerColor="#1d4ed8"
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
								<ButtonComponent onClick={() => c.setSegmentStart(c.currentTime)} className="w-1/2">
									Set current time as start <KeybindHintComponent>S</KeybindHintComponent>
								</ButtonComponent>
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
									className="w-28"
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
									className="w-28"
								/>
								<ButtonComponent onClick={() => c.setSegmentEnd(c.currentTime)} className="w-1/2">
									Set current time as end <KeybindHintComponent>E</KeybindHintComponent>
								</ButtonComponent>
							</div>
							<div className="flex gap-2">
								<ButtonComponent onClick={() => c.playSegment([c.segmentStart, c.segmentEnd])} className="w-1/2">
									<PlayIcon className="w-10 fill-white" />
									Play ({secondsToDuration(c.segmentEnd - c.segmentStart)}) <KeybindHintComponent>P</KeybindHintComponent>
								</ButtonComponent>
								<ButtonComponent onClick={() => c.addCurrentSegment()} className="w-1/2">
									<AddIcon className="w-10 fill-white" />
									Add <KeybindHintComponent>Enter</KeybindHintComponent>
								</ButtonComponent>
							</div>
						</div>
					)}
				</div>
				<div className="w-60 bg-gray-950" />
			</div>
			<div className="flex h-full w-full items-center bg-gray-950 px-8">
				<SimpleBar className="w-full py-4">
					<div className="flex flex-row gap-4">
						<DndContext
							onDragEnd={event => {
								if (!event.over || event.active.id === event.over.id) return;

								const oldIndex = input.segments.findIndex(segment => segment.toString() === event.active.id),
									newIndex = input.segments.findIndex(segment => segment.toString() === event.over?.id),
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
				</SimpleBar>
			</div>
		</>
	);
}
