import { HTMLAttributes, PropsWithChildren } from "react";

export default function ({ children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
	props.className = `cursor-pointer rounded bg-gray-700 p-2 text-center text-xl font-bold uppercase ${props.className ?? ""}`;
	return <div {...props}>{children}</div>;
}
