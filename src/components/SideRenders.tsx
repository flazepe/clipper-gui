import { SideRenderComponent } from "@/components";
import { RendersStateContext } from "@/contexts";
import { useContext } from "react";

export default function () {
	const [renders] = useContext(RendersStateContext);

	return (
		<>
			<div className="my-2 text-2xl font-bold uppercase">Renders</div>
			{renders[0] ? (
				<div className="flex flex-col gap-2 font-bold">
					{renders.map((render, index) => (
						<SideRenderComponent render={render} key={index} />
					))}
				</div>
			) : (
				<div className="flex h-1/2 items-center justify-center text-xl">No renders</div>
			)}
		</>
	);
}
