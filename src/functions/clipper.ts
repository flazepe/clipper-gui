import { invoke } from "@tauri-apps/api/core";
import { message } from "@tauri-apps/plugin-dialog";
import { Child, Command } from "@tauri-apps/plugin-shell";

export const SUPPORTED_EXTENSIONS = ["avi", "flv", "mkv", "mov", "mp4"];

export interface Clipper {
	inputs: Inputs;
	encoder: Encoder;
	output: Output;
}

export interface Inputs {
	inputs: Array<Input>;
	fade: number;
	resize: [number, number] | null;
	noVideo: boolean;
	noAudio: boolean;
}

export interface Input {
	_dndID: number;
	_objectURL: string;
	file: string;
	segments: Array<[number, number]>;
	videoTrack: number;
	audioTrack: number;
	subtitleTrack: number | null;
	speed: number;
}

export interface Encoder {
	nvenc: boolean;
	hevc: boolean;
	preset: string | null;
	crf: number | null;
	cq: number | null;
}

export interface Output {
	file: string | null;
	forceOverwrite: boolean;
	forceNotOverwrite: boolean;
	dryRun: boolean;
}

export function getFfmpegArgs(clipper: Clipper) {
	return invoke<Array<string>>("run_clipper", { clipper });
}

export async function isValidVideo(path: string) {
	return new Promise<boolean>(async resolve => {
		try {
			const command = Command.create("ffprobe", ["-v", "error", path]),
				child = await command.spawn();

			command.stderr.on("data", async () => {
				resolve(false);
				await child.kill();
			});

			command.on("close", () => resolve(true));
		} catch (error) {
			message(`${error}\n\nIs ffprobe installed? Please make sure to install ffmpeg (which includes ffprobe) and add the bin folder to PATH.`, {
				kind: "error"
			});
		}
	});
}

export interface Render {
	filename: String;
	progress: number;
	child: Child;
}
