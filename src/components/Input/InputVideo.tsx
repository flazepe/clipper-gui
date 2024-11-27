import InputController from "@/classes/InputController";
import { ButtonComponent, KeybindHintComponent } from "@/components";
import { durationToSeconds, secondsToDuration } from "@/functions/seconds";
import { AddIcon, PlayIcon, RayEndIcon, RayStartIcon } from "@/icons";
import MultiRangeSlider from "multi-range-slider-react";

export default function ({ controller: c }: { controller: InputController }) {
	return (
		<div className="flex w-full flex-col justify-center gap-5 bg-black p-5">
			<div className="truncate text-center text-2xl font-bold">{c.filename}</div>
			<video
				src={c.currentInput._src}
				controls
				onLoadedMetadata={event => {
					c.setVideo(event.currentTarget);
					c.setSegmentStart(0);
					c.setSegmentEnd(Math.trunc(event.currentTarget.duration));
				}}
				onPlay={event => {
					const currentTime = Math.trunc(event.currentTarget.currentTime);

					if (currentTime < c.segmentStart || currentTime >= c.segmentEnd) {
						event.currentTarget.pause();
						c.currentTime = c.segmentStart;
						event.currentTarget.play();
					}
				}}
				onTimeUpdate={event => {
					// Psuse the player if the current time is outside segment range
					const currentTime = Math.trunc(event.currentTarget.currentTime);
					if (currentTime < c.segmentStart || currentTime >= c.segmentEnd) event.currentTarget.pause();
				}}
				onFocus={event => event.currentTarget.blur() /* Do not let player focus to ignore default keybinds */}
				className="h-3/5"
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
						<ButtonComponent onClick={() => c.currentTime < c.segmentEnd && c.setSegmentStart(c.currentTime)} className="w-1/2">
							<RayStartIcon className="w-10 fill-white" />
							Set current time as start
							<KeybindHintComponent>Q</KeybindHintComponent>
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
						<ButtonComponent onClick={() => c.currentTime > c.segmentStart && c.setSegmentEnd(c.currentTime)} className="w-1/2">
							<RayEndIcon className="w-10 fill-white" />
							Set current time as end
							<KeybindHintComponent>E</KeybindHintComponent>
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
	);
}
