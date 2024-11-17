import { Input } from "@/functions/clipper";
import StatesContext from "@/StatesContext";
import { message } from "@tauri-apps/plugin-dialog";
import { useContext, useRef, useState } from "react";

export default class {
	currentInput;
	inputs;
	setInputs;
	private video;
	setVideo;
	segmentStart;
	_setSegmentStart;
	segmentEnd;
	_setSegmentEnd;
	segmentStartInput = useRef<HTMLInputElement>(null);
	segmentEndInput = useRef<HTMLInputElement>(null);

	constructor(currentInput: Input) {
		const {
			clipper: {
				inputs: [inputs, setInputs]
			}
		} = useContext(StatesContext);

		this.currentInput = currentInput;

		this.inputs = inputs;
		this.setInputs = setInputs;

		const [video, setVideo] = useState<HTMLVideoElement | null>(null);
		this.video = video;
		this.setVideo = setVideo;

		const [segmentStart, setSegmentStart] = useState(0);
		this.segmentStart = segmentStart;
		this._setSegmentStart = setSegmentStart;

		const [segmentEnd, setSegmentEnd] = useState(0);
		this.segmentEnd = segmentEnd;
		this._setSegmentEnd = setSegmentEnd;
	}

	get filename() {
		return this.currentInput.file.split(/[/\\]/).pop()!;
	}

	get ready() {
		return !!this.video && !!this.video.duration && !!this.segmentEnd;
	}

	get duration() {
		return Math.trunc(this.video?.duration || 0);
	}

	get currentTime() {
		return Math.trunc(this.video?.currentTime || 0);
	}

	set currentTime(duration: number) {
		if (this.video) this.video.currentTime = duration;
	}

	setSegmentStart(duration: number) {
		if (duration < this.segmentEnd) this._setSegmentStart(duration);
	}

	setSegmentEnd(duration: number) {
		if (duration > this.segmentStart) this._setSegmentEnd(duration);
	}

	addCurrentSegment() {
		if (this.segmentStart >= this.segmentEnd || this.segmentEnd <= this.segmentStart)
			return message("Segment start must be before segment end and vice versa.");

		if (this.currentInput.segments.find(segment => segment[0] === this.segmentStart && segment[1] === this.segmentEnd))
			return message("Segment already exists.", { kind: "error" });

		this.currentInput.segments.push([this.segmentStart, this.segmentEnd]);
		this.setInputs?.({ ...this.inputs });
	}

	deleteSegment(segment: [number, number]) {
		const index = this.currentInput.segments.findIndex(([start, end]) => start === segment[0] && end === segment[1]);
		if (index === -1) return;

		this.currentInput.segments.splice(index, 1);
		this.setInputs?.({ ...this.inputs });
	}

	playSegment([segmentStart, segmentEnd]: [number, number]) {
		this.setSegmentStart(segmentStart);
		this.setSegmentEnd(segmentEnd);

		this.currentTime = segmentStart;
		this.video?.play();
	}

	playorPause() {
		if (!this.video) return;

		if (this.video.currentTime >= this.segmentStart && this.video.currentTime < this.segmentEnd) {
			this.video.paused ? this.video.play() : this.video.pause();
		} else if (this.video.paused) {
			this.video.currentTime = this.segmentStart;
			this.video.play();
		}
	}

	fullscreen() {
		document.fullscreenElement ? document.exitFullscreen() : this.video?.requestFullscreen();
	}

	setTrack(trackType: "video" | "audio" | "subtitle", trackIndex: number) {
		switch (trackType) {
			case "video":
				this.currentInput.videoTrack = trackIndex;
				break;
			case "audio":
				this.currentInput.audioTrack = trackIndex;
				break;
			case "subtitle":
				this.currentInput.subtitleTrack = trackIndex === -1 ? null : trackIndex;
				break;
		}

		this.setInputs?.({ ...this.inputs });
	}

	setSpeed(speed: number) {
		if (this.video) this.video.playbackRate = speed;
		this.currentInput.speed = speed;
		this.setInputs?.({ ...this.inputs });
	}
}
