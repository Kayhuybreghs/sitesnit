import { DatabaseSync } from 'node:sqlite';
import { Pool } from 'pg';
import { AsyncLocalStorage } from 'node:async_hooks';
import { createDatabase, type AppDatabase, type QueryExecutor } from '../database-core';
export type HubConnection = { authDatabase: DatabaseSync | Pool; db: AppDatabase; runExclusive:<T>(work:()=>Promise<T>)=>Promise<T>; transaction: <T>(work:(db:AppDatabase)=>Promise<T>)=>Promise<T>; executeSchema:(sql:string)=>Promise<void>; close:()=>Promise<void> };

export function sqliteHubConnection(filename:string):HubConnection {
  if (process.env.VERCEL) throw new Error('Local Hub storage is disabled on Vercel.');
  const connection=new DatabaseSync(filename);
  connection.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
  // Every entry point sharing this SQLite handle must use this queue, including auth.
  // Reentrancy lets an auth hook accept an invitation inside its enclosing auth request.
  const context=new AsyncLocalStorage<{active:boolean}>();
  let tail:Promise<unknown>=Promise.resolve();
  const runExclusive=<T>(work:()=>Promise<T>):Promise<T>=>{
    if(context.getStore()?.active)return work();
    const run=tail.then(async()=>{
      const owner={active:true};
      try{return await context.run(owner,work);}finally{owner.active=false;}
    });
    tail=run.catch(()=>{});return run;
  };
  const execute:QueryExecutor=({text,values})=>runExclusive(async()=>{
    const before=connection.prepare('SELECT total_changes() AS n').get() as {n:number};
    const valuesByName=Object.fromEntries(values.map((value,i)=>[`$${i+1}`,typeof value==='boolean'?Number(value):value]));
    const rows=connection.prepare(text).all(valuesByName).map(row=>({...row}));
    const after=connection.prepare('SELECT total_changes() AS n').get() as {n:number};
    return {rows,changes:after.n-before.n};
  });
  const db=createDatabase(execute);
  return {authDatabase:connection,db,runExclusive,transaction:work=>runExclusive(async()=>{
    connection.exec('BEGIN IMMEDIATE');try{const value=await work(db);connection.exec('COMMIT');return value;}catch(error){connection.exec('ROLLBACK');throw error;}
  }),executeSchema:sql=>runExclusive(async()=>{connection.exec(sql);}),close:()=>runExclusive(async()=>{connection.close();})};
}
export function postgresHubConnection(url:string):HubConnection {
  const pool=new Pool({connectionString:url,max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:10000});
  const execute:QueryExecutor=async({text,values})=>{const result=await pool.query(text,values);return{rows:result.rows,changes:result.rowCount??0};};
  return {authDatabase:pool,db:createDatabase(execute),runExclusive:work=>work(),async transaction(work){
    const client=await pool.connect();
    try{await client.query('BEGIN');const value=await work(createDatabase(async({text,values})=>{const result=await client.query(text,values);return{rows:result.rows,changes:result.rowCount??0};}));await client.query('COMMIT');return value;}
    catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
  },executeSchema:async sql=>{await pool.query(sql);},close:()=>pool.end()};
}
