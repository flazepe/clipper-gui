import { useContext, useRef, useState } from "react";
import { Input } from "../components/App";
import InputsStateContext from "../contexts/InputsState";

export default class {
	input;
	inputs;
	setInputs;
	private video;
	setVideo;
	segmentStart;
	setSegmentStart;
	segmentEnd;
	setSegmentEnd;
	segmentStartInput = useRef<HTMLInputElement>(null);
	segmentEndInput = useRef<HTMLInputElement>(null);

	constructor(input: Input) {
		this.input = input;

		const [inputs, setInputs] = useContext(InputsStateContext);
		this.inputs = inputs;
		this.setInputs = setInputs;

		const [video, setVideo] = useState<HTMLVideoElement | null>(null);
		this.video = video;
		this.setVideo = setVideo;

		const [segmentStart, setSegmentStart] = useState(0);
		this.segmentStart = segmentStart;
		this.setSegmentStart = setSegmentStart;

		const [segmentEnd, setSegmentEnd] = useState(0);
		this.segmentEnd = segmentEnd;
		this.setSegmentEnd = setSegmentEnd;
	}

	get ready() {
		return !!this.video && !!this.video.duration && !!this.segmentEnd;
	}

	get duration() {
		return this.video?.duration || 0;
	}

	get currentTime() {
		return this.video?.currentTime || 0;
	}

	set currentTime(duration: number) {
		if (this.video) this.video.currentTime = duration;
	}

	play() {
		this.video?.play();
	}

	pause() {
		this.video?.pause();
	}

	playorPause() {
		if (!this.video) return;

		this.video.paused && this.video.currentTime >= this.segmentStart && this.video.currentTime <= this.segmentEnd
			? this.video.play()
			: this.video.pause();
	}
}
