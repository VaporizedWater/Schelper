import { newDefaultEmptyClass } from "./common";
import { Class, ClassProperty, CombinedClass } from "./types";

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
export default async function fetchWithTimeout(requestURL: string, options = {}, timeout = 5000) {
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
            console.log(error);
            response = new Response(null, { status: 408 });
        }
    }

    return response;
}

// Retry helper
async function retry<T>(fn: () => Promise<T>, attempts: number = 3, delay: number = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (attempts <= 1) throw error;
        await new Promise((ignored) => setTimeout(ignored, delay));
        return retry(fn, attempts - 1, delay);
    }
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

// Editable Class Properties.
export async function loadClassProperties(classId: string): Promise<ClassProperty> {
    try {
        const response = await fetchWithTimeout("./api/class_properties", {
            headers: { id: classId },
        });
        return await parseJsonResponse<ClassProperty>(response);
    } catch (error) {
        console.error("Failed to load class properties:", error);
        return {} as ClassProperty;
    }
}

// Load from two collections
export async function loadCombinedClass(classId: string): Promise<CombinedClass> {
    try {
        // Load class data
        const classResponse = await fetchWithTimeout("./api/classes", {
            headers: { id: classId },
        });
        const classData = await parseJsonResponse<Class>(classResponse);

        // Load properties
        const properties = await loadClassProperties(classId);

        return { classData, classProperties: properties, event: undefined };
    } catch (error) {
        console.error(`Failed to load combined class ${classId}:`, error);
        return {} as CombinedClass;
    }
}

//
export async function loadCombinedClasses(classIds: string[]): Promise<CombinedClass[]> {
    const classData: CombinedClass[] = [];

    for (const id of classIds) {
        const newClass: CombinedClass | null = await loadCombinedClass(id);

        if (newClass) {
            classData.push(newClass);
        }
    }

    return classData;
}

export async function loadAllCombinedClasses(): Promise<CombinedClass[]> {
    return retry(async () => {
        const response = await fetch("/api/classes");
        const classes = await parseJsonResponse<Class[]>(response);

        return Promise.all(
            classes.map(async (classItem) => {
                const propsResponse = await fetch("/api/class_properties", {
                    headers: { id: classItem._id },
                });

                const props = await parseJsonResponse<ClassProperty>(propsResponse);

                return {
                    classData: classItem,
                    classProperties: props,
                    event: undefined,
                };
            })
        );
    });
}

// DELETES
export async function deleteClass(classID: string) {
    console.log("deleting " + classID);
}

// Delete tag and return if deleted or not
export async function deleteTag(tagId: string) {
    const response = await fetchWithTimeout("api/tags", {
        method: "DELETE",
        headers: { "Content-Type": "text/plain" },
        body: tagId,
    });

    if (!response.ok) {
        console.error("Error deleting tag: " + response.statusText);
    }
}

// INSERTs/POSTs

// Insert class
// Include try catch maybe
export async function insertClass(classData: Class): Promise<string | null> {
    try {
        const response = await fetchWithTimeout("api/classes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(classData),
        });

        const result = await parseJsonResponse<{ insertedId: string }>(response);
        return result.insertedId;
    } catch (error) {
        console.error("Failed to insert class:", error);
        return null;
    }
}

// Insert class_property
// Include try catch maybe
export async function insertClassProperty(classProperties: ClassProperty) {
    try {
        const response = await fetchWithTimeout("api/class_properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(classProperties),
        });

        const result = await parseJsonResponse<{ insertedId: string }>(response);
        return result.insertedId;
    } catch (error) {
        console.error("Failed to insert class properties:", error);
        return null;
    }
}

// Insert combined class
export async function insertCombinedClass(combinedClass: CombinedClass): Promise<string | null> {
    const classId = await insertClass(combinedClass.classData);

    if (!classId) {
        console.error("Failed to insert class");
        return null;
    }

    combinedClass.classProperties._id = classId;
    const classPropId = await insertClassProperty(combinedClass.classProperties);

    if (classPropId == null) {
        console.error("Failed to insert class properties. Try again...");
        return null;
    }

    return classId;
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

export async function updateCombinedClass(combinedClass: CombinedClass) {
    try {
        const classResponse = await fetchWithTimeout("/api/classes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(combinedClass.classData),
        });

        if (!classResponse.ok) {
            console.error("Error updating class: " + classResponse.statusText);
            return;
        }

        const updatedClassData = await classResponse.json();

        if (updatedClassData._id) {
            combinedClass.classData._id = updatedClassData._id;
            combinedClass.classProperties._id = updatedClassData._id;
        }

        const classPropResponse = await fetchWithTimeout("/api/class_properties", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(combinedClass.classProperties),
        });

        if (!classPropResponse.ok) {
            console.error("Error updating class properties: " + classPropResponse.statusText);
            return;
        }
    } catch (error) {
        console.error("Failed to update combined class:", error);
        return false;
    }
}
