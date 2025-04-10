
// This is a placeholder file to fix imports

// Mock Supabase client for compatibility
const supabaseClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
      }),
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: null }),
      }),
    }),
    update: () => ({
      eq: () => ({
        select: async () => ({ data: null, error: null }),
      }),
    }),
  }),
};

export default supabaseClient;
