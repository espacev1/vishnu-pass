import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim();
});

const supabase = createClient(
    envVars.VITE_SUPABASE_URL,
    envVars.VITE_SUPABASE_ANON_KEY
);

async function check() {
    try {
        console.log("Fetching all schemas...");
        const res = await fetch(`${envVars.VITE_SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': envVars.VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${envVars.VITE_SUPABASE_ANON_KEY}`
            }
        });
        const data = await res.json();
        console.log("Tables:", Object.keys(data.paths).filter(p => !p.startsWith('/rpc')));
    } catch(e) {
        console.error(e);
    }
}
check();
