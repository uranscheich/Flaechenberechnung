import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=process.cwd(),port=Number(process.env.PORT||4317);
const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  // Only application assets are public. PDFs, uploads, tests, exports and work files never are.
  if(!['/','/index.html','/style.css'].includes(p)&&!/^\/src\/[a-z0-9-]+\.js$/.test(p)){res.writeHead(404).end('Nicht gefunden');return}
  const file=resolve(root,'.'+(p==='/'?'/index.html':p));
  const data=await readFile(file);
  res.setHeader('Cache-Control','no-cache');
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'})[extname(file)]);
  res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404).end('Nicht gefunden')}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${server.address().port}`));
