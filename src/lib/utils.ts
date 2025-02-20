import { Class, ClassProperty, CombinedClass } from "./types";

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
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retry(fn, attempts - 1, delay);
    }
}

// LOADS/GETs
// Get all tags
export async function loadAllTags(): Promise<Set<string>> {
    const response = await fetchWithTimeout("./api/tags", { headers: {} });

    if (!response.ok || response.status !== 200 || !response.body) {
        console.error("Could not find tags!");
        return new Set<string>();
    }

    const responseText = new TextDecoder().decode((await response.body.getReader().read()).value);
    const tagsJSON = JSON.parse(responseText);

    // tagsJSON is an array of objects like { id: "tag1" }.
    const tagIds = (tagsJSON as { _id: string }[]).map((tag) => tag._id);
    // console.log(JSON.stringify(tagIds));
    return new Set(tagIds);
}

// Get one tag by id
export async function getTag(tagId: string): Promise<string | null> {
    const response = await fetchWithTimeout(`./api/tags?id=${tagId}`, { headers: {} });
    if (!response.ok) {
        console.error("Error fetching tag:", response.statusText);
        return null;
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

// Editable Class Properties.
export async function loadClassProperties(classId: string): Promise<ClassProperty> {
    const propertiesResponse = await fetchWithTimeout("./api/class_properties", {
        headers: {
            id: classId,
        },
    });

    if (!propertiesResponse.ok || propertiesResponse.status != 200 || !propertiesResponse.body) {
        console.error("Couldn't find class property!");
        return new Object() as ClassProperty;
    }

    const propertiesResponseText = new TextDecoder().decode((await propertiesResponse.body.getReader().read()).value);

    if (propertiesResponseText === "" || typeof propertiesResponseText === undefined) {
        console.warn("Invalid JSON response from class_properties, returning empty properties");
        return new Object() as ClassProperty;
    }

    return JSON.parse(propertiesResponseText) as ClassProperty;
}

// Load from two collections
export async function loadCombinedClass(classId: string): Promise<CombinedClass> {
    const classResponse = await fetchWithTimeout("./api/classes", {
        headers: {
            id: classId,
        },
    });

    const combinedClass = {} as CombinedClass;

    if (!classResponse.ok || classResponse.status != 200 || !classResponse.body) {
        console.error("Could not find class!");
        return {} as CombinedClass;
    }

    const classResponseText = new TextDecoder().decode((await classResponse.body.getReader().read()).value);
    const classJSON = JSON.parse(classResponseText);
    const newClass = classJSON as Class;
    combinedClass.classData = newClass;

    // Getting the class property
    const newProperties: ClassProperty = await loadClassProperties(classId);

    // Combining the class property
    combinedClass.classProperties = newProperties;

    return combinedClass;
}

//
export async function loadCombinedClasses(classIds: string[]): Promise<CombinedClass[]> {
    const classData: CombinedClass[] = [];

    for (let i = 0; i < classIds.length; i++) {
        const newClass: CombinedClass | null = await loadCombinedClass(classIds[i]);

        if (newClass) {
            classData.push(newClass);
        }
    }

    return classData;
}

export async function loadAllCombinedClasses(): Promise<CombinedClass[]> {
    return retry(async () => {
        const response = await fetch("/api/classes", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`Failed to fetch classes: ${response.statusText}`);

        const classes = await response.json();
        const combined = await Promise.all(
            classes.map(async (classItem: Class) => {
                const propsResponse = await fetch("/api/class_properties", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        id: classItem._id,
                    },
                });

                if (!propsResponse.ok) throw new Error(`Failed to fetch properties for class ${classItem._id}`);

                const props = await propsResponse.json();
                return {
                    classData: classItem,
                    classProperties: props,
                    event: undefined,
                };
            })
        );

        return combined;
    });
}

// DELETES
export async function deleteClass(classID: string) {
    console.log("deleting " + classID);
}

// INSERTs/POSTs

// Insert class
// Include try catch maybe
export async function insertClass(classData: Class): Promise<string | null> {
    const response = await fetchWithTimeout("api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classData),
    });

    if (!response.ok) {
        console.error("Error inserting class: " + response.statusText);
        return null;
    }

    const result = await response.json();
    return result.insertedId ?? null;
}

// Insert class_property
// Include try catch maybe
export async function insertClassProperty(classProperties: ClassProperty) {
    const response = await fetchWithTimeout("api/class_properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classProperties),
    });

    if (!response.ok) {
        console.error("Error inserting class: " + response.statusText);
        return null;
    }

    const result = await response.json();
    return result.insertedId ?? null;
}

// Insert combined class
export async function insertCombinedClass(combinedClass: CombinedClass) {
    const classId = await insertClass(combinedClass.classData);

    if (classId == null) {
        console.error("Failed to insert class");
        return;
    } else {
        console.log(classId + " : Inserted class successfully!\n");
    }
    combinedClass.classProperties._id = classId;
    const classPropId = await insertClassProperty(combinedClass.classProperties);

    if (classPropId == null) {
        console.error("Failed to insert class properties. Try again...");
    } else {
        console.log(classPropId + " : Inserted class properties successfully!\n");
    }
}

// Insert tag
export async function insertTag(tagName: string): Promise<string | null> {
    // Process tagName: convert to lowercase and remove spaces
    const processedTag = tagName.toLowerCase().replace(/\s+/g, "");
    const response = await fetchWithTimeout("api/tags", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: processedTag,
    });
    if (!response.ok) {
        console.error("Error inserting tag: " + response.statusText);
        return null;
    }
    return processedTag;
}

// --------
// PUTS/UPDATES

export async function updateCombinedClass(combinedClass: CombinedClass) {
    console.log("Updating class: " + combinedClass.classData._id);
    const classResponse = await fetchWithTimeout("/api/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(combinedClass.classData),
    });

    if (!classResponse.ok) {
        console.error("Error updating class: " + classResponse.statusText);
        return;
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
}
