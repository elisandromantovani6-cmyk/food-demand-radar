declare module "google-trends-api" {
  interface InterestOverTimeOptions {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    hl?: string;
    category?: number;
    property?: string;
    granularTimeResolution?: boolean;
  }

  interface RelatedQueriesOptions {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    hl?: string;
    category?: number;
  }

  function interestOverTime(options: InterestOverTimeOptions): Promise<string>;
  function relatedQueries(options: RelatedQueriesOptions): Promise<string>;
  function interestByRegion(options: InterestOverTimeOptions): Promise<string>;
  function realTimeTrends(options: { geo: string; hl?: string; category?: string }): Promise<string>;

  export { interestOverTime, relatedQueries, interestByRegion, realTimeTrends };
}
