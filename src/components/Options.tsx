import { CheckboxComponent, OptionsMoreComponent } from "@/components";
import StatesContext from "@/StatesContext";
import { useContext, useState } from "react";

export default function () {
	const {
			clipper: {
				inputs: [inputs]
			}
		} = useContext(StatesContext),
		[fade, setFade] = useState(0),
		[noVideo, setNoVideo] = useState(false),
		[noAudio, setNoAudio] = useState(false),
		[moreOptionsToggled, setMoreOptionsToggled] = useState(false);

	inputs.fade = fade;
	inputs.noVideo = noVideo;
	inputs.noAudio = noAudio;

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
			<div
				onClick={() => {
					setNoVideo(!noVideo);
					if (!noVideo && noAudio) setNoAudio(false);
				}}
				className="flex cursor-pointer items-center gap-2"
			>
				<CheckboxComponent checked={noVideo} />
				No Video
			</div>
			<div
				onClick={() => {
					setNoAudio(!noAudio);
					if (!noAudio && noVideo) setNoVideo(false);
				}}
				className="flex cursor-pointer items-center gap-2"
			>
				<CheckboxComponent checked={noAudio} />
				No Audio
			</div>
			<div onClick={() => setMoreOptionsToggled(!moreOptionsToggled)} className="flex cursor-pointer items-center gap-2">
				<CheckboxComponent checked={moreOptionsToggled} />
				More Options
			</div>
			{moreOptionsToggled && <OptionsMoreComponent />}
		</div>
	);
}
