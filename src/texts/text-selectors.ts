import { RootState } from "../reducers/all-reducers";

export const token = (state) => state.user.token;
export const isSysadmin = (state) => state.user.isSysadmin;
export const tenantId = (state) => state.tenant.selectedTenant.id;
export const texts = (state) => state.text.allTexts;
export const defaultTexts = (state: RootState) => state.text.defaultTexts;