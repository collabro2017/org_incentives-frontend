import { APIEmployeeDocument } from "../files/files-reducer";

export const documentsRequiringAcceptance = (documents: APIEmployeeDocument[]): APIEmployeeDocument[] => documents.filter((d) => d.requires_acceptance);