import {polygonParts,partsArea,validateParts} from './area-parts.js';
import {escape as esc} from './plan.js';

const inputValue=n=>Number(n.toFixed(9));
export const dimensionDraft=room=>({
 basis:room.method==='dimensions'?'dimensions':'area',
 parts:(room.dimensionParts||polygonParts(room.points)).map(p=>({shape:p.shape,length:String(inputValue(p.length)),width:String(inputValue(p.width))}))
});
export function parseDimensionParts(entry,decimal){
 const parts=(entry.parts||[]).map(p=>({shape:p.shape,length:decimal(p.length),width:decimal(p.width)}));
 validateParts(parts);return parts;
}
export function dimensionInputs(room,draft,floor){
 const prefix=`${floor} ${room.name}`,byMeasures=draft.basis==='dimensions';
 const fields=draft.parts.map((part,i)=>`<div class="dimension-part" data-part="${i}" data-shape="${part.shape}"><small>${i+1}${part.shape==='triangle'?' · △':''}</small>
  <input data-measure="length" aria-label="${esc(prefix)} Teilfläche ${i+1} ${part.shape==='triangle'?'Höhe':'Länge'}" inputmode="decimal" value="${esc(part.length)}" ${byMeasures?'':'disabled'}><span>×</span><input data-measure="width" aria-label="${esc(prefix)} Teilfläche ${i+1} ${part.shape==='triangle'?'Grundseite':'Breite'}" inputmode="decimal" value="${esc(part.width)}" ${byMeasures?'':'disabled'}>${part.shape==='triangle'?'<span>÷ 2</span>':'<span>m</span>'}</div>`).join('');
 return `<div class="dimension-controls" ${byMeasures?'':'hidden'}>${draft.parts.length>1?`<details class="dimension-details"><summary>${draft.parts.length} Teilflächen · Maße bearbeiten</summary><div class="dimension-label">Länge / Höhe × Breite / Grundseite · m</div>${fields}</details>`:`<div class="dimension-label">Länge × Breite · m</div>${fields}`}</div>
  <div class="gross-value"><input data-field="gross" aria-label="${esc(prefix)} Grundfläche" inputmode="decimal" value="${esc(draft.gross)}" ${byMeasures?'readonly':''}><span>m²</span></div>`;
}
export function readDimensionInputs(row){
 return [...row.querySelectorAll('[data-part]')].map(part=>({shape:part.dataset.shape,length:part.querySelector('[data-measure="length"]').value,width:part.querySelector('[data-measure="width"]').value}));
}
export function syncDimensionInputs(editor){
 for(const row of editor.querySelectorAll('[data-edit-room]')){
  const byMeasures=row.querySelector('[data-field="basis"]').value==='dimensions';
  row.querySelector('.dimension-controls').hidden=!byMeasures;
  row.querySelectorAll('[data-measure]').forEach(input=>input.disabled=!byMeasures);
  const gross=row.querySelector('[data-field="gross"]');gross.readOnly=byMeasures;
  if(byMeasures){
   try{gross.value=String(inputValue(partsArea(parseDimensionParts({parts:readDimensionInputs(row)},value=>{const s=value.trim();return /^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(s)?Number(s.replace(',','.')):NaN;}))));}
   catch{gross.value='';}
  }
 }
}

export const measureDescription=room=>room.method==='dimensions'?room.dimensionParts.map(p=>`${p.length.toLocaleString('de-DE',{maximumFractionDigits:3})} × ${p.width.toLocaleString('de-DE',{maximumFractionDigits:3})}${p.shape==='triangle'?' ÷ 2':''}`).join(' + '):'';
