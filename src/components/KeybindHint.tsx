import { ReactNode } from "react";

export default function ({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-8 min-w-8 items-center justify-center rounded bg-gray-900 p-1 text-sm font-bold uppercase text-gray-400">
			{children}
		</div>
	);
}
