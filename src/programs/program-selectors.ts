import { RootState } from "../reducers/all-reducers";
import { flatten } from "../utils/utils";
import { SubProgram } from "../subprograms/subprogram-reducer";
import { Program } from "./program-reducer";
import { Award, VestingEvent } from "../awards/award-reducer";

export const token = (state) => state.user.token;
export const isSysadmin = (state) => state.user.isSysadmin;
export const tenantId = (state) => state.tenant.selectedTenant.id;

const allSubprograms = (programs: Program[]): SubProgram[] => flatten(programs.map(p => p.incentive_sub_programs));
export const subprogramById = (subprogramId: string) => (state: RootState): SubProgram | undefined => allSubprograms(state.program.allPrograms).filter(sp => sp.id === subprogramId)[0];

const allAwards = (programs: Program[]): Award[] => flatten(allSubprograms(programs).map(sp => sp.awards));
const allTranches = (programs: Program[]): VestingEvent[] => flatten(allAwards(programs).map(a => a.vesting_events));

export const trancheById = (trancheId: string) => (state: RootState): VestingEvent | undefined => allTranches(state.program.allPrograms).filter(tranche => tranche.id === trancheId)[0];
