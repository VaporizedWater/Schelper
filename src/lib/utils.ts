import { headers } from "next/headers";
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

// LOADS/GETs

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
    const propertiesJSON = JSON.parse(propertiesResponseText);
    const newProperties = propertiesJSON as ClassProperty;
    return newProperties;
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

    let propId: string = newClass.associated_properties;

    // Getting the class property
    const newProperties: ClassProperty = await loadClassProperties(propId);

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

//
export async function loadClassesOfUser(auth: string): Promise<CombinedClass[]> {
    const response = await fetchWithTimeout("./api/users", {
        headers: {
            authentication_hash: auth,
        },
    });

    if (response.status == 200 && response.body) {
        const responseText = new TextDecoder().decode((await response.body.getReader().read()).value);
        const userJSON = JSON.parse(responseText);
        const classes = userJSON.classes;

        const classData: CombinedClass[] = await loadCombinedClasses(classes);

        return classData;
    } else {
        console.log("response failed");
    }

    return new Object() as CombinedClass[];
}

// DELETES
export async function deleteClass(classID: string) {}

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
    const classStatus = await insertClass(combinedClass.classData);

    if (classStatus == null) {
        console.error("Failed to insert class");
        return;
    } else {
        console.log(classStatus + "HI!");
    }

    const classPropStatus = await insertClassProperty(combinedClass.classProperties);

    if (classPropStatus == null) {
        console.error("Failed to insert class properties. Try again...");
    }
}
