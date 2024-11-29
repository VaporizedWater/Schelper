import { TimeGridCellProps } from "@/app/api/types";
import { useDroppable } from "@dnd-kit/core";

const TimeGridCell = (props: TimeGridCellProps) => {
    const { isOver, setNodeRef } = useDroppable({
        id: props.droppableId,
    });
    const style = {
        color: isOver ? 'green' : undefined,
    };


    return (
        <div ref={setNodeRef} style={style} className="min-h-10 border-x border-b hover:bg-gray-100 duration-200">
        </div>
    );
}

export default TimeGridCell;