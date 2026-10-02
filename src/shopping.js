const ROUTES=new Set(['already_have','helper_buys','online_delivery']);
export function normalizeItemName(name=''){return name.trim().toLowerCase().replace(/\s+/g,' ');}
const idFor=n=>`shop-${normalizeItemName(n).replace(/[^a-z0-9]+/g,'-')}`;
export function buildShoppingList({ingredients=[],inventory=[],topUps=[],existing=[]}={}){
  const byName=new Map();
  const existingMap=new Map(existing.map(x=>[normalizeItemName(x.normalizedName||x.name),x]));
  const invMap=new Map(inventory.map(x=>[normalizeItemName(x.name),x]));
  const add=(name,source,routeHint,category='')=>{
    const key=normalizeItemName(name); if(!key) return;
    const prev=byName.get(key)||existingMap.get(key);
    const inv=invMap.get(key);
    let route=prev?.route;
    if(!ROUTES.has(route)){
      if(inv?.status==='plenty') route='already_have';
      else if(ROUTES.has(routeHint)) route=routeHint;
      else route='helper_buys';
    }
    byName.set(key,{id:prev?.id||idFor(name),name:prev?.name||String(name).trim(),normalizedName:key,category:prev?.category||category||inv?.category||'',route,checked:prev?.checked??false,source:prev?.source||source});
  };
  for(const name of ingredients) add(name,'meal_plan');
  for(const t of topUps.filter(x=>!x.resolved)) add(t.name,'helper_topup',t.routeHint,t.domain||'');
  return [...byName.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
export function setShoppingRoute(items,id,route){if(!ROUTES.has(route)) throw new Error('Invalid shopping route'); return items.map(x=>x.id===id?{...x,route}:x);}
export function setShoppingChecked(items,id,checked){return items.map(x=>x.id===id?{...x,checked:Boolean(checked)}:x);}
