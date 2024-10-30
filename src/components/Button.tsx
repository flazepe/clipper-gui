import { HTMLAttributes, PropsWithChildren } from "react";

export default function ({ children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
	return (
		<div className={`my-2 cursor-pointer rounded bg-gray-700 p-2 text-center text-xl font-bold uppercase`} {...props}>
			{children}
		</div>
	);
}
