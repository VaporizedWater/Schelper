import { DraggableProps } from "@/app/api/types";
import { useDraggable } from "@dnd-kit/core";

const Draggable = (props: DraggableProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform
    } = useDraggable({ id: props.id });

    const style = transform ? {
        transform: `translate3d(${transform.x >= 0 ? transform.x : 0}px, ${transform.y <= 0 ? transform.y : 0}px, 0)`,
      } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {props.children}
        </div>
    );
}

export default Draggable;