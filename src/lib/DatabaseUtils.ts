import { newDefaultEmptyCalendar } from "./common";
import { CalendarType, CombinedClass, tagListType } from "./types";

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
// Get tags by ID or all tags if no ID specified
export async function loadTags(): Promise<tagListType> {
    try {
        const response = await fetchWithTimeout("./api/tags");
        const tags = await parseJsonResponse<{ _id: string }[]>(response);
        return new Map(tags.map((tag) => [tag._id, new Set()]));
    } catch (error) {
        console.error("Error fetching tag:", error);
        return new Map();
    }
}

export async function loadCalendar(userEmail: string): Promise<CalendarType> {
    if (userEmail === "") {
        console.error("Calendar ID is undefined");
        return newDefaultEmptyCalendar();
    }

    try {
        const classResponse = await fetchWithTimeout(
            "./api/combined_classes", {
            headers: {
                userEmail: userEmail,
            },
        },
            50000
        );

        if (classResponse.ok) {
            return parseJsonResponse<CalendarType>(classResponse);
        }

        return newDefaultEmptyCalendar();
    } catch (error) {
        console.error("Failed to load combined classes:", error);
        return newDefaultEmptyCalendar();
    }
}

// INSERTs/POSTs
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

export async function updateCombinedClasses(combinedClasses: CombinedClass[], calendarId?: string): Promise<boolean> {
    try {
        // Create a deep copy to avoid mutating the original objects
        const classesToSend = combinedClasses.map((cls) => ({
            ...cls,
            events: undefined, // Only set events to undefined in the copy
        }));

        const payload = {
            calendarId: calendarId,
            classes: classesToSend,
        };

        const response = await fetchWithTimeout("api/combined_classes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await parseJsonResponse<{ success: boolean }>(response);

        return result.success;
    } catch (error) {
        console.error("Failed to insert class:", error);
        return false;
    }
}

export async function updateCalendarClasses(classIds: string[]) {
    try {
        const response = await fetchWithTimeout("api/calendar", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(classIds),
        });

        const result = await parseJsonResponse<{ success: boolean }>(response);
        return result.success;
    } catch (error) {
        console.error("Failed to update calendar classes:", error);
        return false;
    }
}

// ---
// DELETEs
export async function deleteCombinedClasses(classId: string, calendarId: string): Promise<boolean> {
    try {
        const payload = {
            calendarId: calendarId,
            classId: classId,
        };

        const response = await fetchWithTimeout("api/combined_classes", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await parseJsonResponse<{ success: boolean }>(response);
        return result.success;
    } catch (error) {
        console.error("Failed to delete classes:", error);
        return false;
    }
}
