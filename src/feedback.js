const RATINGS = new Set(['loved','again','okay','avoid']);
const clone = s => structuredClone(s);

function dishNamesFromPlan(plan){
  const names=[];
  for(const day of plan?.days||[]){
    const meals=[day.lunch,day.dinner];
    for(const meal of meals){
      if(!meal) continue;
      if(Array.isArray(meal)){ for(const d of meal) if(d?.name) names.push(d.name); }
      else if(meal?.name){ names.push(meal.name); }
      else if(meal?.dishes){ for(const d of meal.dishes) if(d?.name) names.push(d.name); }
      else if(typeof meal==='object'){ for(const d of Object.values(meal)) if(d?.name) names.push(d.name); }
    }
  }
  return names;
}

export function recordMealRating(state,input,now=Date.now){
  if(!input?.dishName?.trim()) throw new Error('Dish name is required');
  if(!RATINGS.has(input.rating)) throw new Error('Invalid rating');
  const next=clone(state);
  next.ratings.push({id:`rating-${now()}-${next.ratings.length+1}`,dishName:input.dishName.trim(),familyMemberId:input.familyMemberId||null,rating:input.rating,servedAt:input.servedAt||new Date(now()).toISOString(),createdAt:now()});
  return next;
}
export function recentDishNames(state,weeks=3){
  const plans=[...(state.weeklyPlans||[])].filter(p=>p.status==='approved'||p.status==='completed').sort((a,b)=>String(a.weekStart).localeCompare(String(b.weekStart))).slice(-weeks);
  return [...new Set(plans.flatMap(dishNamesFromPlan))];
}
export function ratingSummary(state){
  const out={avoid:[],repeat:[],byMember:{}};
  for(const r of state.ratings||[]){
    if(r.rating==='avoid'&&!out.avoid.includes(r.dishName)) out.avoid.push(r.dishName);
    if((r.rating==='loved'||r.rating==='again')&&!out.repeat.includes(r.dishName)) out.repeat.push(r.dishName);
    if(r.familyMemberId){
      const m=out.byMember[r.familyMemberId] ||= {loved:[],again:[],okay:[],avoid:[]};
      if(!m[r.rating].includes(r.dishName)) m[r.rating].push(r.dishName);
    }
  }
  return out;
}
export function buildFeedbackContext(state){return {recentDishes:recentDishNames(state,3),ratings:ratingSummary(state)};}
