export function cloudEnabled(config={}){return Boolean(config.supabaseUrl&&config.supabaseAnonKey);}
export function cloudStateRow(householdId,state){return {household_id:householdId,payload:structuredClone(state),updated_at:new Date().toISOString()};}
export function mergeCloudState(localState,row){return row?.payload&&typeof row.payload==='object'?row.payload:localState;}

export async function createSupabase(config){
  if(!cloudEnabled(config)) return null;
  const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2');
  return createClient(config.supabaseUrl,config.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true}});
}
export async function signIn(client,email,password){const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;return data;}
export async function signOut(client){const {error}=await client.auth.signOut();if(error)throw error;}
export async function loadProfile(client){const {data:{user}}=await client.auth.getUser();if(!user)return null;const {data,error}=await client.from('household_members').select('household_id,role,display_name').eq('user_id',user.id).single();if(error)throw error;return {...data,user};}
export async function loadHouseholdState(client,householdId){const {data,error}=await client.from('household_state').select('household_id,payload,updated_at').eq('household_id',householdId).single();if(error&&error.code!=='PGRST116')throw error;return data||null;}
export async function saveHouseholdState(client,householdId,state){const {error}=await client.from('household_state').upsert(cloudStateRow(householdId,state),{onConflict:'household_id'});if(error)throw error;}
