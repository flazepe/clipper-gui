import { HTMLAttributes, PropsWithChildren } from "react";

export default function ({ children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
	return (
		<div
			{...props}
			className={`flex cursor-pointer items-center justify-between gap-2 rounded bg-gray-700 p-2 text-center text-lg font-bold uppercase hover:brightness-75 ${props.className ?? ""}`}
		>
			{children}
		</div>
	);
}
