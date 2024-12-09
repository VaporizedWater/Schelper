import { Class, ClassProperty, CombinedClass } from "../../lib/types";

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

// Unchanging Class Identifiers.

export async function loadClassFromID(classId: string): Promise<CombinedClass> {
    const classResponse = await fetchWithTimeout("./api/classes", {
        headers: {
            id: classId,
        },
    });

    const propertiesResponse = await fetchWithTimeout("./api/class_properties", {
        headers: {
            id: classId,
        },
    });

    const combinedClass = new Object as CombinedClass;

    if (classResponse.status == 200 && classResponse.body) {
        const classResponseText = new TextDecoder().decode((await classResponse.body.getReader().read()).value);
        const classJSON = JSON.parse(classResponseText);
        const newClass = classJSON as Class;
        combinedClass.classData = newClass;

        if (propertiesResponse.status == 200 && propertiesResponse.body) {
            const propertiesResponseText = new TextDecoder().decode((await propertiesResponse.body.getReader().read()).value);
            const propertiesJSON = JSON.parse(propertiesResponseText);
            const newProperties = propertiesJSON as ClassProperty;
            combinedClass.classProperties = newProperties;
        }

        return combinedClass;
    }

    return new Object as CombinedClass;
}

export async function loadClassFromIDs(classIds: string[]): Promise<CombinedClass[]> {
    const classData: CombinedClass[] = [];

    for (let i = 0; i < classIds.length; i++) {
        const newClass: CombinedClass | null = await loadClassFromID(classIds[i]);

        if (newClass) {
            classData.push(newClass);
        }
    }

    return classData;
}

export async function loadClassOfUser(auth: string): Promise<CombinedClass[]> {
    const response = await fetchWithTimeout("./api/users", {
        headers: {
            authentication_hash: auth,
        },
    });

    if (response.status == 200 && response.body) {
        const responseText = new TextDecoder().decode((await response.body.getReader().read()).value);
        const userJSON = JSON.parse(responseText);
        const classes = userJSON.classes;

        const classData: CombinedClass[] = await loadClassFromIDs(classes);

        return classData;
    } else {
        console.log("response failed");
    }

    return new Object as CombinedClass[];
}

// Editable Class Properties.

export async function loadClassPropertiesFromID(classId: string): Promise<ClassProperty> {
    const propertiesResponse = await fetchWithTimeout("./api/class_properties", {
        headers: {
            id: classId,
        },
    });

    if (propertiesResponse.status == 200 && propertiesResponse.body) {
        const propertiesResponseText = new TextDecoder().decode((await propertiesResponse.body.getReader().read()).value);
        const propertiesJSON = JSON.parse(propertiesResponseText);
        const newProperties = propertiesJSON as ClassProperty;

        return newProperties;
    }

    return new Object as ClassProperty;
}