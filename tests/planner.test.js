import test from 'node:test'; import assert from 'node:assert/strict';
import {createDefaultState} from '../src/storage.js';
import {buildWeeklyPrompt,buildSwapPrompt} from '../src/prompts.js';
import {validateWeeklyPlan,applySwap} from '../src/planner.js';

const dish=(name)=>({id:name.toLowerCase().replaceAll(' ','-'),name,description:'',cuisine:'Chinese',keyIngredients:['ginger'],recipeSource:{siteName:'The Woks of Life',searchQuery:name,quickTip:'Prep first'},exposureLevel:'safe',prepNotes:'Prep'});
const samplePlan={id:'p1',weekStart:'2026-10-05',status:'draft',days:['Monday','Tuesday','Wednesday','Thursday','Friday'].map((day,i)=>({day,lunch:dish(`Lunch ${i}`),dinner:dish(`Dinner ${i}`)})),helperPrep:['Defrost Monday protein Sunday night']};

test('weekly prompt includes family, non-spicy children, inventory, requests, history, ratings and Chinese exposure',()=>{
 let s=createDefaultState(); s.inventory=[{name:'Eggs',domain:'food',status:'plenty'}]; s.mealRequests=[{text:'ramen',weekId:'2026-10-05'}]; s.weeklyPlans=[{...samplePlan,id:'old',weekStart:'2026-09-28',status:'approved'}]; s.ratings=[{dishName:'Beef Hor Fun',rating:'loved',familyMemberId:'child-1'}]; s.ui.chineseExposureTarget=3;
 const p=buildWeeklyPrompt(s,'2026-10-05'); const text=p.system+'\n'+p.user;
 for(const token of ['Child 1','Child 2','non-spicy','Eggs','ramen','Beef Hor Fun','3','ingredient reuse','avoid repeating']) assert.ok(text.includes(token),`missing ${token}`);
});

test('validator rejects malformed plans and accepts complete five-day plan',()=>{ assert.equal(validateWeeklyPlan({days:[]}).ok,false); assert.equal(validateWeeklyPlan(samplePlan).ok,true); });

test('applySwap changes only the selected meal',()=>{ const replacement=dish('Beef Hor Fun'); const before=JSON.stringify(samplePlan.days[1]); const result=applySwap(samplePlan,'Monday','dinner',replacement); assert.equal(result.days[0].dinner.name,'Beef Hor Fun'); assert.equal(JSON.stringify(result.days[1]),before); assert.equal(samplePlan.days[0].dinner.name,'Dinner 0'); });

test('swap prompt names target meal and preserves constraints',()=>{ let s=createDefaultState(); s.weeklyPlans=[samplePlan]; const p=buildSwapPrompt(s,'p1','Monday','dinner'); const text=p.system+' '+p.user; assert.ok(text.includes('Monday')); assert.ok(text.includes('dinner')); assert.ok(text.includes('non-spicy')); });