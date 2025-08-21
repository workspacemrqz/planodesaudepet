declare module 'connect-pg-simple' {
  import { Store } from 'express-session';
  import { Pool, Client } from 'pg';

  interface PgStoreOptions {
    pool?: Pool;
    pgPromise?: any;
    conString?: string;
    conObject?: any;
    ttl?: number;
    disableTouch?: boolean;
    createTableIfMissing?: boolean;
    schemaName?: string;
    tableName?: string;
    pruneSessionInterval?: number;
    errorLog?: (...args: any[]) => void;
  }

  function connectPgSimple(session: any): {
    new (options?: PgStoreOptions): Store;
  };

  export = connectPgSimple;
}