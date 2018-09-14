
export enum InstrumentType {
    WARRANT = 'warrant', OPTION = "option", RSU = "rsu", RSA = "rsa"
}

export interface TextTerm {
    singular: string,
    plural: string,
}

export const instrumentTypeText = (instrumentType: InstrumentType): TextTerm => {
    switch (instrumentType) {
        case InstrumentType.WARRANT: return {
            singular: 'warrant',
            plural: 'warrants'
        };
        case InstrumentType.OPTION: return {
            singular: 'option',
            plural: 'options'
        };
        case InstrumentType.RSU: return {
            singular: 'RSU',
            plural: 'RSUs'
        };
        case InstrumentType.RSA: return {
            singular: 'RSA',
            plural: 'RSAs'
        }
    }
};