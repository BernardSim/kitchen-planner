import {buildFeedbackContext} from './feedback.js';

const WEEKLY_SCHEMA = `Return raw JSON only with this shape:
{"id":"string","weekStart":"YYYY-MM-DD","status":"draft","days":[{"day":"Monday","lunch":DISH,"dinner":DISH}],"helperPrep":["string"]}
DISH = {"id":"string","name":"string","description":"string","cuisine":"Chinese|Japanese|Western","keyIngredients":["string"],"recipeSource":{"siteName":"string","searchQuery":"string","quickTip":"string"},"exposureLevel":"safe|familiar_plus|stretch|new","prepNotes":"string"}.
Exactly Monday-Friday. Use realistic Singapore-available ingredients and cuisine-appropriate recipe sources.`;

function familyContext(state){
  return (state.familyMembers||[]).filter(x=>x.role!=='helper').map(x=>({name:x.name,role:x.role,likes:x.likes||[],dislikes:x.dislikes||[],spiceTolerance:x.spiceTolerance||'mild',notes:x.notes||''}));
}

export function buildWeeklyPrompt(state, weekStart){
  const feedback=buildFeedbackContext(state);
  const target=Number(state.ui?.chineseExposureTarget ?? 3);
  const system=`You are the meal-planning agent for a Singapore Chinese household with a domestic helper. Build a practical Monday-Friday plan. Child-facing meals must be non-spicy. Aim for at least ${target} Chinese dinners, with Japanese and Western meals used for variety. Use a roughly 70% familiar / 20% adjacent / 10% new exposure mix for the children. Prefer ingredient reuse across the week to reduce waste. Explicitly avoid repeating recent dishes unless a highly-rated family request justifies it. Every dish should be executable by a competent home cook and include a concise prep note. ${WEEKLY_SCHEMA}`;
  const user=`Plan week starting ${weekStart}.
Family profiles: ${JSON.stringify(familyContext(state))}
Current inventory: ${JSON.stringify(state.inventory||[])}
Family meal requests: ${JSON.stringify((state.mealRequests||[]).filter(r=>!r.weekId||r.weekId===weekStart))}
Recent dishes to avoid repeating: ${JSON.stringify(feedback.recentDishes)}
Ratings and repeat/avoid signals: ${JSON.stringify(feedback.ratings)}
Chinese dinner exposure target: ${target} of 5.
Prioritize non-spicy gateway Chinese meals where appropriate and use ingredient reuse deliberately.`;
  return {system,user};
}

export function buildSwapPrompt(state, planId, day, slot){
  const plan=(state.weeklyPlans||[]).find(p=>p.id===planId);
  if(!plan) throw new Error('Plan not found');
  const system=`Replace exactly one meal in an existing family plan. Preserve all household constraints, especially non-spicy child meals, progressive Chinese exposure, recent-dish avoidance, ratings, and ingredient reuse. Return raw JSON for a single DISH only. ${WEEKLY_SCHEMA.split('DISH = ')[1].split('.\nExactly')[0]}`;
  const user=`Plan: ${JSON.stringify(plan)}\nReplace ${day} ${slot}. Family: ${JSON.stringify(familyContext(state))}. Feedback: ${JSON.stringify(buildFeedbackContext(state))}. Inventory: ${JSON.stringify(state.inventory||[])}. Do not modify any other meal.`;
  return {system,user};
}

export function buildPartyPrompt({guests=8,cuisine='Chinese',dietary='',notes='',date=''}={}){
  const system=`You are a Singapore-based dinner party planning expert. Plan an elegant home dinner party for a domestic helper who cooks well but is not a professional chef. Groceries should be obtainable from mainstream Singapore supermarkets. For every dish provide a reputable cuisine-appropriate recipe source and a specific searchQuery. Return raw JSON only with this contract: {"partyTitle":"string","guestCount":8,"cuisine":"string","menu":{"welcome":DISH,"starter":DISH,"soup":DISH,"mains":[DISH],"sides":[DISH],"dessert":DISH},"shoppingList":{"produce":[],"proteins":[],"pantry":[],"special":[]},"timeline":[{"when":"string","task":"string","note":"string"}],"helperInstructions":"string","hostTips":"string"}. PARTY DISH fields: name, description, prepTime, recipeSource{siteName,searchQuery}; mains may include isShowstopper.`;
  const user=`Dinner party for ${guests} guests. Cuisine: ${cuisine}.${dietary?` Dietary notes: ${dietary}.`:''}${notes?` Requests: ${notes}.`:''}${date?` Party date: ${date}.`:''}`;
  return {system,user};
}
