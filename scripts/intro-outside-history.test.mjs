import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const oldSource=execFileSync('git',['show','8d2bc8b:src/pages/Detail.jsx'],{encoding:'utf8'});
const currentSource=readFileSync(new URL('../src/pages/Detail.jsx',import.meta.url),'utf8');
function helpers(source){
  const context=vm.createContext({
    INTRO_GRASSHOPPER_TAKEOFF_MS:25,INTRO_ANT_FRONT_RADIUS_PX:56,
    INTRO_PENGUIN_CENTER_RADIUS_PX:70,INTRO_PENGUIN_LOWER_ROW_Y_PX:70,
    INTRO_INSECT_IDLE_Y_PX:0,INTRO_ANIMATION_DURATION_SCALE:{bee:2,bat:2},
  });
  vm.runInContext(source.slice(source.indexOf('const getIntroSpriteState ='),source.indexOf('const waitForAnimationFrame ='))+
    ';globalThis.api={getIntroSpriteState,applyIntroSpriteOverrides,getIntroSpriteFrameSequence};',context);
  return context.api;
}
const old=helpers(oldSource),current=helpers(currentSource);
const plain=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
const stages={starling:['starling_fly1'],sardine:['sardine_swim1'],grasshopper:['grasshopper_idle'],
  ant:['ant_front','ant_top','ant_walk'],bat:['bat_fly3'],sheep:['sheep_walk'],
  penguin:['penguin_walk','penguin_front','penguin_back'],
  bee:['bee_fly','bee_top_fly'],firefly:['firefly_glow','firefly_dark','firefly_lit_top_fly','firefly_dark_top_fly'],
  spiny_lobster:['spiny_lobster_walk'],krill:['krill_swim']};
for(const [animalId,animalStages] of Object.entries(stages))test(`${animalId}: outside poses match pre-follow history`,()=>{
  for(const x of [-200,-50,0,50,200])for(const y of [-200,-50,0,50,200])for(const timestampMs of [1010,1100]){
    const pointerVector={x,y},introAnimal={introAtHome:true,introPointerInside:false,introFlightStartedAt:1000};
    const args={animalId,pointerVector,timestampMs,grasshopperFlightStartMs:1000,introAnimal};
    const oldState=old.getIntroSpriteState(args),newState=current.getIntroSpriteState(args);
    assert.deepEqual(plain(newState),plain(oldState));
    for(const stage of animalStages){
      const sprite={stage,rotationDeg:0,scaleX:1,scaleY:1};
      assert.deepEqual(plain(current.applyIntroSpriteOverrides(animalId,sprite,pointerVector,newState,introAnimal,timestampMs)),
        plain(old.applyIntroSpriteOverrides(animalId,sprite,pointerVector,oldState)));
      for(const frames of [[{x:0,y:0}],[{x:0,y:0},{x:1,y:0}]]){
        const sequence={frames,durationMs:100};
        assert.deepEqual(plain(current.getIntroSpriteFrameSequence(animalId,stage,sequence,true)),
          plain(old.getIntroSpriteFrameSequence(animalId,stage,sequence)));
      }
    }
  }
});
test('inside bee and firefly keep flying; ant stays top view; locust uses actual hop',()=>{
 const pointerVector={x:200,y:200},introAnimal={introAtHome:false,introPointerInside:true,spriteType:'grasshopper_jump',jumpDirX:-1,jumpDirY:0};
 const state=current.getIntroSpriteState({animalId:'firefly',pointerVector,timestampMs:1000,introAnimal});
 assert.equal(state.idle,false);
 assert.equal(current.applyIntroSpriteOverrides('bee',{stage:'bee_fly'},pointerVector,undefined,introAnimal,1000).stage,'bee_fly');
 assert.equal(current.applyIntroSpriteOverrides('ant',{stage:'ant_walk'},pointerVector,undefined,introAnimal,1000).stage,'ant_top');
 assert.equal(current.getIntroSpriteState({animalId:'grasshopper',pointerVector,timestampMs:1000,introAnimal}).directionX,-1);
});
