// Preload only in the isolated test server: fail closed on external network.
const net = require('node:net');
const allowed = host => ['127.0.0.1','localhost','::1','[::1]'].includes(String(host));
const connect=net.Socket.prototype.connect;
net.Socket.prototype.connect=function(...args){
  let options=args[0];
  if(Array.isArray(options))options=options[0];
  const host=typeof options==='object'?options?.host:typeof args[1]==='string'?args[1]:'localhost';
  if(host&&!allowed(host))throw Error('Test server blocked non-loopback connection');
  return connect.apply(this,args);
};
const originalFetch=globalThis.fetch;
globalThis.fetch=(input,init)=>{
  const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);
  if(!allowed(url.hostname))throw Error('Test server blocked outbound fetch');
  return originalFetch(input,init);
};
