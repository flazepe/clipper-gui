import { SideRenderComponent } from "@/components";
import StatesContext from "@/StatesContext";
import { useContext } from "react";

export default function () {
	const {
		renders: [renders]
	} = useContext(StatesContext);

	return (
		<>
			<div className="my-2 text-2xl font-bold uppercase">Renders</div>
			{!renders[0] && <div className="flex justify-center text-xl font-bold uppercase text-gray-400">Empty</div>}
			<div className="flex flex-col gap-4 font-bold">
				{renders.map((render, index) => (
					<SideRenderComponent render={render} key={index} />
				))}
			</div>
		</>
	);
}
