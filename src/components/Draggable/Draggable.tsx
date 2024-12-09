import { DraggableProps } from "@/app/api/types";
import { useDraggable } from "@dnd-kit/core";
import { useRef } from "react";

const Draggable = (props: DraggableProps) => {
    const position = useRef({ x: 0, y: 0 });

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging
    } = useDraggable({ id: props.id });

    if (isDragging) {
        if (transform) {
            if (transform.x != position.current.x && transform.y != position.current.y) {
                position.current.x = transform.x;
                position.current.y = transform.y;
            }
        }
    }

    const style = { transform: `translate(${position.current.x}px, ${position.current.y}px)` };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} title="draggable">
            {props.children}
        </div>
    );
}

export default Draggable;