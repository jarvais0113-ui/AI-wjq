// Scene fills the layout viewport; controls follow the actually visible viewport.
// Keeping these sizes separate avoids a stale visualViewport height leaving a bottom strip on iOS.
export function viewportMetrics(layoutWidth,layoutHeight,clientHeight,visual){
 const width=Math.max(1,layoutWidth||1),height=Math.max(1,layoutHeight||1,clientHeight||1);
 const visibleHeight=Math.min(height,Math.max(1,visual?.height||height));
 return{width,sceneHeight:Math.max(height,visibleHeight+(visual?.offsetTop||0)),hudHeight:visibleHeight,hudTop:Math.max(0,visual?.offsetTop||0)};
}
