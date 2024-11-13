import { ClassInfo } from "./types";

export default async function fetchWithTimeout(requestURL: string, options = {}, timeout = 5000) {
    const controller = new AbortController();
    let response: Response;

    const timeoutID = setTimeout(
        () => controller.abort(),
        timeout
    );

    if (!requestURL) {
        console.log("options\n"+options);
        response = new Response(null, { status: 408 });
    } else {
        try {
            response = await fetch(
                requestURL,
                {
                    ...options,
                    signal: controller.signal
                }
            );
        } catch (error) {
            console.log(error);
            response = new Response(null, { status: 408 });
        }
    }

    return response;
}

export async function loadClassDataOfUser(authentication_hash: string): Promise<ClassInfo[]> {
    const classData: ClassInfo[] = [];

    const response = await fetchWithTimeout(
        './api/users',
        {
            headers: {
                'authentication_hash': authentication_hash
            }
        }
    );

    console.log(response);

    if (response.status == 200) {
        if (response.body) {
            const responseText = new TextDecoder().decode(
                (await response.body.getReader().read()).value
            );
            const userJSON = JSON.parse(responseText);

            const classes = userJSON.classes;

            for (let i = 0; i < classes.length; i++) {
                const classResponse = await fetchWithTimeout(
                    './api/classes',
                    {
                        headers: {
                            'id': classes[i]
                        }
                    }
                );

                if (classResponse.status == 200 && classResponse.body) {
                    const classResponseText = new TextDecoder().decode(
                        (await classResponse.body.getReader().read()).value
                    );
                    const classJSON = JSON.parse(classResponseText);
                    const newClass = classJSON as ClassInfo;
                    classData.push(newClass);
                }
            }
        }
    }

    return classData;
}