// src/Auth/Auth.js
import { Auth0LockPasswordless } from 'auth0-lock';
import jwtDecode from 'jwt-decode';
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN, AUTH_REDIRECT_URL } from "../env";
import Raven from "raven-js";

const authenticationOff = false;

interface Token {
    app_metadata: AppMetadata,
    user_metadata: UserMetadata,
    email: string,
}

interface AppMetadata {
    tenants: string[],
    roles: string[]
}

interface UserMetadata {
    selectedTenantId?: string,
    name: string,
}

const lockLanguageSpec = {
    passwordlessEmailInstructions: 'Enter your email to sign in.',
    success: {
        magicLink: "We sent you a link to log in<br />to %s. Check your spam filter if it does not appear in your inbox."
    },
    error: {
        passwordless: {
            "bad.connection": `We're sorry, an error occurred. Check your email for typos or contact us at support@optioincentives.no`,
        }
    },
    title: 'Optio Incentives Portal'
};

export const parseAuthUrl = () => new Promise((resolve, reject) => {
    lock.on('authenticated', (authResult: any) => {
        resolve(authResult);
    });

    lock.on('authorization_error', (error) => {
        if (error) {
            const authError = new Error(error.error);
            console.log(error.error);
            console.log(error.errorDescription);
            Raven.captureException(authError, { extra: error });
        }
        reject(error);
    });

    lock.on('unrecoverable_error', (error) => {
        Raven.captureException(error);
        reject(error);
    });
});


export const updateSession = () => new Promise<AuthResult>((resolve, reject) => {
    lock.checkSession(checkSessionOptions, function (error, authResult) {
        if (error || !authResult) {
            reject(error || new Error("Updating session: Both error and authResult are null"))
        } else {
            resolve(authResult);
        }
    });
});

export const setSession = (authResult: AuthResult) => {
    let expiresAt = JSON.stringify(authResult.idTokenPayload.exp * 1000);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
};

export const clearLoginStateFromLocalStorage = () => {
    // Clear access token and ID token from local storage
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('selectedTenant');
};

export const isAuthenticated = () =>  {
    // Check whether the current time is past the
    // access token's expiry time
    if (authenticationOff) {
        return true;
    }

    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    const now = new Date().getTime();
    return now < expiresAt;
}

export const token = () => localStorage.getItem('id_token');

export const decodedToken = (): Token => {
    const id_token = token();
    return id_token && jwtDecode(id_token);
};

export const showLock = () => lock.show();

const checkSessionOptions = {
    responseType: 'token id_token',
};

const lock = new Auth0LockPasswordless(AUTH0_CLIENT_ID, AUTH0_DOMAIN, {
    allowedConnections: ['email'],
    allowSignUp: false,
    closable: false,
    passwordlessMethod: "link",
    languageDictionary: lockLanguageSpec,
    responseType: 'token id_token',
    rememberLastLogin: false,
    auth: {
        redirectUrl: AUTH_REDIRECT_URL,
        params: {
            scope: 'openid email'
        },
        responseType: 'token',
    },
    theme: {
        labeledSubmitButton: false,
        logo: 'https://storage.googleapis.com/optio-incentives-public/logos/4_EPS.gif',
        primaryColor: '#607D8B',
    }
});

interface AuthResult {
    idTokenPayload: any,
    idToken: string
}
