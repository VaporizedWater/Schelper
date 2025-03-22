import { CombinedClass } from "./types";

/**
 * Helper to parse JSON response from a fetch request
 */
async function parseJsonResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
    }

    const text = await response.text();

    if (!text) {
        return {} as T; // Return empty object for empty responses
    }

    try {
        return JSON.parse(text) as T;
    } catch (e) {
        console.error("JSON parse error:", e);
        throw new Error("Invalid JSON response");
    }
}

// FETCH
export default async function fetchWithTimeout(requestURL: string, options = {}, timeout = 20000) {
    const controller = new AbortController();
    let response: Response;

    setTimeout(() => controller.abort(), timeout);

    if (!requestURL) {
        console.log("options\n" + options);
        response = new Response(null, { status: 408 });
    } else {
        try {
            response = await fetch(requestURL, {
                ...options,
                signal: controller.signal,
            });
        } catch (error) {
            console.error(error);
            response = new Response(null, { status: 408 });
        }
    }

    return response;
}

// LOADS/GETs
// Get all tags
export async function loadAllTags(): Promise<Set<string>> {
    try {
        const response = await fetchWithTimeout("./api/tags");
        const tags = await parseJsonResponse<{ _id: string }[]>(response);
        return new Set(tags.map((tag) => tag._id));
    } catch (error) {
        console.error("Failed to load tags:", error);
        return new Set<string>();
    }
}

// Get one tag by id
export async function getTag(tagId: string): Promise<string | null> {
    try {
        const response = await fetchWithTimeout(`./api/tags?id=${tagId}`);
        return await parseJsonResponse<string>(response);
    } catch (error) {
        console.error("Error fetching tag:", error);
        return null;
    }
}

export async function loadCombinedClasses(classIds: string[] | null): Promise<CombinedClass[]> {
    console.time("loadCombinedClasses:total");
    try {
        const headers = { ids: "" };
        if (classIds !== null && classIds.length > 0) {
            headers.ids = classIds.join(",");
        }

        // Load class data
        const classResponse = await fetchWithTimeout(
            "./api/combined_classes",
            {
                headers: headers,
            },
            50000
        );

        if (classResponse.ok) {
            const text = await classResponse.text();
            const classes = JSON.parse(text) as CombinedClass[];
            return classes;
        }

        return [] as CombinedClass[];
    } catch (error) {
        console.error("Failed to load combined classes:", error);
        return [] as CombinedClass[];
    } finally {
        console.timeEnd("loadCombinedClasses:total");
    }
}

// INSERTs/POSTs

// Insert combined class
export async function insertCombinedClasses(combinedClasses: CombinedClass[]): Promise<boolean> {
    try {
        // Create a deep copy to avoid mutating the original objects
        const classesToSend = combinedClasses.map((cls) => ({
            ...cls,
            events: undefined, // Only set events to undefined in the copy
        }));

        const response = await fetchWithTimeout("api/combined_classes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(classesToSend),
        });

        const result = await parseJsonResponse<{ success: boolean }>(response);
        return result.success;
    } catch (error) {
        console.error("Failed to insert class:", error);
        return false;
    }
}

// Insert tag
export async function insertTag(tagName: string): Promise<string | null> {
    try {
        const processedTag = tagName.toLowerCase().replace(/\s+/g, "");

        const response = await fetchWithTimeout("api/tags", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: processedTag,
        });

        if (!response.ok) {
            return null;
        }

        return processedTag;
    } catch (error) {
        console.error("Failed to insert tag:", error);
        return null;
    }
}

// --------
// PUTS/UPDATES

export async function updateCombinedClasses(combinedClasses: CombinedClass[]): Promise<boolean> {
    console.log("updateCombinedClasses: ", combinedClasses);

    try {
        // Create a deep copy to avoid mutating the original objects
        const classesToSend = combinedClasses.map((cls) => ({
            ...cls,
            events: undefined, // Only set events to undefined in the copy
        }));

        const response = await fetchWithTimeout("api/combined_classes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(classesToSend),
        });

        const result = await parseJsonResponse<{ success: boolean }>(response);
        return result.success;
    } catch (error) {
        console.error("Failed to insert class:", error);
        return false;
    }
}
