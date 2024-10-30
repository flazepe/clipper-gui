import { PropsWithChildren } from "react";

export default function ({ children, className = "", ...props }: PropsWithChildren<any>) {
	return (
		<div className={`my-2 cursor-pointer rounded bg-gray-700 p-2 text-center text-xl ${className}`} {...props}>
			{children}
		</div>
	);
}
