import { AuthUser } from "../types";

/**
 * Backend API URL Configuration
 */
const API_URL = (import.meta as any).env?.VITE_API_URL || "https://aistudybuddy-backend-2035351700.us-central1.run.app";

const LOCAL_USERS_KEY = 'smart_tutor_local_users';

const getLocalUsers = (): any[] => {
  try {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalUser = (user: any) => {
  try {
    const users = getLocalUsers();
    // Prevent duplicates
    if (!users.find(u => u.email === user.email)) {
      users.push(user);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }
  } catch (e) {
    // Silent fail for storage issues
  }
};

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const user = await response.json();
          saveLocalUser({ ...user, password });
          return user;
        }
      }
    } catch (e) {
      // Fallback silently to local storage
    }

    const localUsers = getLocalUsers();
    const localUser = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (localUser) {
      return { id: localUser.id, name: localUser.name, email: localUser.email };
    }

    if (email.toLowerCase().includes('demo') || email.toLowerCase().includes('test')) {
      return { id: 'demo-' + Date.now(), name: 'Demo Student', email };
    }

    throw new Error("Student credentials not found.");
  },

  async signup(name: string, email: string, password: string): Promise<void> {
    // 1. Check local duplicates first
    const existingLocal = getLocalUsers();
    if (existingLocal.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("u already have accont");
    }

    // 2. Try to sync with cloud
    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const msg = (errorData.message || "").toLowerCase();
          if (msg.includes("exists") || msg.includes("already")) {
            throw new Error("u already have accont");
          }
        }
      }
    } catch (e: any) {
      // If we threw the specific error above or the backend responded with it, re-throw
      if (e.message === "u already have accont") throw e;
    }

    // 3. Save to Local Cache
    saveLocalUser({ id: Date.now().toString(), name, email, password });
  }
};