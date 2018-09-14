import { combineReducers } from "redux";
import user, { UserState } from "./user";
import entity, { EntityState } from "../entity/entity-reducer"
import tenant, { TenantState } from "../tenant/tenant-reducer";
import employee, { EmployeeState } from "../employees/employee-reducer";
import program, { ProgramState } from "../programs/program-reducer";
import { routerReducer } from 'react-router-redux'
import subProgram, { SubProgramState } from "../subprograms/subprogram-reducer";
import order, { OrderState } from '../exercise/order/order-reducer';
import award, { AwardState } from "../awards/award-reducer";
import instrument, { InstrumentState } from '../instruments/instruments-reducer';
import features, { Features } from '../features/features-reducer';
import sharePrice, { SharePriceState } from '../share-price/share-price-reducer';
import exerciseWindow, { ExerciseWindowState } from '../exercise-windows/window-reducer';
import employeePortalTexts, { TextState as EmployeePortalTextState} from "../texts/employee-portal-texts-reducer";
import adminOrder, { OrderState as AdminOrderState } from '../admin/orders/orders-reducer';
import file, { FileState } from '../files/files-reducer';
import document, { DocumentState } from "../documents/document-reducer";
import text, { TextState } from "../texts/text-reducer";
import purchase, { PurchaseState } from "../purchase/duck/purchase-reducer";
import content, { ContentState } from "../admin/content/content-reducer";
import importReducer, { ImportState } from "../import/import-reducer";
import form, { FormState } from "../forms/form-reducer";
import dividend, { DividendState } from "../admin/dividend/dividend-reducer";

export interface RootState {
    user: UserState,
    tenant: TenantState,
    entity: EntityState,
    employee: EmployeeState,
    instrument: InstrumentState,
    order: OrderState,
    features: Features,
    program: ProgramState,
    subProgram: SubProgramState,
    award: AwardState,
    sharePrice: SharePriceState,
    exerciseWindow: ExerciseWindowState,
    adminOrder: AdminOrderState,
    file: FileState,
    document: DocumentState,
    text: TextState,
    employeePortalTexts: EmployeePortalTextState,
    purchase: PurchaseState,
    content: ContentState,
    dividend: DividendState,
    import: ImportState,
    form: FormState
}

const rootReducer = combineReducers<RootState>({
    routing: routerReducer,
    content,
    user,
    tenant,
    entity,
    employee,
    instrument,
    order,
    features,
    program,
    subProgram,
    text,
    award,
    sharePrice,
    exerciseWindow,
    document,
    file,
    adminOrder,
    employeePortalTexts,
    import: importReducer,
    purchase,
    dividend,
    form
});

export default rootReducer;