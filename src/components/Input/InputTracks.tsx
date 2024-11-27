import InputController from "@/classes/InputController";
import { CheckboxComponent } from "@/components";

export default function ({ controller: c }: { controller: InputController }) {
	return (
		<div className="flex flex-col gap-10 p-5 text-xl">
			<div className="flex flex-col gap-2">
				<div className="text-2xl font-bold uppercase">Tracks</div>
				Video:
				<input
					type="number"
					min={0}
					value={c.currentInput.videoTrack}
					onChange={event => c.setTrack("video", Number(event.currentTarget.value))}
					className="w-20"
				/>
				Audio:
				<input
					type="number"
					min={0}
					value={c.currentInput.audioTrack}
					onChange={event => c.setTrack("audio", Number(event.currentTarget.value))}
					className="w-20"
				/>
				<div
					onClick={() => c.setTrack("subtitle", c.currentInput.subtitleTrack !== null ? -1 : 0)}
					className="flex cursor-pointer items-center gap-2"
				>
					<CheckboxComponent checked={c.currentInput.subtitleTrack !== null} />
					Subtitle:
				</div>
				{c.currentInput.subtitleTrack === null ? (
					<input type="number" value="" readOnly className="w-20" />
				) : (
					<input
						type="number"
						min={0}
						value={c.currentInput.subtitleTrack}
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
					defaultValue={c.currentInput.speed}
					onBlur={event => {
						const speed = Number(event.currentTarget.value);

						if (speed >= 0.5 && speed <= 100) {
							c.setSpeed(speed);
							event.currentTarget.value = speed.toString();
						} else {
							event.currentTarget.value = c.currentInput.speed.toString();
						}
					}}
					className="w-20"
				/>
			</div>
		</div>
	);
}
