import {
    DELETE_TENANT, DELETE_TENANT_SUCCEEDED,
    FETCH_TENANTS, FETCH_TENANTS_SUCCEEDED,
    POST_TENANT_SUCCEEDED, PUT_TENANT, PUT_TENANT_SUCCEEDED,
    SELECT_TENANT
} from "./tenant-actions";
import { Reducer } from "redux";

export interface Tenant {
    id?: string,
    name: string,
    logo_url: string,
    bank_account_number?: string,
    bic_number?: string,
    iban_number?: string,
    currency_code: string,
    payment_address?: string,
    comment?: string,
    feature: {
        exercise: boolean,
        documents: boolean,
        purchase: boolean,
    }
}

export interface UpdateTenant {
    id?: string,
    name?: string,
    logo_url?: string,
    bic_number?: string,
    iban_number?: string,
    feature?: {
        exercise?: boolean,
        documents: boolean,
    }
}

export interface TenantState {
    readonly allTenants: Tenant[],
    readonly selectedTenant?: Tenant,
    readonly isFetching: boolean
}

const tenantFromLocalStorage = (): Tenant | null => JSON.parse(localStorage.getItem("selectedTenant"));

const initialState: TenantState = {
    allTenants: [],
    selectedTenant: tenantFromLocalStorage(),
    isFetching: false
};


const tenantReducer: Reducer<TenantState> = (state = initialState, action) =>  {
    if (action.type === FETCH_TENANTS) {
        return { ...state, ...{ isFetching: true } };
    }
    if (action.type === FETCH_TENANTS_SUCCEEDED) {
        return { ...state, ...{ allTenants: action.tenants }, isFetching: false };
    }

    if (action.type === SELECT_TENANT) {
        const tenant = state.allTenants.filter((t) => t.id === action.tenantId)[0];
        return { ...state, ...{ selectedTenant: tenant } };
    }

    if (action.type === POST_TENANT_SUCCEEDED) {
        return { ...state, allTenants: [...state.allTenants, action.tenant] };
    }

    if (action.type == PUT_TENANT) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === PUT_TENANT_SUCCEEDED) {
        if (state.selectedTenant.id) {
            const allTenants = state.allTenants.map((tenant) => tenant.id === action.selectedTenant.id ? action.selectedTenant : tenant);
            return { ...state, allTenants, selectedTenant: action.selectedTenant, isFetching: false };
        }
    }

    if (action.type === DELETE_TENANT) {
        return { ...state, ...{ isFetching: true } }
    }

    if (action.type === DELETE_TENANT_SUCCEEDED) {
        const allTenants = state.allTenants.filter((tenant) => tenant.id !== action.tenantId);
        return { ...state, allTenants: [...allTenants], isFetching: false };
    }

    return state;
};

export default tenantReducer;