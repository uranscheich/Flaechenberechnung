// Kernstärken gemäß Nutzerkorrektur; Randzuschläge bleiben separat ausgewiesen.
export const building={outerWidth:5.95,outerDepth:10.15,sideWall:.115,facadeWall:.225,sideAllowance:.015,facadeAllowance:.03,partition:.115,annexProjection:1};
export const sideOffset=()=>building.sideWall+building.sideAllowance;
export const facadeOffset=()=>building.facadeWall+building.facadeAllowance;
export const innerWidth=()=>Number((building.outerWidth-2*sideOffset()).toFixed(3));
export const innerDepth=()=>Number((building.outerDepth-2*facadeOffset()).toFixed(3));
export const chains={
 eg:{top:[2.885,.115,1.315,.115,1.26],depth:[3.515,.115,3.01,.115,2.885]},
 og:{top:[2.76,.115,2.815],bottom:[3.01,.115,2.565],depth:[3.515,.115,3.01,.115,2.885]},
 dg:{top:[5.69],depth:[2.175,5.8,2.175]}
};
export const sum=values=>values.reduce((a,b)=>a+b,0);
export function measureAudit(){return {outerArea:building.outerWidth*building.outerDepth,innerArea:innerWidth()*innerDepth(),chainDepth:sum(chains.eg.depth),chainResidual:innerDepth()-sum(chains.eg.depth),sideLayers:[building.sideWall,building.sideAllowance],facadeLayers:[building.facadeWall,building.facadeAllowance]}}
