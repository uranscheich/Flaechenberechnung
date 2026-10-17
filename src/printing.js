export const livingPrintCSS='@page{size:A4 portrait;margin:12mm}';
let restorePrintMode;

export function printCalculation({livingOnly=false}={}){
 restorePrintMode?.();
 const format=document.createElement('style');
 format.media='print';
 if(livingOnly){document.body.dataset.printScope='living';format.textContent=livingPrintCSS;document.head.append(format);}
 const restore=()=>{
  delete document.body.dataset.printScope;format.remove();
  window.removeEventListener('afterprint',restore);
  if(restorePrintMode===restore)restorePrintMode=undefined;
 };
 restorePrintMode=restore;window.addEventListener('afterprint',restore,{once:true});
 try{window.print();}catch(error){restore();throw error;}
}
