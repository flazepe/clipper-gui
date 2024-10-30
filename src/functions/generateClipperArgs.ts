import { Input } from "../components/App";

export default function ({
	inputs,
	fade,
	noVideo,
	noAudio,
	output
}: {
	inputs: Array<Input>;
	fade: boolean | number;
	noVideo: boolean;
	noAudio: boolean;
	output: string;
}) {
	const args = [];

	for (const input of inputs) {
		args.push("-i", input.path);

		for (const segment of input.segments) {
			args.push("-s", segment);
		}
	}

	if (fade) args.push("-f");
	if (noVideo) args.push("-vn");
	if (noAudio) args.push("-an");
	args.push("-y", output);

	return args;
}
