import { API_ROOT } from "../env";

const HTTPMethod = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
};
export enum Method {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}

export interface Request {
    method: Method,
    body?: RequestBody,
    url: string,
    token: string
}

type RequestBody = CreateEmployeeDocumentBody

interface CreateEmployeeDocumentBody {

}

const settings = (method: string, body: any, token: string): RequestInit => {
    const bodyOrUndefined = body ? body : undefined; // Edge requires the body to be undefined on GET requests
    return ({
        method: method ? method : HTTPMethod.GET,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
        body: bodyOrUndefined
    });
};

export const NOT_AUTHORIZED = 401;
const checkHTTPStatus = (response): Promise<Response> => {
    return new Promise((resolve, reject) => {
        if (response.status == NOT_AUTHORIZED) {
            reject({ errorMessage: 'User not authorized', status: response.status, response });
        }

        if (!response.ok) {
            reject({ errorMessage: 'Something wrong happened', status: response.status, response });
            return;
        }

        resolve(response);
    });
};

export function callApi(endpoint, token?: string, method?: string, body?: any) {
    const url = API_ROOT + endpoint;
    const jsonBody = body ? JSON.stringify(body) : null;

    return new Promise((resolve, reject) => {
        return fetch(url, settings(method, jsonBody, token))
            .then(checkHTTPStatus)
            .then(response => resolve(response.json()))
            .catch(error => {
                console.error(error);
                reject(error);
            });
    });
}

export function submitForm(endpoint: string, token: string, body: FormData) {
    const url = API_ROOT + endpoint;

    return new Promise((resolve, reject) => {
        return fetch(url, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: body
        })
            .then(checkHTTPStatus)
            .then(response => resolve(response.json()))
            .catch(error => {
                console.error(error);
                reject(error);
            });
    });
}

