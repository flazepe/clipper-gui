import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// @ts-expect-error `process` is a Node.js global
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: [{ find: "@", replacement: "/src" }]
	},
	plugins: [react()],
	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	// 1. Prevent Vite from obscuring Rust errors
	clearScreen: false,
	// 2. Tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
		watch: {
			// 3. tell Vite to ignore watching `src-tauri`
			ignored: ["**/src-tauri/**"]
		}
	}
});
