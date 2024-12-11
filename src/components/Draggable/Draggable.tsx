import { DraggableProps } from "@/lib/types";
import { useDraggable } from "@dnd-kit/core";
import { useEffect } from "react";
import { usePositionContext } from "../PositionContext/PositionContext";

const Draggable = (props: DraggableProps) => {
    const { positions, updatePosition } = usePositionContext();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging
    } = useDraggable({ id: props.id });

    useEffect(() => {
        if (!isDragging && transform) {
            updatePosition(props.id, { x: transform.x, y: transform.y });
        }
    }, [isDragging, transform, props.id, updatePosition]);

    const x = positions[props.id]?.x ?? 0;
    const y = positions[props.id]?.y ?? 0;
    const style = { transform: `translate(${x}px, ${y}px)` };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} title="draggable" className="max-w-fit">
            {props.children}
        </div>
    );
}

export default Draggable;