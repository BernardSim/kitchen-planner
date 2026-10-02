const WEEKDAYS=['Monday','Tuesday','Wednesday','Thursday','Friday'];

function validDish(d){return Boolean(d&&typeof d==='object'&&typeof d.name==='string'&&d.name.trim()&&Array.isArray(d.keyIngredients));}
export function validateWeeklyPlan(value){
  const errors=[];
  if(!value||typeof value!=='object') return {ok:false,errors:['Plan must be an object']};
  if(!Array.isArray(value.days)||value.days.length!==5) errors.push('Plan must contain exactly five days');
  else value.days.forEach((d,i)=>{if(d.day!==WEEKDAYS[i]) errors.push(`Day ${i+1} must be ${WEEKDAYS[i]}`); if(!validDish(d.lunch)) errors.push(`${WEEKDAYS[i]} lunch is invalid`); if(!validDish(d.dinner)) errors.push(`${WEEKDAYS[i]} dinner is invalid`);});
  return {ok:errors.length===0,errors};
}
export function applySwap(plan,day,slot,dish){
  if(!['lunch','dinner'].includes(slot)) throw new Error('Invalid meal slot'); if(!validDish(dish)) throw new Error('Invalid replacement dish');
  const next=structuredClone(plan); const target=next.days.find(d=>d.day===day); if(!target) throw new Error('Day not found'); target[slot]=structuredClone(dish); return next;
}
export async function callAnthropic(apiKey,system,user,maxTokens=5000,fetchImpl=globalThis.fetch){
  if(!apiKey?.trim()) throw new Error('Anthropic API key is required');
  const response=await fetchImpl('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':apiKey.trim(),'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:maxTokens,system,messages:[{role:'user',content:user}]})});
  if(!response.ok){let detail='';try{detail=await response.text();}catch{} throw new Error(`Anthropic API ${response.status}${detail?`: ${detail.slice(0,300)}`:''}`);}
  const data=await response.json(); const text=(data.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('\n').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  try{return JSON.parse(text);}catch{throw new Error(`Invalid JSON response: ${text.slice(0,300)}`);}
}
