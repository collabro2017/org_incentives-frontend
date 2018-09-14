import moment, { Moment } from 'moment';
import { WindowType } from "../exercise-windows/window-reducer";
import { APIPurchaseOpportunity } from "../instruments/instruments-reducer";

export interface Entity {
    name: string;
    optionPlans: OptionPlan[],
    windows: Window[]
}

export interface Window {
    id: string,
    from: Moment,
    to: Moment,
    paymentDeadline: Moment,
    type: WindowType,
    allowed_exercise_types: string[],
    require_bank_account: boolean,
    require_share_depository: boolean,
    commission_percentage?: number,
}

export interface PurchaseWindow extends Window {
    purchase_opportunity: APIPurchaseOpportunity
}

export interface OptionPlan {
    name: string;
    vestingEvents: VestingEvent[];
    settlementType: string;
    expiryDate: Moment;
    agreements: Agreement[];
    subPlan: SubPlan[];
}

export interface VestingEvent {
    daysAfterGrantDate: number;
    percentage: number;
    price: number;
}

interface SubPlan {

}

export interface Client {
    name: string
}

export interface Agreement {
    grantDate: Moment,
    position: string;
    person: string;
    amount: number;
    termination?: Moment;
}

interface OptionEntity {
    person: string;
    amount: number;
}

export interface ExternalParameters {
    volatilityRate: number;
    interestRate: number;
    stockPrice: number;
}

export interface InstrumentsAgreement {
    amount: number;
    grantDate: Moment;
    vestingEvents: VestingEvent[];
    planName: string;
    expiryDate: Moment;
}
