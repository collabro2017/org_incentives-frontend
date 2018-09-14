import {groupBy, GroupByProperty, GroupedByLines} from "./utils";
import {Moment} from "moment";
import {sumNumbers} from "../../utils/utils";

export interface OverviewSectionParams {
    openingBalanceDate: Moment,
    periodName: string,
    closingBalanceDate: Moment
}

export type ExcelSheetInput = Array<Array<string | number>>
type HeaderFunction = (params: OverviewSectionParams) => string[]
type TransformToSummaryLine<T> = (item: T[]) => Array<string | number>


export const generateOverviewSection = <T>(
    configParams: OverviewSectionParams,
    generateHeader: HeaderFunction,
    generateSubHeader: HeaderFunction,
    transformer: TransformToSummaryLine<T>,
    lines: T[],
    groupByProperty: GroupByProperty<T>
): ExcelSheetInput => {
    const grouped = groupBy(lines, groupByProperty);
    const summed = transformGroupesToSummary<T>(grouped, transformer);
    const summaryLine = createSummarySection(summed);
    return [
        generateHeader(configParams),
        generateSubHeader(configParams),
        ...summed,
        summaryLine
    ];
}

const createSummarySection = (lines: ExcelSheetInput): Array<string | number> =>  {
    const sums = Array(lines[0].length - 1).fill(0).map((value, index) => {
        return lines.map((l) => l[index + 1]).reduce(sumNumbers)
    });

    return [
        "Sum",
        ...sums
    ]
}


const transformGroupesToSummary = <T>(groups: GroupedByLines<T>, transformer: TransformToSummaryLine<T>): ExcelSheetInput =>
    Object.keys(groups).map((key: string) => transformer(groups[key]));
