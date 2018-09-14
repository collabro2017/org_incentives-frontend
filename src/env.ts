declare let process: {
    env: {
        NODE_ENV: string,
        AUTH_REDIRECT_URL?: string,
        VERSION_ID?: string,
        PILOT?: string
    }
};

let AUTH_REDIRECT_URL = '';
let API_ROOT = '';
let AUTH0_CLIENT_ID = 'BkqQvyiqfsrPoNM0yLKiqZ7yG46p2iWt';
let AUTH0_DOMAIN = 'optioincentives.eu.auth0.com';
let AUTH0_NAMESPACE = 'https://portal.optioincentives.no/';
let SENTRY_DSN = null;
let SENTRY_WHITELIST = [];
let SENTRY_VERSION = process.env.VERSION_ID || undefined;
let AUTH0_BATCH_SIZE = 2;
let AUTH0_DELAY_IN_MILLISECONDS = 1100;
let LOGOUT_CALLBACK_URL = '';

if (process.env.NODE_ENV === 'development-local') {
    AUTH_REDIRECT_URL = 'http://localhost:8080/loggedin';
    API_ROOT = "http://localhost:3000/api/v1";
    LOGOUT_CALLBACK_URL = 'http://localhost:8080/logout';
}

if (process.env.NODE_ENV === 'development') {
    AUTH_REDIRECT_URL = 'https://sharp-blackwell-0daac9.netlify.com/loggedin';
    API_ROOT = "https://incentives-186112.appspot.com/api/v1";
    LOGOUT_CALLBACK_URL = 'http://localhost:8080/logout';
}

if (process.env.NODE_ENV === 'test') {
    AUTH_REDIRECT_URL = 'https://test.optioincentives.no/loggedin';
    API_ROOT = "https://incentives-186112.appspot.com/api/v1";
    SENTRY_DSN = 'https://831c2884e7b349baacf43b018b6450fc@sentry.io/280455';
    SENTRY_WHITELIST = ['test.optioincentives.no']
    LOGOUT_CALLBACK_URL = 'https://test.optioincentives.no/logout';
}

if (process.env.NODE_ENV === 'production') {
    AUTH_REDIRECT_URL = 'https://portal.optioincentives.no/loggedin';
    API_ROOT = "https://production-dot-incentives-186112.appspot.com/api/v1";
    AUTH0_CLIENT_ID = '3IFnpa2nPyvliqQIoezRLeHGPVtqtMaT';
    AUTH0_DOMAIN = 'optioincentives-p.eu.auth0.com';
    SENTRY_DSN = 'https://8d0845e5a5bb45d8bf2d57ae5016c1b2@sentry.io/289813';
    SENTRY_WHITELIST = ['portal.optioincentives.no'];
    AUTH0_BATCH_SIZE = 40;
    LOGOUT_CALLBACK_URL = 'https://portal.optioincentives.no/logout';
}

if (process.env.PILOT === 'true') {
    AUTH_REDIRECT_URL = 'https://pilot.optioincentives.no/loggedin';
    API_ROOT = "https://production-dot-incentives-186112.appspot.com/api/v1";
    AUTH0_CLIENT_ID = '3IFnpa2nPyvliqQIoezRLeHGPVtqtMaT';
    AUTH0_DOMAIN = 'optioincentives-p.eu.auth0.com';
    SENTRY_DSN = 'https://8d0845e5a5bb45d8bf2d57ae5016c1b2@sentry.io/289813';
    SENTRY_WHITELIST = ['pilot.optioincentives.no'];
    LOGOUT_CALLBACK_URL = 'https://pilot.optioincentives.no/logout';
}

if (process.env.AUTH_REDIRECT_URL) {
    AUTH_REDIRECT_URL = process.env.AUTH_REDIRECT_URL;
}

const AUTH0_LOGOUT_URL = `https://${AUTH0_DOMAIN}/v2/logout?returnTo=${LOGOUT_CALLBACK_URL}&client_id=${AUTH0_CLIENT_ID}`;

export { AUTH_REDIRECT_URL, API_ROOT, AUTH0_CLIENT_ID, AUTH0_DOMAIN, AUTH0_NAMESPACE, SENTRY_DSN, SENTRY_WHITELIST, SENTRY_VERSION, AUTH0_BATCH_SIZE, AUTH0_DELAY_IN_MILLISECONDS, AUTH0_LOGOUT_URL };
