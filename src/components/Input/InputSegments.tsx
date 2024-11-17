import InputController from "@/classes/InputController";
import { InputSegmentComponent } from "@/components";
import { DndContext } from "@dnd-kit/core";
import SimpleBar from "simplebar-react";

export default function ({ controller: c }: { controller: InputController }) {
	return (
		<SimpleBar className="w-full py-4">
			<div className="flex flex-row gap-4">
				<DndContext
					onDragEnd={event => {
						if (!event.over || event.active.id === event.over.id) return;

						const oldIndex = c.currentInput.segments.findIndex(segment => segment.toString() === event.active.id),
							newIndex = c.currentInput.segments.findIndex(segment => segment.toString() === event.over?.id),
							[oldSegment] = c.currentInput.segments.splice(oldIndex, 1);

						c.currentInput.segments.splice(newIndex, 0, oldSegment);

						c.setInputs?.({ ...c.inputs });
					}}
				>
					{c.currentInput.segments.map((segment, index) => (
						<InputSegmentComponent controller={c} segment={segment} key={index} />
					))}
				</DndContext>
			</div>
		</SimpleBar>
	);
}
