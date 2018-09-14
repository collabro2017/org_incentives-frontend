import moment, { Moment } from "moment";
import { SharePrice } from "../exercise/exercise-router";
import { calculateGains, instrumentQuantity } from "../employee-portal/overview";
import { flatten } from "../utils/utils";
import {removeExpiredAwards, vestedAwards} from "./instruments-page";
import { Reducer } from "redux";

interface OptionState {
    allAwards: FlatAward[],
    gain: { totalGain: number, vestedGain: number },
    totalQuantity: number,
    vestedQuantity: number
}

export interface IndividualInstrumentState {
    allAwards: FlatAward[],
    gain: { totalGain: number, vestedGain: number },
    totalQuantity: number,
    vestedQuantity: number,
    performance: boolean,
}

export interface InstrumentState {
    readonly options: FlatAward[],
    readonly rsus: FlatAward[],
    readonly rsas: FlatAward[],
    readonly option: IndividualInstrumentState,
    readonly warrant: IndividualInstrumentState,
    readonly rsu: IndividualInstrumentState,
    readonly rsa: IndividualInstrumentState,
    readonly exercisibleAwards: FlatAward[],
    readonly exercisibleInstrumentsTerm: ExercisibleInstrumentsTerm,
    readonly totalQuantity: number,
    readonly totalVestedQuantity: number,
    readonly totalGain: number,
    readonly totalVestedGain: number,
    readonly isFetchingWelcomeData: boolean,
    readonly sharePrice?: SharePrice,
    readonly errorFetchingWelcomeData?: boolean
    readonly error?: any,
}

export interface APIPurchaseOpportunity {
    id: string,
    documentId?: string,
    maximumAmount: number,
    purchasedAmount: number,
    showShareDepository: boolean,
    price: string,
    instrument: string,
    windowId?: string
}

export interface ExercisibleInstrumentsTerm {
    singular: string,
    plural: string,
}

const createDefaultIndividualInstrumentState = () => ({
    allAwards: [],
    gain: { totalGain: 0, vestedGain: 0 },
    totalQuantity: 0,
    vestedQuantity: 0,
    performance: false
});

const initialState: InstrumentState = {
    options: [],
    rsus: [],
    rsas: [],
    option: createDefaultIndividualInstrumentState(),
    warrant: createDefaultIndividualInstrumentState(),
    rsa: createDefaultIndividualInstrumentState(),
    rsu: createDefaultIndividualInstrumentState(),
    exercisibleAwards: [],
    totalQuantity: 0,
    totalVestedQuantity: 0,
    totalGain: 0,
    totalVestedGain: 0,
    exercisibleInstrumentsTerm: {
        singular: '',
        plural: ''
    },
    isFetchingWelcomeData: false,
    sharePrice: null,
};

type InstrumentType = 'option' | 'rsu' | 'rsa' | 'warrant'
type SettlementType = 'equity' | 'cash'

interface InstrumentAward {
    programId: string,
    programName: string,
    subProgramName: string,
    quantity: number,
    vestingEvents: Vesting[],
    instrumentType: InstrumentType,
    settlementType: SettlementType,
    performance: boolean,
}

interface Vesting {
    quantity: number,
    strike: number,
    id: string,
    exercisedQuantity: number,
    grantDate: Moment
    vestedDate: Moment
    expiryDate: Moment,
    purchasePrice?: number,
}

export interface APIAward {
    id: string,
    grantDate: string,
    expiryDate: string,
    vesting: any,
    quantity: number,
    employee_id: string,
    incentive_sub_program: {
        id: string,
        name: string,
        instrumentTypeId: InstrumentType,
        settlementTypeId: SettlementType,
        incentive_program_id: string,
        performance: boolean,
        incentive_program: {
            name: string,
            id: string,
        }
    }
    vesting_events: APIVestingEvent[]
}

interface APIVestingEvent {
    quantity: string,
    strike: string,
    grant_date: string,
    vestedDate: string,
    expiry_date: string,
    exercised_quantity: number,
    id: string,
    purchase_price: string,
}

const toInstrumentAward = (award: APIAward): InstrumentAward => ({
    programId: award.incentive_sub_program.incentive_program.id,
    programName: award.incentive_sub_program.incentive_program.name,
    subProgramName: award.incentive_sub_program.name,
    quantity: award.quantity,
    vestingEvents: award.vesting_events.map((ve) => ({
        quantity: parseFloat(ve.quantity),
        strike: parseFloat(ve.strike),
        id: ve.id,
        exercisedQuantity: ve.exercised_quantity,
        grantDate: moment(ve.grant_date),
        vestedDate: moment(ve.vestedDate),
        expiryDate: moment(ve.expiry_date),
        purchasePrice: parseFloat(ve.purchase_price)
    })),
    instrumentType: award.incentive_sub_program.instrumentTypeId,
    settlementType: award.incentive_sub_program.settlementTypeId,
    performance: award.incentive_sub_program.performance,
});

export interface FlatAward {
    grantDate: Moment,
    expiryDate: Moment,
    vestedDate: Moment,
    quantity: number,
    exercisedQuantity: number,
    strike: number,
    purchasePrice?: number,
    subProgramName: string,
    programName: string,
    programId: string,
    vestingEventId: string,
    instrumentType: InstrumentType,
    settlementType: SettlementType,
    performance: boolean,
}

const toFlatAwards = (award: InstrumentAward): FlatAward[] => award.vestingEvents.map((vestingEvent) => ({
    grantDate: vestingEvent.grantDate,
    vestedDate: moment(vestingEvent.vestedDate),
    expiryDate: moment(vestingEvent.expiryDate),
    quantity: vestingEvent.quantity,
    exercisedQuantity: vestingEvent.exercisedQuantity,
    strike: vestingEvent.strike,
    programId: award.programId,
    vestingEventId: vestingEvent.id,
    subProgramName: award.subProgramName,
    programName: award.programName,
    instrumentType: award.instrumentType,
    performance: award.performance,
    settlementType: award.settlementType,
    purchasePrice: vestingEvent.purchasePrice,
}));

const keepOptions = (instrumentAward: InstrumentAward) => instrumentAward.instrumentType === 'option';
const keepRsus = (instrumentAward: InstrumentAward) => instrumentAward.instrumentType === 'rsu';
const keepRsas = (instrumentAward: InstrumentAward) => instrumentAward.instrumentType === 'rsa';
const keepWarrants = (instrumentAward: InstrumentAward) => instrumentAward.instrumentType === 'warrant';

const instrumentReducer: Reducer<InstrumentState> = (state = initialState, action): InstrumentState => {

    if (action.type === 'FETCH_EMPLOYEE_PORTAL_WELCOME_SUCCEEDED') {
        const { welcomeData } = action;
        const awards = welcomeData.awards.map(toInstrumentAward);

        const options = flatten(awards.filter(keepOptions).map(toFlatAwards));
        const rsus = flatten(awards.filter(keepRsus).map(toFlatAwards));
        const rsas = flatten(awards.filter(keepRsas).map(toFlatAwards));
        const warrants = flatten(awards.filter(keepWarrants).map(toFlatAwards));


        const sharePrice = {
            sharePrice: parseFloat(welcomeData.stockPrice.price),
            sharePriceDate: moment(welcomeData.stockPrice.date)
        };

        const optionsGain = calculateGains(options, sharePrice.sharePrice);
        const rsuGain = calculateGains(rsus, sharePrice.sharePrice);
        const rsaGain = calculateGains(rsas, sharePrice.sharePrice);
        const warrantsGain = calculateGains(warrants, sharePrice.sharePrice);

        const optionState: IndividualInstrumentState = options.length > 0 ? {
            allAwards: options,
            gain: optionsGain,
            totalQuantity: options.filter(removeExpiredAwards).reduce(instrumentQuantity, 0),
            vestedQuantity: options.filter(removeExpiredAwards).filter(vestedAwards).reduce(instrumentQuantity, 0),
            performance: options.some(hasPerformanceCriteria)
        } : createDefaultIndividualInstrumentState();

        const warrantState: IndividualInstrumentState = warrants.length > 0 ? {
            allAwards: warrants,
            gain: warrantsGain,
            totalQuantity: warrants.filter(removeExpiredAwards).reduce(instrumentQuantity, 0),
            vestedQuantity: warrants.filter(removeExpiredAwards).filter(vestedAwards).reduce(instrumentQuantity, 0),
            performance: warrants.some(hasPerformanceCriteria)
        } : createDefaultIndividualInstrumentState();

        const rsuState: IndividualInstrumentState = rsus.length > 0 ? {
            allAwards: rsus,
            gain: rsuGain,
            totalQuantity: rsus.filter(removeExpiredAwards).reduce(instrumentQuantity, 0),
            vestedQuantity: rsus.filter(removeExpiredAwards).filter(vestedAwards).reduce(instrumentQuantity, 0),
            performance: rsus.some(hasPerformanceCriteria)
        } : createDefaultIndividualInstrumentState();

        const rsaState: IndividualInstrumentState = rsus.length > 0 ? {
            allAwards: rsas,
            gain: rsaGain,
            totalQuantity: rsas.filter(removeExpiredAwards).reduce(instrumentQuantity, 0),
            vestedQuantity: rsas.filter(removeExpiredAwards).filter(vestedAwards).reduce(instrumentQuantity, 0),
            performance: rsus.some(hasPerformanceCriteria)
        } : createDefaultIndividualInstrumentState();

        const allInstruments = [optionState, warrantState, rsaState, rsuState];
        const exercisibleAwards = flatten([optionState.allAwards, warrantState.allAwards]).filter(vestedAwards).filter(removeExpiredAwards).filter(inTheMoney.bind(this, sharePrice.sharePrice));
        const exercisibleInstrumentsTerm = getExercisibleInstrumentsTerm(optionState.allAwards.filter(removeExpiredAwards), warrantState.allAwards.filter(removeExpiredAwards));

        return {
            ...state,
            options,
            rsus,
            rsas,
            isFetchingWelcomeData: false,
            sharePrice,
            option: optionState,
            warrant: warrantState,
            rsa: rsaState,
            rsu: rsuState,
            totalGain: allInstruments.reduce((accu, instrument) => instrument.gain.totalGain + accu, 0),
            totalVestedGain: allInstruments.reduce((accu, instrument) => instrument.gain.vestedGain + accu, 0),
            totalQuantity: allInstruments.reduce((accu, instrument) => instrument.totalQuantity + accu, 0),
            totalVestedQuantity: allInstruments.reduce((accu, instrument) => instrument.vestedQuantity + accu, 0),
            exercisibleAwards,
            exercisibleInstrumentsTerm,
        };
    } else if (action.type === 'FETCH_EMPLOYEE_PORTAL_WELCOME_FAILED') {
        return { ...state, ...{ isFetchingWelcomeData: false, error: action.error, errorFetchingWelcomeData: true } };
    } else if (action.type === 'FETCH_EMPLOYEE_PORTAL_WELCOME') {
        return { ...state, ...{ isFetchingWelcomeData: true } };
    }
    return state;
};

const inTheMoney = (sharePrice: number, award: FlatAward): boolean => sharePrice >= award.strike;

const getExercisibleInstrumentsTerm = (options: FlatAward[], warrants: FlatAward[]) => {
    if (options.length > 0 && warrants.length > 0) {
        return {
            singular: "option/warrant",
            plural: "options/warrants"
        };
    }

    if (options.length > 0) {
        return {
            singular: "option",
            plural: "options",
        };
    }

    return {
        singular: "warrant",
        plural: "warrants"
    }
};

export const hasPerformanceCriteria = (award: FlatAward) => award.performance;


export default instrumentReducer;