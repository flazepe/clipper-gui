import { HTMLAttributes, PropsWithChildren } from "react";

export default function ({ children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
	props.className = `cursor-pointer flex justify-center gap-2 items-center rounded bg-gray-700 p-2 text-center text-lg font-bold uppercase hover:brightness-75 ${props.className ?? ""}`;

	return <div {...props}>{children}</div>;
}
