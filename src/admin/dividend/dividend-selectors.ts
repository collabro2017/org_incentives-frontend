import { RootState } from "../../reducers/all-reducers";

export const getDividends = (state: RootState) => state.dividend.dividends;
export const getIsFetchingDividends = (state: RootState) => state.dividend.isFetchingDividends;
