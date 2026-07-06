import { createClient } from '@supabase/supabase-js'

// Publishable/anon key is bewust publiek-veilig; RLS beschermt de data.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://omehidrjddyfcfeogprr.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3O4mggHmbOYUQZlE2MEDcQ_7zB6Yi6I'

export const supabase = createClient(url, key)
