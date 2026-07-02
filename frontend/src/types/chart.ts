export interface ChartRow {
    [key: string]: string | number;
}

export interface ChartResponse {
    data: ChartRow[];
    numeric_columns: string[];
}