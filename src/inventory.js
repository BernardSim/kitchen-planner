const STATUSES = new Set(['plenty','low','out']);
const DOMAINS = new Set(['food','household']);
const idFor = (name, domain) => `${domain}-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`;
const clone = s => structuredClone(s);

export function upsertInventoryItem(state, input, actor='parent', now=Date.now) {
  if (!input?.name?.trim()) throw new Error('Inventory item name is required');
  const domain = DOMAINS.has(input.domain) ? input.domain : 'food';
  const status = STATUSES.has(input.status) ? input.status : 'plenty';
  const next = clone(state); const key=idFor(input.name,domain);
  const i=next.inventory.findIndex(x=>x.id===key || (x.domain===domain && x.name.trim().toLowerCase()===input.name.trim().toLowerCase()));
  const previous=i>=0?next.inventory[i]:{};
  const item={...previous,...input,id:previous.id||key,name:input.name.trim(),domain,status,updatedAt:now(),updatedBy:actor};
  if(i>=0) next.inventory[i]=item; else next.inventory.push(item);
  return next;
}
export function setInventoryStatus(state,itemId,status,actor='parent',now=Date.now){
  if(!STATUSES.has(status)) throw new Error('Invalid inventory status');
  const next=clone(state); const item=next.inventory.find(x=>x.id===itemId); if(!item) throw new Error('Inventory item not found');
  item.status=status; item.updatedAt=now(); item.updatedBy=actor; return next;
}
export function inventorySummary(state){
  const result={food:{plenty:[],low:[],out:[]},household:{plenty:[],low:[],out:[]}};
  for(const item of state.inventory||[]) if(result[item.domain]?.[item.status]) result[item.domain][item.status].push(item);
  return result;
}
