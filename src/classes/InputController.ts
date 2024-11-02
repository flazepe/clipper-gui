import { useContext, useRef, useState } from "react";
import InputsStateContext from "../contexts/InputsState";
import { Input } from "../functions/clipper";

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

	get filename() {
		return this.input.file.split(/[/\\]/).pop()!;
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

	addCurrentSegment() {
		if (this.segmentStart >= this.segmentEnd || this.segmentEnd <= this.segmentStart) return;

		if (!this.input.segments.find(segment => segment[0] === this.segmentStart && segment[1] === this.segmentEnd))
			this.input.segments.push([this.segmentStart, this.segmentEnd]);

		this.setInputs?.({ ...this.inputs });
	}

	deleteSegment(index: number) {
		this.input.segments.splice(index, 1);
		this.setInputs?.({ ...this.inputs });
	}

	playSegment([segmentStart, segmentEnd]: [number, number]) {
		this.setSegmentStart(segmentStart);
		this.setSegmentEnd(segmentEnd);

		this.currentTime = segmentStart;
		this.play();
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

	delete() {
		this.inputs.inputs = this.inputs.inputs.filter(entry => entry !== this.input);
		this.setInputs?.({ ...this.inputs });
	}
}
