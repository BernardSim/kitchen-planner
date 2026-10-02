import test from 'node:test'; import assert from 'node:assert/strict';
import {createDefaultState} from '../src/storage.js';
import {upsertInventoryItem,setInventoryStatus,inventorySummary} from '../src/inventory.js';

test('inventory upsert retains quantity and records actor/time',()=>{
 let s=createDefaultState(); s=upsertInventoryItem(s,{name:'Eggs',domain:'food',category:'fridge',status:'low',quantity:6,unit:'pcs'},'helper',()=>100);
 assert.equal(s.inventory[0].quantity,6); assert.equal(s.inventory[0].updatedBy,'helper'); assert.equal(s.inventory[0].updatedAt,100);
});
test('status transitions only accept plenty low out and keep quantity',()=>{
 let s=createDefaultState(); s=upsertInventoryItem(s,{name:'Milk',domain:'food',status:'plenty',quantity:2},'parent',()=>1);
 s=setInventoryStatus(s,s.inventory[0].id,'out','helper',()=>2); assert.equal(s.inventory[0].status,'out'); assert.equal(s.inventory[0].quantity,2);
 assert.throws(()=>setInventoryStatus(s,s.inventory[0].id,'maybe','helper'));
});
test('inventory summary splits food and household by status',()=>{
 let s=createDefaultState(); s=upsertInventoryItem(s,{name:'Rice',domain:'food',status:'plenty'},'helper'); s=upsertInventoryItem(s,{name:'Floor cleaner',domain:'household',status:'out'},'helper');
 const x=inventorySummary(s); assert.equal(x.food.plenty.length,1); assert.equal(x.household.out[0].name,'Floor cleaner');
});