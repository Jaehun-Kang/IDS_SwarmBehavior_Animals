const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const STEP=1/30;
export const LOBSTER_CHEMICAL_COLORS=[[0,96,138],[138,0,62]];
export const lobsterChemicalAlpha=c=>Math.round(192*(1-Math.exp(-Math.max(0,c)*6)));
export function createLobsterChemical(aspect=1){
  const width=24*Math.max(1,aspect),height=width/aspect,cell=0.4;
  const cols=Math.ceil(width/cell),rows=Math.ceil(height/cell);
  return {width,height,cell,cols,rows,time:0,accumulator:0,revision:0,max:0,
    sources:[{x:width*0.72,y:height*0.32},{x:width*0.72,y:height*0.68}],
    layers:[new Float32Array(cols*rows),new Float32Array(cols*rows)],scratch:new Float32Array(cols*rows)};
}
export function sampleLobsterChemical(m,layer,x,y){
  const gx=x/m.cell-0.5,gy=y/m.cell-0.5,ix=Math.floor(gx),iy=Math.floor(gy),fx=gx-ix,fy=gy-iy;
  const at=(x,y)=>x<0||y<0||x>=m.cols||y>=m.rows?0:layer[y*m.cols+x];
  return at(ix,iy)*(1-fx)*(1-fy)+at(ix+1,iy)*fx*(1-fy)+at(ix,iy+1)*(1-fx)*fy+at(ix+1,iy+1)*fx*fy;
}
function tick(m,c){
  const release=clamp(c.signal_release??65,0,100)/100;
  if(release===0&&m.max===0){m.time+=STEP;return;}
  const flow=clamp(c.water_flow??50,0,100)/100*1.6;
  const spread=clamp(c.signal_spread??45,0,100)/100*0.6;
  const adv=flow*STEP/m.cell,diff=spread*STEP/(m.cell*m.cell),decay=Math.exp(-STEP/5);
  m.max=0;
  m.layers.forEach((layer,k)=>{
    // Both cues use identical transport. Strong avoidance does not imply longer chemical life.
    if(m.sources[k].enabled!==false&&m.time%2<0.3&&release>0){
      const source=m.sources[k],cx=source.x-0.8,cy=source.y;
      for(let row=Math.max(0,Math.floor((cy-0.8)/m.cell));row<Math.min(m.rows,Math.ceil((cy+0.8)/m.cell));row++){
        for(let col=Math.max(0,Math.floor((cx-0.8)/m.cell));col<Math.min(m.cols,Math.ceil((cx+0.8)/m.cell));col++){
          const d=Math.hypot((col+0.5)*m.cell-cx,(row+0.5)*m.cell-cy);
          layer[row*m.cols+col]+=Math.max(0,1-d/0.8)*release*12*STEP;
        }
      }
    }
    for(let row=0;row<m.rows;row++)for(let col=0;col<m.cols;col++){
      const i=row*m.cols+col,v=layer[i];
      const left=col?layer[i-1]:0,right=col<m.cols-1?layer[i+1]:0;
      const up=row?layer[i-m.cols]:0,down=row<m.rows-1?layer[i+m.cols]:0;
      // Conservative upwind transport toward the left; open boundaries flush the field.
      const next=Math.max(0,(v+adv*(right-v)+diff*(left+right+up+down-4*v))*decay);
      m.scratch[i]=next<1e-12?0:next;m.max=Math.max(m.max,m.scratch[i]);
    }
    layer.set(m.scratch);
  });
  m.time+=STEP;m.revision++;
}
export function advanceLobsterChemical(m,c,elapsed){
  m.accumulator+=Math.min(0.1,Math.max(0,elapsed));
  while(m.accumulator+1e-10>=STEP){tick(m,c);m.accumulator-=STEP;}
}
