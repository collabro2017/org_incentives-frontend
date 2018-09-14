import {
    watchFetchTenants, watchPostTenant, watchSelectTenant, watchPutTenant,
    watchPutTenantSucceeded, watchDeleteTenant, watchDeleteTenantSucceeded
} from "../tenant/tenant-saga";
import {
    watchCreateEntities,
    watchDeleteEntities,
    watchDeleteEntity,
    watchFetchEntities,
    watchPostEntity, watchPutEntity
} from "../entity/entity-saga";
import {
    watchCreateEmployees,
    watchDeleteAllEmployees,
    watchDeleteEmployee,
    watchFetchEmployees,
    watchFetchEntitiesAndEmployees,
    watchPostEmployee, watchTerminateEmployee, watchPutEmployee
} from "../employees/employee-saga";
import { watchLoginRequested, watchLogoutRequested, watchParseAuthHash } from "../auth/auth-saga";
import {
    watchAddProgram, watchAddSubProgram, watchDeleteAllPrograms, watchDeleteProgram, watchFetchEmployeesAndPrograms,
    watchFetchPrograms, watchImportAllProgramAwards, watchPostProgram, watchPutProgram
} from "../programs/program-saga";
import {
    watchAddVesting, watchPostSubProgram, watchFetchSubProgram,
    watchPutSubProgram, watchDeleteSubProgram
} from "../subprograms/subprogram-saga";
import {
    watchPostAward, watchAddAwardVesting, watchFetchAllTenantAwards, watchPutAward,
    watchDeleteAward
} from "../awards/award-saga"
import { watchFethEmployeePortalWelcome } from "../employee-portal/employee-portal-welcome-saga";
import { watchPostSharePrice, watchFetchSharePrice, watchDeleteSharePrice } from "../share-price/share-price-saga";
import { watchFetchUsersOrders, watchPlaceOrder } from "../exercise/order/order-saga";
import {
    watchPostExerciseWindow, watchFetchExerciseWindow,
    watchDeleteExerciseWindow, watchPutExerciseWindow
} from "../exercise-windows/window-saga";
import { watchKeepAlive } from "../auth/keep-alive-saga";
import { watchFetchTenantsOrders, watchPutTenantsOrders } from "../admin/orders/orders-saga";
import {
    watchAttatchEmployeeToFile, watchdeleteDocument, watchDeleteEmployeeAssociation, watchFetchEmployeesAndFiles,
    watchFetchFiles,
    watchFileDownload,
    watchMarkDocumentAsRead, watchUpdateEmployeeDocumentsForFile,
    watchUploadFiles
} from "../files/files-saga";
import { watchFetchDocuments } from "../documents/document-saga";
import { watchFetchTexts, watchPutText, watchUpdateDefaultTexts } from "../texts/text-saga";
import {
    watchCreatePurchaseConfig,
    watchDeletePurchaseConfig,
    watchUpdatePurchaseConfig
} from "../awards/purchase/purchase-saga";
import { watchCreatePurchaseOrder, watchFetchPurchaseDocument } from "../purchase/duck/purchase-saga";
import { watchFetchContent, watchUpdateContent } from "../admin/content/content-saga";
import { watchImportAllModels } from "../import/import-saga";
import { watchCreateDividend, watchFetchDividends } from "../admin/dividend/dividend-saga";
import {watchCreateTransaction, watchUpdateTransaction} from "../awards/transaction/transaction-saga";



export default function* root() {
    yield [
        watchFetchTenants(),
        watchPostTenant(),
        watchSelectTenant(),
        watchPutTenant(),
        watchPutTenantSucceeded(),
        watchDeleteTenant(),
        watchDeleteTenantSucceeded(),
        watchFetchEntities(),
        watchPostEntity(),
        watchDeleteEntity(),
        watchPutEntity(),
        watchCreateEntities(),
        watchDeleteEntities(),
        watchFetchEmployees(),
        watchPostEmployee(),
        watchDeleteEmployee(),
        watchPutEmployee(),
        watchCreateEmployees(),
        watchDeleteAllEmployees(),
        watchFetchEntitiesAndEmployees(),
        watchAddProgram(),
        watchAddSubProgram(),
        watchAddVesting(),
        watchCreatePurchaseConfig(),
        watchUpdatePurchaseConfig(),
        watchUpdateDefaultTexts(),
        watchDeletePurchaseConfig(),
        watchFetchPrograms(),
        watchPostProgram(),
        watchPutProgram(),
        watchDeleteProgram(),
        watchDeleteAllPrograms(),
        watchFetchEmployeesAndPrograms(),
        watchImportAllProgramAwards(),
        watchPostSubProgram(),
        watchFetchSubProgram(),
        watchPutSubProgram(),
        watchDeleteSubProgram(),
        watchFethEmployeePortalWelcome(),
        watchPostAward(),
        watchUpdateTransaction(),
        watchPutAward(),
        watchDeleteAward(),
        watchFetchDividends(),
        watchCreateDividend(),
        watchFetchAllTenantAwards(),
        watchAddAwardVesting(),
        watchCreateTransaction(),
        watchParseAuthHash(),
        watchPostSharePrice(),
        watchFetchFiles(),
        watchUploadFiles(),
        watchAttatchEmployeeToFile(),
        watchdeleteDocument(),
        watchFileDownload(),
        watchFetchPurchaseDocument(),
        watchCreatePurchaseOrder(),
        watchMarkDocumentAsRead(),
        watchFetchContent(),
        watchImportAllModels(),
        watchUpdateEmployeeDocumentsForFile(),
        watchUpdateContent(),
        watchFetchDocuments(),
        watchFetchEmployeesAndFiles(),
        watchDeleteEmployeeAssociation(),
        watchFetchSharePrice(),
        watchTerminateEmployee(),
        watchDeleteSharePrice(),
        watchPlaceOrder(),
        watchFetchUsersOrders(),
        watchPostExerciseWindow(),
        watchFetchExerciseWindow(),
        watchDeleteExerciseWindow(),
        watchPutExerciseWindow(),
        watchParseAuthHash(),
        watchKeepAlive(),
        watchFetchTenantsOrders(),
        watchLoginRequested(),
        watchLogoutRequested(),
        watchPutTenantsOrders(),
        watchFetchTexts(),
        watchPutText()
    ];
}