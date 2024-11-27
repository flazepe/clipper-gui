import { CheckboxComponent } from "@/components";
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
		<div className="flex items-center justify-center gap-5 text-xl">
			<div className="flex items-center gap-2">
				<div onClick={() => setFade(fade ? 0 : 0.5)} className="flex cursor-pointer items-center gap-2">
					<CheckboxComponent checked={!!fade} />
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
			<div onClick={() => setNoVideo(!noVideo)} className="flex cursor-pointer items-center gap-2">
				<CheckboxComponent checked={noVideo} />
				No Video
			</div>
			<div onClick={() => setNoAudio(!noAudio)} className="flex cursor-pointer items-center gap-2">
				<CheckboxComponent checked={noAudio} />
				No Audio
			</div>
			<div onClick={() => setNvenc(!nvenc)} className="flex cursor-pointer items-center gap-2">
				<CheckboxComponent checked={nvenc} />
				NVENC
			</div>
			<div onClick={() => setHevc(!hevc)} className="flex cursor-pointer items-center gap-2">
				<CheckboxComponent checked={hevc} />
				HEVC
			</div>
			<div onClick={() => setDryRun(!dryRun)} className="flex cursor-pointer items-center gap-2">
				<CheckboxComponent checked={dryRun} />
				Dry Run
			</div>
		</div>
	);
}
