import { DraggableProps } from "@/app/api/types";
import { useDraggable } from "@dnd-kit/core";

const Draggable = (props: DraggableProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform
    } = useDraggable({ id: props.id });

    return (
        <div ref={setNodeRef} {...attributes} {...listeners}>
            {props.children}
        </div>
    );
}

export default Draggable;