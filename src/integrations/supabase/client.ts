
// This is a stub file to prevent build errors
// We are transitioning away from Supabase to Firebase

// A dummy supabase client that does nothing
export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: new Error('Supabase is not available') })
      }),
      order: () => ({})
    }),
    update: () => ({
      eq: async () => ({ error: new Error('Supabase is not available') })
    }),
    delete: () => ({
      eq: async () => ({ error: new Error('Supabase is not available') })
    }),
    insert: () => ({})
  }),
  auth: {
    getUser: async () => ({ data: null, error: new Error('Supabase is not available') }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase is not available') }),
    updateUser: async () => ({ data: null, error: new Error('Supabase is not available') })
  }
};
