import { ReactNode } from "react";

export default function ({ children }: { children: ReactNode }) {
	return <div className="min-w-8 rounded bg-gray-900 p-2 text-sm uppercase">{children}</div>;
}
