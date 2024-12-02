
import TagDisplay from "@/components/TagDisplay/TagDisplay";

const ManageTags = () => {
    return (
        <div className="flex flex-col items-center">
            <h1 className="text-4xl text-bold py-6 text-center">Manage Tags</h1>
            <div className="px-10 w-full flex flex-col gap-3">
                <TagDisplay tagName="Test" classes={[12, 13, 14, 15]}></TagDisplay>
                <TagDisplay tagName="Test" classes={[12, 13, 14, 15]}></TagDisplay>
                <TagDisplay tagName="Test" classes={[12, 13, 14, 15]}></TagDisplay>
            </div>
        </div>
    );
}

export default ManageTags;