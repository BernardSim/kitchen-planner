import test from 'node:test'; import assert from 'node:assert/strict';
import {buildPartyPrompt} from '../src/prompts.js';

test('party prompt preserves menu, shopping, timeline and helper output contract',()=>{
 const p=buildPartyPrompt({guests:8,cuisine:'Chinese',dietary:'No shellfish',notes:'Birthday',date:'2026-10-10'});
 const text=p.system+' '+p.user;
 for(const token of ['partyTitle','shoppingList','timeline','helperInstructions','8','Chinese','No shellfish','Birthday']) assert.ok(text.includes(token),`missing ${token}`);
});