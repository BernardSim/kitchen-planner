import test from 'node:test';
import assert from 'node:assert/strict';
import { SCHEMA_VERSION, createDefaultState, loadState, saveState, migrateState, STORAGE_KEY } from '../src/storage.js';

class MemoryStorage {
  constructor(seed={}) { this.map = new Map(Object.entries(seed)); }
  getItem(k){ return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k,v){ this.map.set(k,String(v)); }
  removeItem(k){ this.map.delete(k); }
  key(i){ return [...this.map.keys()][i] ?? null; }
  get length(){ return this.map.size; }
}

test('default state contains versioned household collections', () => {
  const s = createDefaultState();
  assert.equal(s.schemaVersion, SCHEMA_VERSION);
  assert.ok(Array.isArray(s.familyMembers) && s.familyMembers.length >= 4);
  assert.deepEqual(s.inventory, []);
  assert.deepEqual(s.weeklyPlans, []);
  assert.deepEqual(s.ratings, []);
  assert.equal(s.ui.mode, 'parent');
});

test('state round-trips through storage', () => {
  const storage = new MemoryStorage();
  const state = createDefaultState();
  state.mealRequests.push({id:'r1', text:'ramen', weekId:'2026-10-05'});
  saveState(storage, state);
  assert.deepEqual(loadState(storage), state);
});

test('malformed JSON falls back and preserves raw payload in recovery key', () => {
  const storage = new MemoryStorage({[STORAGE_KEY]:'{broken json'});
  const loaded = loadState(storage, () => 1234567890);
  assert.equal(loaded.schemaVersion, SCHEMA_VERSION);
  assert.equal(storage.getItem('kitchenPlanner.v1.recovery.1234567890'), '{broken json');
});

test('missing-version legacy state is migrated without losing known data', () => {
  const legacy = { familyMembers:[{id:'x',name:'Child',role:'child'}], inventory:[{id:'i',name:'Eggs'}] };
  const migrated = migrateState(legacy);
  assert.equal(migrated.schemaVersion, SCHEMA_VERSION);
  assert.equal(migrated.familyMembers[0].name, 'Child');
  assert.equal(migrated.inventory[0].name, 'Eggs');
  assert.ok(Array.isArray(migrated.householdNotes));
});