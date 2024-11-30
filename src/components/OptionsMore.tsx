import { CheckboxComponent } from "@/components";
import { FFMPEG_NVENC_PRESETS, FFMPEG_PRESETS, encoderSchema, outputSchema } from "@/functions/clipper";
import StatesContext from "@/StatesContext";
import { FocusEvent, useContext, useEffect, useState } from "react";

export default function () {
	const {
			clipper: {
				encoder: [encoder],
				output: [output]
			}
		} = useContext(StatesContext),
		// This loaded state is needed because useEffect() with no dependencies is fired twice instead of once on StrictMode dev
		[loaded, setLoaded] = useState(false),
		[nvenc, setNvenc] = useState(false),
		[hevc, setHevc] = useState(false),
		[preset, setPreset] = useState<string | null>(null),
		[crf, setCrf] = useState<number | null>(null),
		[cq, setCq] = useState<number | null>(null),
		[dryRun, setDryRun] = useState(false),
		setCrfOrCq = (event: FocusEvent<HTMLInputElement>) => {
			const value = event.currentTarget.value.trim() ? Number(event.currentTarget.value) : null;

			if (value && (value < 0 || value > 51)) {
				event.currentTarget.value = ((nvenc ? cq : crf) ?? "").toString();
			} else {
				nvenc ? setCq(value) : setCrf(value);
				event.currentTarget.value = value?.toString() ?? "";
			}
		};

	encoder.nvenc = nvenc;
	encoder.hevc = hevc;
	encoder.preset = preset;
	encoder.crf = crf;
	encoder.cq = cq;

	output.dryRun = dryRun;

	useEffect(() => {
		try {
			const { value, error } = encoderSchema.validate(JSON.parse(localStorage.getItem("encoder") ?? ""));
			if (error) throw error;

			setNvenc(value.nvenc);
			setHevc(value.hevc);
			setPreset(value.preset === "default" ? null : value.preset);
			setCrf(value.crf);
			setCq(value.cq);
		} catch {
			localStorage.removeItem("encoder");
		}

		try {
			const { value, error } = outputSchema.validate(JSON.parse(localStorage.getItem("output") ?? ""));
			if (error) throw error;

			setDryRun(value.dryRun);
		} catch {
			localStorage.removeItem("output");
		}

		setLoaded(true);
	}, []);

	useEffect(() => {
		if (loaded) {
			localStorage.setItem("encoder", JSON.stringify(encoder));
			localStorage.setItem("output", JSON.stringify(output));
		}
	}, [nvenc, hevc, preset, crf, cq, dryRun]);

	return (
		<div className="fixed inset-0 z-40 m-auto flex h-2/3 w-1/2 flex-col items-center justify-center gap-10 rounded border border-black bg-gray-900">
			<div className="flex w-1/3 flex-col gap-4">
				<div className="text-3xl font-bold">Encoder</div>
				<div
					onClick={() => {
						setNvenc(!nvenc);
						setPreset("default");
					}}
					className="flex cursor-pointer items-center gap-2"
				>
					<CheckboxComponent checked={nvenc} />
					NVENC
				</div>
				<div onClick={() => setHevc(!hevc)} className="flex cursor-pointer items-center gap-2">
					<CheckboxComponent checked={hevc} />
					HEVC
				</div>
				<div className="flex flex-col gap-2">
					Preset:
					<select
						value={preset ?? "default"}
						onChange={event => setPreset(event.currentTarget.value === "default" ? null : event.currentTarget.value)}
					>
						{(nvenc ? FFMPEG_NVENC_PRESETS : FFMPEG_PRESETS).map((preset, index) => (
							<option value={preset} key={index}>
								{preset}
							</option>
						))}
					</select>
				</div>
				{nvenc && (
					<div className="flex flex-col gap-2">
						CQ:
						<input type="number" min={0} max={51} defaultValue={cq ?? ""} placeholder="Leave empty for default" onBlur={setCrfOrCq} />
					</div>
				)}
				{!nvenc && (
					<div className="flex flex-col gap-2">
						CRF:
						<input type="number" min={0} max={51} defaultValue={crf ?? ""} placeholder="Leave empty for default" onBlur={setCrfOrCq} />
					</div>
				)}
			</div>
			<div className="flex w-1/3 flex-col gap-4">
				<div className="text-3xl font-bold">Output</div>
				<div onClick={() => setDryRun(!dryRun)} className="flex cursor-pointer items-center gap-2">
					<CheckboxComponent checked={dryRun} />
					Dry Run
				</div>
			</div>
		</div>
	);
}
