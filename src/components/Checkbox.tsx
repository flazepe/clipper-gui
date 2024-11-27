import { CheckboxBlankIcon, CheckboxMarkedIcon } from "@/icons";
import { HTMLAttributes } from "react";

export default function ({ checked, ...props }: { checked: boolean } & HTMLAttributes<HTMLInputElement>) {
	return (
		<div className="w-6" {...props}>
			{checked ? <CheckboxMarkedIcon className="fill-blue-300" /> : <CheckboxBlankIcon className="fill-white" />}
		</div>
	);
}
