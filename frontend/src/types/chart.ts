export interface ChartRow {
    [key: string]: string | number | boolean | null | undefined;
}

export interface ChartResponse {
    data: ChartRow[];
    numeric_columns: string[];
}