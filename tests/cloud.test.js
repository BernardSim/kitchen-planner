import test from 'node:test'; import assert from 'node:assert/strict';
import {cloudEnabled,cloudStateRow,mergeCloudState} from '../src/cloud.js';

test('cloudEnabled requires url and anon key',()=>{assert.equal(cloudEnabled({}),false);assert.equal(cloudEnabled({supabaseUrl:'https://x.supabase.co',supabaseAnonKey:'k'}),true);});
test('cloudStateRow serializes household state',()=>{const row=cloudStateRow('hh1',{schemaVersion:1,inventory:[{name:'Eggs'}]});assert.equal(row.household_id,'hh1');assert.equal(row.payload.inventory[0].name,'Eggs');});
test('mergeCloudState prefers valid cloud payload while preserving local fallback on missing payload',()=>{const local={schemaVersion:1,inventory:[{name:'Local'}]};assert.equal(mergeCloudState(local,null).inventory[0].name,'Local');assert.equal(mergeCloudState(local,{payload:{schemaVersion:1,inventory:[{name:'Cloud'}]}}).inventory[0].name,'Cloud');});