// import { headers } from "next/headers";
import { newDefaultEmptyCalendar } from "./common";
import { CalendarType, CohortType, CombinedClass, FacultyType, tagCategory, tagListType, tagType } from "./types";

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
        const tags = await parseJsonResponse<{ _id: string; category: string }[]>(response);
        return new Map(tags.map((tag) => [tag._id, { tagCategory: tag.category as tagCategory, classIds: new Set() }]));
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
            "./api/combined_classes",
            {
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

export async function loadCohorts(userEmail: string, loadAll: string): Promise<CohortType[]> {
    try {
        const response = await fetchWithTimeout("./api/cohorts", {
            headers: {
                userEmail: userEmail,
                loadAll: loadAll,
            },
        });

        if (!response.ok) {
            return [];
        }

        const cohorts = await parseJsonResponse<CohortType[]>(response);
        return cohorts;
    } catch (error) {
        console.error("Error fetching cohorts:", error);
        return [];
    }
}

export async function loadFaculty(): Promise<FacultyType[]> {
    try {
        const response = await fetchWithTimeout("./api/faculty");
        const faculty = await parseJsonResponse<FacultyType[]>(response);
        return faculty;
    } catch (error) {
        console.error("Error fetching faculty:", error);
        return [];
    }
}

// INSERTs/POSTs
// Insert tags
export async function insertTags(tags: tagType[]): Promise<boolean> {
    try {
        // Handle empty tags array case
        if (!tags || tags.length === 0) {
            return true; // Nothing to do, so technically successful
        }

        // Format tags for API
        const formattedTags = tags.map((tag) => ({
            name: tag.tagName,
            category: tag.tagCategory,
        }));

        const response = await fetchWithTimeout("api/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formattedTags),
        });

        if (!response.ok) {
            console.error(`Failed to insert tags: ${response.status}`);
            return false;
        }

        // Parse the response to get success status
        const result = await parseJsonResponse<{ success: boolean }>(response);
        return result.success;
    } catch (error) {
        console.error("Failed to insert tags:", error);
        return false;
    }
}

// Insert Cohort
export async function insertCohort(userEmail: string, cohort: CohortType): Promise<boolean | null> {
    try {
        const response = await fetchWithTimeout("api/cohorts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userEmail, cohortData: cohort }),
        });

        if (!response.ok) {
            return null;
        }

        const result = await parseJsonResponse<{ success: boolean }>(response);
        return result.success;
    } catch (error) {
        console.error("Failed to insert cohort:", error);
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
            visible: undefined, // Only set visible to undefined in the copy
            lastUpdated: undefined, // Only set lastUpdated to undefined in the copy
            conflictPropertyChanged: undefined, // Only set conflictPropertyChanged to undefined in the copy
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

export async function updateFaculty(faculty: FacultyType[]): Promise<boolean | null> {
    try {
        const response = await fetchWithTimeout("api/faculty", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(faculty), // Send array directly
        });

        if (!response.ok) {
            return null;
        }

        const result = await parseJsonResponse<{ success: boolean }>(response);
        return result.success;
    } catch (error) {
        console.error("Failed to update faculty:", error);
        return null;
    }
}

export async function updateCohort(cohortId: string, cohort: CohortType): Promise<boolean | null> {
    try {
        const response = await fetchWithTimeout(`api/cohorts/${cohortId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cohort),
        });

        if (!response.ok) {
            return null;
        }

        const result = await parseJsonResponse<{ success: boolean }>(response);
        return result.success;
    } catch (error) {
        console.error("Failed to update cohort:", error);
        return null;
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

export async function deleteStoredFaculty(facultyEmail: string): Promise<boolean> {
    try {
        const response = await fetchWithTimeout("api/faculty", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: facultyEmail }),
        });

        const result = await parseJsonResponse<{ success: boolean }>(response);
        return result.success;
    } catch (error) {
        console.error("Failed to delete faculty:", error);
        return false;
    }
}
