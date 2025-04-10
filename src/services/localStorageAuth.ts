
import { User } from '@/types/auth';
import { generateReferralCode } from '@/utils/referral';

// Local storage keys
const USER_KEY = 'user';
const USERS_KEY = 'users';

// Get all users from local storage
export const getAllUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Save all users to local storage
export const saveAllUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Get current user from local storage
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Save current user to local storage
export const saveCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

// Sign in user
export const signIn = async (email: string, password: string): Promise<User> => {
  console.log('Service: Signing in with email:', email);
  const users = getAllUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.error('User not found with email:', email);
    throw new Error('User not found. Please sign up.');
  }
  
  // In a real app, you would hash the password, but for simplicity we're using plain text
  if (user.password !== password) {
    console.error('Invalid password for user:', email);
    throw new Error('Invalid email or password');
  }
  
  console.log('Login successful for user:', user.name);
  
  // Don't include password when returning the user
  const { password: _, ...userWithoutPassword } = user;
  
  // Save current user to local storage
  saveCurrentUser(userWithoutPassword);
  
  return userWithoutPassword;
};

// Sign up new user
export const signUp = async (name: string, email: string, password: string): Promise<User> => {
  console.log('Service: Creating new user with email:', email);
  const users = getAllUsers();
  
  // Check if user already exists
  if (users.some(u => u.email === email)) {
    console.error('Email already exists:', email);
    throw new Error('An account with this email already exists');
  }
  
  // Create new user
  const newUser: User & { password: string } = {
    id: Date.now().toString(),
    name,
    email,
    password, // In a real app, you would hash this
    coins: 200, // Starting coins
    referralCode: generateReferralCode(),
    hasSetupPin: false,
    hasBiometrics: false,
    withdrawalAddress: null,
    appliedReferralCode: null,
    usdtEarnings: 0,
    notifications: [],
    isAdmin: false
  };
  
  console.log('Created new user:', newUser);
  
  // Save to users list
  users.push(newUser);
  saveAllUsers(users);
  
  // Save current user (without password)
  const { password: _, ...userWithoutPassword } = newUser;
  saveCurrentUser(userWithoutPassword);
  
  console.log('User saved successfully, returning user without password');
  
  return userWithoutPassword;
};

// Sign out
export const signOut = async (): Promise<void> => {
  localStorage.removeItem(USER_KEY);
};

// Update user
export const updateUser = async (updates: Partial<User>): Promise<User> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Not authenticated');
  }
  
  // Update the current user
  const updatedUser = { ...currentUser, ...updates };
  saveCurrentUser(updatedUser);
  
  // Update the user in the users list
  const users = getAllUsers();
  const updatedUsers = users.map(u => 
    u.id === currentUser.id ? { ...u, ...updates } : u
  );
  saveAllUsers(updatedUsers);
  
  return updatedUser;
};

// Delete user
export const deleteUser = async (userId: string): Promise<void> => {
  const users = getAllUsers();
  const updatedUsers = users.filter(u => u.id !== userId);
  saveAllUsers(updatedUsers);
  
  // If the deleted user is the current user, sign out
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    signOut();
  }
};

// Initialize with some mock users if none exist
export const initializeLocalStorage = (): void => {
  console.log('Initializing local storage auth');
  const users = getAllUsers();
  
  if (users.length === 0) {
    console.log('No users found, creating demo users');
    const mockUsers: (User & { password: string })[] = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        coins: 10000,
        referralCode: 'ADMIN1',
        hasSetupPin: true,
        hasBiometrics: false,
        withdrawalAddress: '0x123456789',
        appliedReferralCode: null,
        usdtEarnings: 500,
        notifications: [
          {
            id: '1',
            message: 'Welcome to the platform!',
            read: false,
            createdAt: new Date().toISOString()
          }
        ],
        isAdmin: true
      },
      {
        id: '2',
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123',
        coins: 500,
        referralCode: 'TEST01',
        hasSetupPin: false,
        hasBiometrics: false,
        withdrawalAddress: null,
        appliedReferralCode: null,
        usdtEarnings: 50,
        notifications: [],
        isAdmin: false
      }
    ];
    
    saveAllUsers(mockUsers);
    console.log('Demo users created');
  } else {
    console.log('Users already exist in storage:', users.length);
  }
};
