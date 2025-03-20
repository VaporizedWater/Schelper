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
export default async function fetchWithTimeout(requestURL: string, options = {}, timeout = 10000) {
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

        return { classData, classProperties: properties, events: undefined };
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
    try {
        const [classesResponse, propertiesResponse] = await Promise.all([
            fetchWithTimeout("/api/classes"),
            fetchWithTimeout("/api/class_properties"),
        ]);

        const [classes, allProperties] = await Promise.all([
            parseJsonResponse<Class[]>(classesResponse),
            parseJsonResponse<ClassProperty[]>(propertiesResponse),
        ]);

        const propertiesMap = new Map(allProperties.map((prop) => [prop._id, prop]));

        const combinedClasses: CombinedClass[] = classes.map((classItem) => {
            const props = propertiesMap.get(classItem._id) || ({} as ClassProperty);
            return {
                classData: classItem,
                classProperties: props,
                events: undefined,
            };
        });

        return combinedClasses;
    } catch (error) {
        console.error("Failed to load combined classes:", error);
        return [] as CombinedClass[];
    }
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

export async function updateCombinedClass(combinedClass: CombinedClass): Promise<boolean> {
    try {
        const classResponse = await fetchWithTimeout("/api/classes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(combinedClass.classData),
        });

        if (!classResponse.ok) {
            console.error("Error updating class: " + classResponse.statusText);
            return false;
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
            return false;
        }

        return true;
    } catch (error) {
        console.error("Failed to update combined class:", error);
        return false;
    }
}

// Add this function after updateCombinedClass

export async function bulkUpdateClasses(combinedClasses: CombinedClass[]): Promise<boolean> {
    try {
        // Extract class data and properties into separate arrays for batch processing
        const classDataArray = combinedClasses.map((cls) => cls.classData);
        const classPropertiesArray = combinedClasses.map((cls) => cls.classProperties);

        // First bulk update all class data
        const classResponse = await fetchWithTimeout("/api/classes/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(classDataArray),
        });

        if (!classResponse.ok) {
            console.error("Error bulk updating classes: " + classResponse.statusText);
            return false;
        }

        const updatedClassData = await classResponse.json();
        console.log("Class insertion results:", updatedClassData);

        // Update IDs for any new classes
        if (updatedClassData.insertedIds) {
            // Apply new IDs to both the class data and properties
            Object.entries(updatedClassData.insertedIds).forEach(([index, id]) => {
                const i = parseInt(index);
                combinedClasses[i].classData._id = id as string;
                classPropertiesArray[i]._id = id as string;
            });
        }

        // Log and validate properties before sending
        console.log(`Sending ${classPropertiesArray.length} properties`);
        classPropertiesArray.forEach((prop, i) => {
            if (!prop._id) {
                console.error(`Missing _id for property at index ${i}`);
            }
        });

        // Then bulk update all properties
        const classPropResponse = await fetchWithTimeout("/api/class_properties/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(classPropertiesArray),
        });

        if (!classPropResponse.ok) {
            console.error("Error bulk updating class properties: " + classPropResponse.statusText);
            const errorText = await classPropResponse.text();
            console.error("Error details:", errorText);
            return false;
        }

        const propertyResult = await classPropResponse.json();
        console.log("Property insertion results:", propertyResult);

        return true;
    } catch (error) {
        console.error("Failed to bulk update classes:", error);
        return false;
    }
}
