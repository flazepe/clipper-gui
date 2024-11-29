import { invoke } from "@tauri-apps/api/core";
import { message } from "@tauri-apps/plugin-dialog";
import { Child, Command } from "@tauri-apps/plugin-shell";
import joi from "joi";

export const SUPPORTED_VIDEO_EXTENSIONS = ["3g2", "3gp", "avi", "flv", "m4v", "mkv", "mov", "mp4", "webm"],
	SUPPORTED_AUDIO_EXTENSIONS = ["aac", "alac", "flac", "m4a", "mka", "mp3", "ogg", "opus", "wav", "wma"],
	SUPPORTED_EXTENSIONS = [...SUPPORTED_VIDEO_EXTENSIONS, ...SUPPORTED_AUDIO_EXTENSIONS],
	FFMPEG_PRESETS = ["default", "ultrafast", "superfast", "veryfast", "faster", "fast", "medium", "slow", "veryslow"],
	FFMPEG_NVENC_PRESETS = ["default", "fast", "medium", "slow"];

export interface Input {
	_dndID: number;
	_src: string;
	file: string;
	segments: Array<[number, number]>;
	videoTrack: number;
	audioTrack: number;
	subtitleTrack: number | null;
	speed: number;
}

export const inputSchema = joi
	.object<Input>({
		_dndID: joi.number(),
		_src: joi.string(),
		file: joi.string(),
		segments: joi.array().items(joi.array().min(2).max(2).items(joi.number())),
		videoTrack: joi.number(),
		audioTrack: joi.number(),
		subtitleTrack: joi.number().allow(null),
		speed: joi.number()
	})
	.options({ presence: "required" });

export interface Inputs {
	entries: Array<Input>;
	fade: number;
	resize: [number, number] | null;
	noVideo: boolean;
	noAudio: boolean;
}

export const inputsSchema = joi
	.object<Inputs>({
		entries: joi.array().items(inputSchema),
		fade: joi.number(),
		resize: joi.array().min(2).max(2).items(joi.number()).allow(null),
		noVideo: joi.boolean(),
		noAudio: joi.boolean()
	})
	.options({ presence: "required" });

export interface Encoder {
	nvenc: boolean;
	hevc: boolean;
	preset: string | null;
	crf: number | null;
	cq: number | null;
}

export const encoderSchema = joi
	.object<Encoder>({
		nvenc: joi.boolean(),
		hevc: joi.boolean(),
		preset: joi.string().allow(...FFMPEG_PRESETS, ...FFMPEG_NVENC_PRESETS, null),
		crf: joi.number().min(0).max(51).allow(null),
		cq: joi.number().min(0).max(51).allow(null)
	})
	.options({ presence: "required" });

export interface Output {
	file: string | null;
	forceOverwrite: boolean;
	forceNotOverwrite: boolean;
	dryRun: boolean;
}

export const outputSchema = joi
	.object<Output>({
		file: joi.string().allow(null),
		forceOverwrite: joi.boolean(),
		forceNotOverwrite: joi.boolean(),
		dryRun: joi.boolean()
	})
	.options({ presence: "required" });

export interface Clipper {
	inputs: Inputs;
	encoder: Encoder;
	output: Output;
}

export const clipperSchema = joi
	.object<Clipper>({
		inputs: inputsSchema,
		encoder: encoderSchema,
		output: outputSchema
	})
	.options({ presence: "required" });

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
