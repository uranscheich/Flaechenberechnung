import {effectiveArea,polygonArea,isRectangle} from './model.js';
import {building as b,chains,innerDepth,innerWidth} from './architecture.js';
export const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const measure=n=>n.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:3});
export const num=n=>n.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});
function inside(p,vs){let yes=false;for(let i=0,j=vs.length-1;i<vs.length;j=i++){const a=vs[i],c=vs[j];if((a[1]>p[1])!==(c[1]>p[1])&&p[0]<(c[0]-a[0])*(p[1]-a[1])/(c[1]-a[1])+a[0])yes=!yes}return yes}
function labelPoint(p){if(isRectangle(p)){return [(Math.min(...p.map(v=>v[0]))+Math.max(...p.map(v=>v[0])))/2,(Math.min(...p.map(v=>v[1]))+Math.max(...p.map(v=>v[1])))/2]}const xs=p.map(v=>v[0]),ys=p.map(v=>v[1]);let best=p[0],score=-1;for(let y=Math.min(...ys)+.08;y<Math.max(...ys);y+=.1)for(let x=Math.min(...xs)+.08;x<Math.max(...xs);x+=.1){if(!inside([x,y],p))continue;let dist=Infinity;for(let i=0;i<p.length;i++){const a=p[i],c=p[(i+1)%p.length],dx=c[0]-a[0],dy=c[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));dist=Math.min(dist,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy))}if(dist>score){best=[x,y];score=dist}}return best}
export function planSVG(floor,{selected='',labels=true,dimensions=true,axon=false,interactive=true,furniture=true}={}){
 const s=45,ox=195,oy=140,iw=innerWidth(),id=innerDepth(),X=x=>ox+x*s,Y=y=>oy+y*s,pts=p=>p.map(([x,y])=>`${X(x)},${Y(y)}`).join(' '),c=chains[floor.id]||chains.eg;
 const rect=(x,y,w,h,attrs='')=>`<rect x="${X(x)}" y="${Y(y)}" width="${w*s}" height="${h*s}" ${attrs}/>`;
 const text=(x,y,t,size=9,attrs='')=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="#66705f" ${attrs}>${escape(t)}</text>`;
 function dimH(x1,x2,y,refY,label,bold=false){const a=X(x1),z=X(x2),yy=Y(y),ry=Y(refY);return `<g fill="none" stroke="#76816e" stroke-width=".65"><path d="M${a},${ry}V${yy-5}M${z},${ry}V${yy-5}" opacity=".45"/><path d="M${a},${yy}H${z}M${a-3},${yy+4}l6,-8M${z-3},${yy+4}l6,-8"/></g>${text((a+z)/2,yy-7,label,bold?11:9,`text-anchor="middle" ${bold?'font-weight="bold"':''}`)}`}
 function dimV(y1,y2,x,refX,label,bold=false){const a=Y(y1),z=Y(y2),xx=X(x),rx=X(refX);return `<g fill="none" stroke="#76816e" stroke-width=".65"><path d="M${rx},${a}H${xx-5}M${rx},${z}H${xx-5}" opacity=".45"/><path d="M${xx},${a}V${z}M${xx-4},${a+3}l8,-6M${xx-4},${z+3}l8,-6"/></g><g transform="translate(${xx-7},${(a+z)/2}) rotate(-90)">${text(0,0,label,bold?11:9,`text-anchor="middle" ${bold?'font-weight="bold"':''}`)}</g>`}
 function hChain(values,y,refY,start=0){let x=start;return values.map(v=>{const old=x;x+=v;return dimH(old,x,y,refY,measure(v))}).join('')}
 function vChain(values,x,refX,start=0){let y=start;return values.map(v=>{const old=y;y+=v;return dimV(old,y,x,refX,measure(v))}).join('')}
 const outer=[[-b.sideWall,-b.facadeWall],[iw+b.sideWall,-b.facadeWall],[iw+b.sideWall,id+b.facadeWall],[-b.sideWall,id+b.facadeWall]];
 const boundary=`M${pts(outer).replaceAll(' ',' L')} Z M${X(0)},${Y(0)} V${Y(id)} H${X(iw)} V${Y(0)}Z`;
 const shell=floor.id==='dg'?rect(-b.sideWall,2.175,b.sideWall,5.8,'fill="url(#wallHatch)" stroke="#313b30" stroke-width=".8"')+rect(iw,2.175,b.sideWall,5.8,'fill="url(#wallHatch)" stroke="#313b30" stroke-width=".8"'):`<path d="${boundary}" fill="url(#wallHatch)" fill-rule="evenodd" stroke="#344032" stroke-width=".9"/>`;
 const backdrop=floor.id==='dg'?rect(0,0,iw,2.175,'fill="url(#roofHatch)" stroke="#b9c3b0" stroke-width=".5"')+rect(0,7.975,iw,2.175,'fill="url(#roofHatch)" stroke="#b9c3b0" stroke-width=".5"'):'';
 const rooms=floor.rooms.map((r,i)=>{const [x,y]=labelPoint(r.points),sel=r.id===selected,compact=polygonArea(r.points)<3.5,name=r.name==='Hausanschluss'?'H.A.R.':r.name,font=compact?8:r.name.length>12?9:10;return `<g><polygon ${interactive?`class="room" data-room="${escape(r.id)}" tabindex="0" role="button" aria-label="${escape(r.name)}, ${num(effectiveArea(r))} Quadratmeter"`:''} points="${pts(r.points)}" fill="${r.color}" fill-opacity="${r.include?'.48':'.12'}" stroke="${sel?'#b65d3d':'#69745f'}" stroke-width="${sel?1.9:.6}" ${!r.verified?'stroke-dasharray="3 2"':''}/>${labels?`<g class="room-label" text-anchor="middle" transform="translate(${X(x)},${Y(y)})">${compact?'':`<text y="-16" font-size="6.5" fill="#7b856e">${floor.short} ${String(i+1).padStart(2,'0')} ${r.method==='reference'?'· PLANWERT':''}</text>`}<text y="-3" font-size="${font}" font-weight="500">${escape(name)}</text><text y="12" font-size="11">${num(effectiveArea(r))}<tspan font-size="8"> m²</tspan></text></g>`:''}</g>`}).join('');
 const wall=(x,y,w,h)=>rect(x,y,w,h,'fill="#56604d" stroke="#344032" stroke-width=".5"');
 const door=(x,y,w,rotate=0)=>`<g transform="translate(${X(x)},${Y(y)}) rotate(${rotate})" fill="none" stroke="#7e8774" stroke-width=".7"><path d="M0,0V${-w*s} A${w*s},${w*s} 0 0 1 ${w*s},0"/><path d="M0,0H${w*s}" stroke-dasharray="2 3" stroke="#b9c1af"/></g>`;
 let partitions='',openings='',furn='';
 if(floor.id==='eg'){
  partitions=wall(0,6.65,1.78,.115)+wall(2.6,6.65,.41,.115)+wall(2.885,6.765,.115,1.55)+wall(2.885,9.15,.115,.5)+wall(3.01,5,.115,1.65)+wall(3.125,5,1.19,.115)+wall(4.315,5,.115,.67)+wall(4.315,6.5,.115,1.89)+wall(4.43,8.39,1.26,.115)+wall(4.25,3.9,1.44,.115)+wall(4.25,4.015,.115,.87)+wall(4.365,4.885,1.325,.115);
  openings=door(1.78,6.765,.82,180)+door(3,9.15,.83,180)+door(4.43,5.67,.83,90)+door(4.25,4.885,.72,180)+door(3.15,5.115,.82,0);
  const x=4.315,top=9.9,bottom=10.9;
  partitions+=wall(x,top,.115,1)+wall(5.69,top,.13,1)+wall(x,bottom-.115,1.505,.115);
  openings+=rect(3.1,id-.01,1.1,b.facadeWall+.02,'fill="#fcfcf8" stroke="#77836e" stroke-width=".6"')+door(3.1,id,1.1,180);
  furn=`<g fill="none" stroke="#89967c" stroke-width=".7" opacity=".7">${rect(4.82,.8,.65,1.8,'rx="3"')}${rect(3.45,1.25,.62,.9,'rx="2"')}${rect(.45,4.75,.8,1.2,'rx="3"')}${rect(.15,7.15,.5,2.25)}${rect(4.65,7.15,.6,.55,'rx="10"')}</g>`;
 }else if(floor.id==='og'){
  partitions=wall(2.76,0,.115,3.515)+wall(2.875,3.515,.35,.115)+wall(4.06,3.515,1.63,.115)+wall(0,4.76,1.75,.115)+wall(2.57,4.76,.105,.115)+wall(2.675,3.63,.115,.4)+wall(2.79,4.875,.115,1.89)+wall(3.01,6.765,.115,2.885)+wall(3.125,6.65,.2,.115)+wall(4.15,6.65,1.54,.115);
  openings=door(2.675,4.76,.73,180)+door(3.225,3.63,.835,0)+door(2.79,5.25,.85,90)+door(3.325,6.765,.825,0);
  furn=`<g fill="none" stroke="#89967c" stroke-width=".7" opacity=".7">${rect(.2,2.5,.9,1.9,'rx="3"')}${rect(4.55,1.4,.9,1.9,'rx="3"')}${rect(.3,7,1.6,2,'rx="3"')}${rect(4.65,7.05,.8,1.7,'rx="12"')}</g>`;
 }
 const windows=floor.id==='dg'?'':rect(1.1,-b.facadeWall,3.45,b.facadeWall,'fill="#fcfcf8" stroke="#73826b" stroke-width=".6"')+`<path d="M${X(1.1)},${Y(-.12)}H${X(4.55)}" stroke="#73826b" stroke-width=".7"/>`+rect(.65,id,1.5,b.facadeWall,'fill="#fcfcf8" stroke="#73826b" stroke-width=".6"');
 const stair=floor.id==='dg'?rect(3.9,4.1,1.2,2.2,'fill="none" stroke="#9fa88f" stroke-width=".7" stroke-dasharray="4 3"')+text(X(4.5),Y(5.3),'Einschubtreppe',7,'text-anchor="middle"'):`<g fill="none" stroke="#99a28d" stroke-width=".6">${rect(4.43,5.1,1.26,1.55,'fill="#f4f4ed"')}${Array.from({length:9},(_,i)=>`<path d="M${X(4.43)},${Y(5.1+i*.19)}H${X(5.69)}"/>`).join('')}<path d="M${X(4.68)},${Y(6.5)}V${Y(5.25)}l-3,6m3,-6l3,6"/>${text(X(5.12),Y(5.95),'TREPPE',6,'text-anchor="middle"')}</g>`;
 let dims='';if(dimensions){
 dims+=dimH(-b.sideWall,iw+b.sideWall,-2.2,-b.facadeWall,'5,95',true)+dimH(0,iw,-1.4,0,'5,69');
 if(floor.id==='og')dims+=hChain(c.top,-.7,0);
 if(floor.id==='dg'){dims+=dimV(0,10.15,-2.5,0,'10,15',true)+vChain(c.depth,-1.65,0);}
 else{dims+=dimV(-b.facadeWall,id+b.facadeWall,-2.5,-b.sideWall,'10,15',true)+dimV(0,id,-1.65,0,'9,65')+vChain(c.depth,-.8,0);dims+=hChain(floor.id==='og'?c.bottom:c.top,11.5,id);dims+=dimH(-b.sideWall,iw+b.sideWall,12.2,id+b.facadeWall,'5,95',true);}
 if(floor.id==='eg')dims+=dimV(id+b.facadeWall,id+b.facadeWall+1,iw+1.3,iw+b.sideWall,'1,00 · Anbau');
 dims+=dimH(-b.sideWall,0,-.7,0,'0,13')+dimH(iw,iw+b.sideWall,-.7,0,'0,13');
 }
 const pageWidth=Math.max(680,...floor.rooms.flatMap(r=>r.points.map(p=>X(p[0])+100))),pageHeight=Math.max(775,...floor.rooms.flatMap(r=>r.points.map(p=>Y(p[1])+90)));
 const frame=rect(-b.sideWall,-b.facadeWall,b.outerWidth,b.outerDepth,'fill="none" stroke="#afbaa5" stroke-width=".5" stroke-dasharray="4 4"');
 const scale=`<g transform="translate(70,730)"><path d="M0,0h90v5H0Z" stroke="#65745c" stroke-width=".6" fill="none"/><path d="M0,0h45v5H0Z" fill="#65745c"/>${text(0,18,'0',8)}${text(45,18,'1',8,'text-anchor="middle"')}${text(90,18,'2 m',8,'text-anchor="end"')}</g>`;
 const foot=text(465,733,'MASSE IN METERN',7,'text-anchor="end"')+text(465,747,'Gestrichelt = ergänzte Raumkontur',7,'text-anchor="end"');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pageWidth} ${pageHeight}" aria-label="Grundriss ${escape(floor.name)}" role="${interactive?'group':'img'}"><defs><pattern id="wallHatch-${floor.id}" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#e2e4d9"/><path d="M0,4L4,0" stroke="#78876b" stroke-width=".45"/></pattern><pattern id="roofHatch-${floor.id}" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0,0V7" stroke="#c2c8b6" stroke-width=".7"/></pattern></defs><g ${axon?'transform="translate(30,210) matrix(.9,-.25,.45,.65,-100,0)"':''}>${frame}${backdrop}${floor.id==='dg'?text(X(iw/2),Y(1.1),'Höhenzone unter 1,50 m',8,'text-anchor="middle"')+text(X(iw/2),Y(8.9),'Höhenzone unter 1,50 m',8,'text-anchor="middle"'):''}${rooms}${shell}${partitions}${windows}${stair}${furniture?furn:''}${openings}${dims}</g>${scale}${foot}</svg>`.replaceAll('url(#wallHatch)',`url(#wallHatch-${floor.id})`).replaceAll('url(#roofHatch)',`url(#roofHatch-${floor.id})`);
}
export function planPrintLayout(floor){const width=Math.max(680,...floor.rooms.flatMap(r=>r.points.map(p=>195+p[0]*45+100))),height=Math.max(775,...floor.rooms.flatMap(r=>r.points.map(p=>140+p[1]*45+90)));const scale=[100,125,150,200,250,500,1000,2000,5000].find(n=>width*1000/45/n<=170&&height*1000/45/n<=190)||10000;return {scale,widthMM:width*1000/45/scale,heightMM:height*1000/45/scale}}
