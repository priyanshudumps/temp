export interface IQueryResult<T> {
    rows: T[];
    rowCount: number;
    command: string;
    oid: number;
    fields: Array<{
      name: string;
      tableID: number;
      columnID: number;
      dataTypeID: number;
      dataTypeSize: number;
      dataTypeModifier: number;
      format: string;
    }>;
  }
  
  export interface IQueryExecutor {
    executeQuery: <T = any>(query: string, values?: any[], isTransaction?: boolean) => Promise<T[]>;
    executeMultipleQueries: (queries: IQueryObject[]) => Promise<void>;
  }
  
  export interface IQueryObject {
    query: string;
    values: any[];
  }
  
  export interface IDatabaseConnection {
    query: <T = any>(text: string, params?: any[]) => Promise<IQueryResult<T>>;
    release: () => void;
  }
  
  export interface IDatabasePool {
    connect: () => Promise<IDatabaseConnection>;
    end: () => Promise<void>;
  }