import { PropsWithChildren } from "react";

export default function ({ children, className = "", ...props }: PropsWithChildren<any>) {
	return (
		<div className={`bg-gray-700 rounded p-2 text-xl my-2 text-center cursor-pointer ${className}`} {...props}>
			{children}
		</div>
	);
}
