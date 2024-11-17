import StatesContext from "@/StatesContext";
import { useContext, useState } from "react";

export default function () {
	const {
			clipper: {
				inputs: [inputs],
				encoder: [encoder],
				output: [output]
			}
		} = useContext(StatesContext),
		[fade, setFade] = useState(0),
		[noVideo, setNoVideo] = useState(false),
		[noAudio, setNoAudio] = useState(false),
		[nvenc, setNvenc] = useState(false),
		[hevc, setHevc] = useState(false),
		[dryRun, setDryRun] = useState(false);

	inputs.fade = fade;
	inputs.noVideo = noVideo;
	inputs.noAudio = noAudio;
	encoder.nvenc = nvenc;
	encoder.hevc = hevc;
	output.dryRun = dryRun;

	return (
		<div className="flex cursor-pointer items-center justify-center gap-5 text-xl">
			<div className="flex items-center gap-2">
				<div onClick={() => setFade(fade ? 0 : 0.5)} className="flex gap-2">
					<input type="checkbox" checked={!!fade} readOnly />
					Fade:
				</div>
				<input
					type="number"
					min={0}
					value={fade}
					step="0.1"
					onChange={event => setFade(Number(event.currentTarget.value))}
					readOnly={!fade}
					className="w-16"
				/>
			</div>
			<div onClick={() => setNoVideo(!noVideo)} className="flex gap-2">
				<input type="checkbox" checked={noVideo} readOnly />
				No Video
			</div>
			<div onClick={() => setNoAudio(!noAudio)} className="flex gap-2">
				<input type="checkbox" checked={noAudio} readOnly />
				No Audio
			</div>
			<div onClick={() => setNvenc(!nvenc)} className="flex gap-2">
				<input type="checkbox" checked={nvenc} readOnly />
				NVENC
			</div>
			<div onClick={() => setHevc(!hevc)} className="flex gap-2">
				<input type="checkbox" checked={hevc} readOnly />
				HEVC
			</div>
			<div onClick={() => setDryRun(!dryRun)} className="flex gap-2">
				<input type="checkbox" checked={dryRun} readOnly />
				Dry Run
			</div>
		</div>
	);
}
