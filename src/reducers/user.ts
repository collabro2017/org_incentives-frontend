import * as auth from '../auth/auth';
import { AUTH0_NAMESPACE } from "../env";
import { PurchaseWindow, Window } from "../data/data";
import moment from 'moment';
 import { Tenant, TenantState } from "../tenant/tenant-reducer";
 import { Reducer } from "redux";
import { APIEmployeeDocument } from "../files/files-reducer";
import { MARK_DOCUMENT_AS_READ, MARK_DOCUMENT_AS_READ_SUCCEEDED } from "../files/files-actions";
import { WindowType } from "../exercise-windows/window-reducer";
import { documentsRequiringAcceptance } from "../documents/documents-selectors";

const decodedIdToken = auth.decodedToken();

export interface UserState {
    readonly token: string,
    readonly decodedToken: any,
    readonly isSysadmin: boolean,
    readonly isAdmin: boolean,
    readonly loggedIn: boolean,
    readonly tenant?: Tenant,
    readonly name?: string,
    readonly windows?: Window[],
    readonly purchaseWindows?: Window[],
    readonly loginError: boolean,
    readonly currentExerciseWindow?: Window,
    readonly nextExerciseWindow?: Window,
    readonly currentPurchaseWindow?: PurchaseWindow,
    readonly nextPurchaseWindow?: PurchaseWindow,
    readonly expiresIn?: number,
    readonly documents?: APIEmployeeDocument[],
    readonly documentsNeedingAcceptance?: APIEmployeeDocument[],
    readonly isAcceptingDocument?: boolean,
    readonly currentDocumentIndex?: number,
}

const appMetadata = (decodedToken: any) => decodedToken[`${AUTH0_NAMESPACE}app_metadata`];
export const userMetadata = (decodedToken: any) => decodedToken[`${AUTH0_NAMESPACE}user_metadata`];

const initialState: UserState = {
    token: auth.token(),
    name: decodedIdToken && userMetadata(decodedIdToken).name,
    decodedToken: decodedIdToken,
    isSysadmin: decodedIdToken && appMetadata(decodedIdToken).roles.includes('sysadmin'),
    isAdmin: decodedIdToken && appMetadata(decodedIdToken).roles.includes('admin'),
    loggedIn: auth.isAuthenticated(),
    loginError: false,
    tenant: null,
    windows: null,
    purchaseWindows: [],
};

const findCurrentWindow = (windows: Window[]): Window | undefined => {
    const today = moment();
    return windows
        .filter(w => today.isBetween(w.from, w.to))
        .sort((w1, w2) => w1.from.isSameOrBefore(w2.from) ? 1 : 0)
        [0];
};

const findNextWindow = (windows: Window[]): Window | undefined => {
 const today = moment();
 return windows
     .filter(w => today.isBefore(w.from))
     .sort((w1, w2) => w1.from.isSameOrBefore(w2.from) ? 1 : 0)
     [0];
};

const userReducer: Reducer<UserState> = (state = initialState, action) => {
    if (action.type === 'PARSE_AUTH_HASH_SUCCEEDED') {
        const { idToken, idTokenPayload, expiresIn } = action.authResult;
        const updateObj = {
            token: idToken,
            decodedToken: idTokenPayload,
            isSysadmin: idTokenPayload && appMetadata(idTokenPayload).roles.includes('sysadmin'),
            isAdmin: idTokenPayload && appMetadata(idTokenPayload).roles.includes('admin'),
            name: idTokenPayload && userMetadata(idTokenPayload).name,
            expiresIn,
            loggedIn: true,
        };
        return { ...state, ...updateObj };

    } else if (action.type === 'PARSE_AUTH_HASH_FAILED') {
        return { ...state, loginError: true };

    } else if (action.type === 'FETCH_EMPLOYEE_PORTAL_WELCOME_SUCCEEDED') {
        const { tenant, windows, documents, purchase_opportunities } = action.welcomeData;

        const exerciseWindows: Window[] = windows.filter(keepType(WindowType.EXERCISE)).map(toWindow);
        const currentExerciseWindow = findCurrentWindow(exerciseWindows);
        const nextExerciseWindow = findNextWindow(exerciseWindows);

        const purchaseWindows: Window[] = windows.filter(keepType(WindowType.PURCHASE)).map(toWindow);
        const currentPurchaseWindow = findCurrentWindow(purchaseWindows);
        const nextPurchaseWindow = findNextWindow(purchaseWindows);

        return {
            ...state,
            tenant,
            windows: exerciseWindows,
            currentExerciseWindow,
            documents,
            documentsNeedingAcceptance: documentsRequiringAcceptance(documents),
            currentDocumentIndex: 0,
            nextExerciseWindow,
            currentPurchaseWindow: currentPurchaseWindow ? { ...currentPurchaseWindow, purchase_opportunity: purchase_opportunities && purchase_opportunities.filter(o => o.windowId === currentPurchaseWindow.id)[0] } : null,
            nextPurchaseWindow: nextPurchaseWindow ? { ...nextPurchaseWindow, purchase_opportunity: purchase_opportunities && purchase_opportunities.filter(o => o.windowId === nextPurchaseWindow.id)[0] } : null,
            purchaseWindows,
        };

    } else if (action.type === 'USER_NOT_AUTHORIZED') {
        return { ...state, loggedIn: auth.isAuthenticated() };
    } else if (action.type === MARK_DOCUMENT_AS_READ) {
        return { ...state, isAcceptingDocument: true };
    } else if (action.type === MARK_DOCUMENT_AS_READ_SUCCEEDED) {
        const previousIndex = state.documents.findIndex((doc) => action.documentId === doc.id);

        const documents = state.documents.map((d) => {
            if (d.id === action.documentId) {
                return { ...d, requires_acceptance: false, accepted_at: action.accepted_at }
            }
            return { ...d }
        });

        return { ...state, documents, isAcceptingDocument: false, currentDocumentIndex: previousIndex + 1 };
    }

    return state;
};

const keepType = (type: WindowType) => (w) => w.window_type === type;
const toWindow = (w): Window => ({
    id: w.id,
    from: moment(w.start_time),
    to: moment(w.end_time),
    paymentDeadline: moment(w.payment_deadline),
    type: w.window_type,
    allowed_exercise_types: w.allowed_exercise_types,
    require_share_depository: w.require_share_depository,
    require_bank_account: w.require_bank_account,
    commission_percentage: w.commission_percentage ? parseFloat(w.commission_percentage) : null,
});

export default userReducer;
