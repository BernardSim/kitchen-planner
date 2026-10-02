import test from 'node:test'; import assert from 'node:assert/strict';
import {createDefaultState} from '../src/storage.js';
import {recordMealRating,recentDishNames,ratingSummary,buildFeedbackContext} from '../src/feedback.js';

const plan=(id,weekStart,names,status='approved')=>({id,weekStart,status,days:names.map((name,i)=>({day:['Monday','Tuesday','Wednesday','Thursday','Friday'][i]||`D${i}`,dinner:{name}}))});

test('ratings can be member-specific and aggregate avoid/repeat signals',()=>{
 let s=createDefaultState();
 s=recordMealRating(s,{dishName:'Beef Hor Fun',familyMemberId:'child-1',rating:'loved',servedAt:'2026-09-29'},()=>1);
 s=recordMealRating(s,{dishName:'Spinach Soup',familyMemberId:'child-2',rating:'avoid',servedAt:'2026-09-30'},()=>2);
 const summary=ratingSummary(s); assert.deepEqual(summary.avoid,['Spinach Soup']); assert.deepEqual(summary.repeat,['Beef Hor Fun']); assert.equal(summary.byMember['child-1'].loved[0],'Beef Hor Fun');
});

test('recentDishNames returns unique dishes from the most recent three weeks',()=>{
 let s=createDefaultState(); s.weeklyPlans=[plan('a','2026-09-07',['A','B']),plan('b','2026-09-14',['C','D']),plan('c','2026-09-21',['E','A']),plan('d','2026-09-28',['F','G'])];
 assert.deepEqual(recentDishNames(s,3).sort(),['A','C','D','E','F','G'].sort());
});

test('feedback context combines recent dishes and rating summary',()=>{
 let s=createDefaultState(); s.weeklyPlans=[plan('a','2026-09-28',['Ramen'])]; s=recordMealRating(s,{dishName:'Ramen',rating:'again',servedAt:'2026-09-29'});
 const ctx=buildFeedbackContext(s); assert.ok(ctx.recentDishes.includes('Ramen')); assert.ok(ctx.ratings.repeat.includes('Ramen'));
});