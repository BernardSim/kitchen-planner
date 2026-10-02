import test from 'node:test'; import assert from 'node:assert/strict';
import {createDefaultState} from '../src/storage.js';
import {addHouseholdNote,addTopUpRequest,resolveHouseholdNote,resolveTopUpByName} from '../src/helper.js';

test('helper note persists and can be resolved',()=>{let s=createDefaultState(); s=addHouseholdNote(s,'Eggs low','helper',()=>10); assert.equal(s.householdNotes[0].text,'Eggs low'); s=resolveHouseholdNote(s,s.householdNotes[0].id,()=>20); assert.equal(s.householdNotes[0].resolved,true);});
test('top up request captures domain and route hint',()=>{let s=createDefaultState(); s=addTopUpRequest(s,'Toilet cleaner','household','online_delivery','helper',()=>10); assert.equal(s.topUpRequests[0].name,'Toilet cleaner'); assert.equal(s.topUpRequests[0].routeHint,'online_delivery');});
test('top up can be resolved by normalized item name after purchase',()=>{let s=createDefaultState();s=addTopUpRequest(s,' Toilet  Cleaner ','household','helper_buys','helper',()=>10);s=resolveTopUpByName(s,'toilet cleaner',()=>20);assert.equal(s.topUpRequests[0].resolved,true);assert.equal(s.topUpRequests[0].resolvedAt,20);});