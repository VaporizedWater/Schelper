// import { headers } from "next/headers";
import { EventInput } from "@fullcalendar/core/index.js";
import { mergeFacultyEntries, newDefaultEmptyCalendar } from "./common";
import {
    CalendarInfo,
    CalendarPayload,
    CalendarType,
    CohortType,
    CombinedClass,
    FacultyType,
    tagCategory,
    tagListType,
    tagType,
} from "./types";

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

export async function loadCalendar(userEmail: string): Promise<CalendarPayload> {
    if (userEmail === "") {
        console.error("Calendar ID is undefined");
        return {
            calendar: newDefaultEmptyCalendar(),
            calendars: [],
        };
    }

    try {
        const calendarInfoRequest = fetchWithTimeout(
            "./api/calendars",
            {
                headers: {
                    userEmail: userEmail,
                },
            },
            15000
        );

        const classRequest = fetchWithTimeout(
            "./api/combined_classes",
            {
                headers: {
                    userEmail: userEmail,
                },
            },
            15000
        );

        const calendarInfoResponse = await calendarInfoRequest;
        const classResponse = await classRequest;

        if (classResponse.ok) {
            const currentCalendar = await parseJsonResponse<CalendarType>(classResponse);
            const calendarList = await parseJsonResponse<CalendarInfo[]>(calendarInfoResponse);

            return {
                calendar: currentCalendar,
                calendars: calendarList,
            } as CalendarPayload;
        }

        return {
            calendar: newDefaultEmptyCalendar(),
            calendars: [],
        };
    } catch (error) {
        console.error("Failed to load combined classes:", error);
        return {
            calendar: newDefaultEmptyCalendar(),
            calendars: [],
        };
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
export async function setCurrentCalendarToNew(calendarId: string) {
    console.log("CALENAR ID: ", calendarId);
}

export function getUnavailabilityFromClass(cls: CombinedClass, currentUnavailability?: FacultyType): FacultyType {
    const unavailability = {
        Mon: [] as EventInput[],
        Tue: [] as EventInput[],
        Wed: [] as EventInput[],
        Thu: [] as EventInput[],
        Fri: [] as EventInput[],
    };

    for (const day of cls.properties.days) {
        if (day === "Mon") {
            unavailability.Mon.push({
                start: cls.properties.start_time,
                end: cls.properties.end_time,
            });
        } else if (day === "Tue") {
            unavailability.Tue.push({
                start: cls.properties.start_time,
                end: cls.properties.end_time,
            });
        } else if (day === "Wed") {
            unavailability.Wed.push({
                start: cls.properties.start_time,
                end: cls.properties.end_time,
            });
        } else if (day === "Thu") {
            unavailability.Thu.push({
                start: cls.properties.start_time,
                end: cls.properties.end_time,
            });
        } else if (day === "Fri") {
            unavailability.Fri.push({
                start: cls.properties.start_time,
                end: cls.properties.end_time,
            });
        }
    }

    if (currentUnavailability) {
        return mergeFacultyEntries(
            [{ email: cls.properties.instructor_email, unavailability: unavailability }] as FacultyType[],
            [currentUnavailability]
        )[0];
    }

    return { email: cls.properties.instructor_email, unavailability: unavailability } as FacultyType;
}

// Helper function to get professor unavailability from classes
export function getProfessorsUnavailability(classes: CombinedClass[]): FacultyType[] {
    // Compute professor unavailability
    // Start by creating a map of professors to their unavailability
    const professorsUnavailability = new Map<string, FacultyType>();

    // Iterate through each class
    for (const cls of classes) {
        // Check if the class has a professor
        if (cls.properties.instructor_email) {
            // If the professor is not already in the map, add them
            if (!professorsUnavailability.has(cls.properties.instructor_email)) {
                // Initialize the professor's unavailability
                professorsUnavailability.set(cls.properties.instructor_email, getUnavailabilityFromClass(cls));
            }

            // Add the class to the professor's unavailability list
            const currentUnavailability = professorsUnavailability.get(cls.properties.instructor_email);

            if (currentUnavailability) {
                professorsUnavailability.set(
                    cls.properties.instructor_email,
                    getUnavailabilityFromClass(cls, currentUnavailability)
                );
            }
        }
    }

    return professorsUnavailability.size > 0
        ? (Array.from(professorsUnavailability.values()) as FacultyType[])
        : ([] as FacultyType[]);
}

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
            facultyData: getProfessorsUnavailability(combinedClasses),
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

export async function deleteCohort(email: string, cohortId: string): Promise<boolean> {
    try {
        const response = await fetchWithTimeout(`api/cohorts`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ cohortId: cohortId, userEmail: email }),
        });

        const result = await parseJsonResponse<{ success: boolean }>(response);
        return result.success;
    } catch (error) {
        console.error("Failed to delete cohort:", error);
        return false;
    }
}
