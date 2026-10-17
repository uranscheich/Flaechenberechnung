// Koordinatenursprung: lichte obere linke Ecke des Hauptbaukörpers, x rechts / y unten.
export const building={outerWidth:5.95,outerDepth:10.15,sideWall:.13,facadeWall:.25,partition:.115,annexProjection:1};
export const innerWidth=()=>Number((building.outerWidth-2*building.sideWall).toFixed(3));
export const innerDepth=()=>Number((building.outerDepth-2*building.facadeWall).toFixed(3));
export const chains={
 eg:{top:[2.885,.115,1.315,.115,1.26],topLabel:['Küche','Wand','Windfang','Wand','WC'],depth:[3.515,.115,3.01,.115,2.885]},
 og:{top:[2.76,.115,2.815],bottom:[3.01,.115,2.565],depth:[3.515,.115,3.01,.115,2.885]},
 dg:{top:[5.69],depth:[2.175,5.8,2.175]}
};
export const sum=values=>values.reduce((a,b)=>a+b,0);
export function measureAudit(){return {outerArea:building.outerWidth*building.outerDepth,innerArea:innerWidth()*innerDepth(),chainDepth:sum(chains.eg.depth),chainResidual:innerDepth()-sum(chains.eg.depth),sideLayers:[.015,.115],floorTotals:'Raumflächen ohne Wand- und Treppenflächen'}}
