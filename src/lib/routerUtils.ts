import { AnyBulkWriteOperation, BulkWriteResult, Collection, Document, InsertManyResult } from "mongodb";

// Not currently used
export async function doBulkOperation(
    collection: Collection,
    bulkOps: AnyBulkWriteOperation<Document>[]
): Promise<Response> {
    const result = await collection.bulkWrite(bulkOps);

    return handleBulkWriteResult(result);
}

// In use
export function handleBulkWriteResult(result: BulkWriteResult) {
    if (result.ok) {
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } else {
        return new Response(JSON.stringify({ success: false }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

// Not currently used
export function handleInsertManyResult(result: InsertManyResult) {
    if (result.insertedCount > 0) {
        return new Response(JSON.stringify({ success: true, count: result.insertedCount }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } else {
        return new Response(JSON.stringify({ success: false }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
