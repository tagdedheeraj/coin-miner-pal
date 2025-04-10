
// Re-export Firebase client for backward compatibility
import { auth, db, storage } from '@/integrations/firebase/client';
import { supabase } from '@/integrations/supabase/client';
export { auth, db, storage, supabase };
