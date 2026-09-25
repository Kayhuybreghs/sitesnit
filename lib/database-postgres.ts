import {Pool} from 'pg';
import {DatabaseUnavailableError,type QueryExecutor} from './database-core';

export function postgresUrl(env:{DATABASE_URL?:string;POSTGRES_URL?:string;[key:string]:string|undefined}){return env.DATABASE_URL||env.POSTGRES_URL;}
export async function createPostgresExecutor(url:string):Promise<QueryExecutor>{
 let parsed:URL;try{parsed=new URL(url);}catch{throw new DatabaseUnavailableError();}
 if(!['postgres:','postgresql:'].includes(parsed.protocol)||!parsed.username||!parsed.password)throw new DatabaseUnavailableError();
 const pool=new Pool({connectionString:url,max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:10000,query_timeout:10000});
 return async({text,values})=>{try{const result=await pool.query(text,values);const bigints=result.fields.filter(f=>f.dataTypeID===20).map(f=>f.name);const rows=result.rows.map(row=>{const copy={...row};for(const key of bigints){if(typeof copy[key]==='string'&&/^-?\d+$/.test(copy[key])&&Number.isSafeInteger(Number(copy[key])))copy[key]=Number(copy[key]);}return copy;});return{rows,changes:result.rowCount??0};}catch(error){
  // Only a bounded machine code reaches private server logs; never SQL, URLs or credentials.
  const code=error&&typeof error==='object'&&'code' in error?String(error.code):'UNKNOWN';
  console.error('Sitesnit database unavailable',/^(?:[0-9A-Z]{5}|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|ENETUNREACH|SELF_SIGNED_CERT_IN_CHAIN|DEPTH_ZERO_SELF_SIGNED_CERT|UNABLE_TO_VERIFY_LEAF_SIGNATURE|CERT_HAS_EXPIRED)$/.test(code)?code:'UNKNOWN');
  throw new DatabaseUnavailableError();
 }};
}
