import { UserProfile } from "../types";

export const USER_PROFILE_STORAGE_KEY = "droidforge_user_profile_v1";
export const REGISTERED_USERS_STORAGE_KEY = "droidforge_registered_users_v1";

export interface AvatarPreset {
  id: string;
  name: string;
  bgGradient: string;
  initials: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "preset_dev_1",
    name: "Cyber Developer",
    bgGradient: "from-blue-600 via-indigo-600 to-purple-700",
    initials: "DF",
  },
  {
    id: "preset_dev_2",
    name: "Android Architect",
    bgGradient: "from-emerald-500 via-teal-600 to-cyan-700",
    initials: "AA",
  },
  {
    id: "preset_dev_3",
    name: "Kotlin Master",
    bgGradient: "from-amber-500 via-orange-600 to-rose-600",
    initials: "KM",
  },
  {
    id: "preset_dev_4",
    name: "UI Specialist",
    bgGradient: "from-fuchsia-600 via-purple-600 to-pink-600",
    initials: "UI",
  },
  {
    id: "preset_dev_5",
    name: "Fullstack Ninja",
    bgGradient: "from-slate-700 via-slate-800 to-slate-900",
    initials: "FN",
  },
  {
    id: "preset_dev_6",
    name: "Creative Nomad",
    bgGradient: "from-violet-600 via-purple-600 to-indigo-800",
    initials: "CN",
  },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: "profile_alexdev",
  name: "Alex Developer",
  username: "alexdev",
  email: "alex.dev@droidforge.io",
  bio: "Lead Mobile Architect building cross-platform Android Jetpack Compose experiences.",
  avatar: "preset_dev_1",
  organization: "DroidForge Studios",
  geminiApiKey: "",
  githubUsername: "alexdev-droid",
  githubToken: "",
  isLoggedIn: true,
  createdAt: new Date().toISOString().split("T")[0],
  updatedAt: new Date().toISOString().split("T")[0],
};

export const getRegisteredUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Failed loading registered users", err);
  }
  return [DEFAULT_USER_PROFILE];
};

export const saveRegisteredUsers = (users: UserProfile[]) => {
  try {
    localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Failed saving registered users", err);
  }
};

export const loadUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.name) {
        return {
          ...DEFAULT_USER_PROFILE,
          ...parsed,
        };
      }
    }
  } catch (err) {
    console.error("Failed loading active user profile", err);
  }
  return DEFAULT_USER_PROFILE;
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    const updated = {
      ...profile,
      updatedAt: new Date().toISOString().split("T")[0],
    };
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(updated));

    // Also sync to registered users list
    const registered = getRegisteredUsers();
    const idx = registered.findIndex((u) => u.id === profile.id || u.email === profile.email);
    if (idx >= 0) {
      registered[idx] = updated;
    } else {
      registered.push(updated);
    }
    saveRegisteredUsers(registered);
  } catch (err) {
    console.error("Failed saving user profile", err);
  }
};

export const registerAccount = (data: {
  name: string;
  email: string;
  password?: string;
  username?: string;
  organization?: string;
}): { success: boolean; profile?: UserProfile; message?: string } => {
  const registered = getRegisteredUsers();
  const existing = registered.find(
    (u) => u.email.toLowerCase() === data.email.toLowerCase()
  );
  if (existing) {
    return { success: false, message: "An account with this email already exists." };
  }

  const username =
    data.username?.trim() ||
    data.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");

  const newProfile: UserProfile = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: data.name.trim(),
    username: username,
    email: data.email.trim().toLowerCase(),
    password: data.password,
    bio: "Mobile Developer crafting Jetpack Compose Android applications.",
    avatar: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)].id,
    organization: data.organization?.trim() || "Independent Developer",
    isLoggedIn: true,
    token: `token_${Date.now()}`,
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  };

  saveUserProfile(newProfile);
  return { success: true, profile: newProfile };
};

export const loginAccount = (data: {
  email: string;
  password?: string;
}): { success: boolean; profile?: UserProfile; message?: string } => {
  const registered = getRegisteredUsers();
  const match = registered.find(
    (u) =>
      u.email.toLowerCase() === data.email.toLowerCase() ||
      u.username.toLowerCase() === data.email.toLowerCase()
  );

  if (!match) {
    // If demo mode, log in as new user or default user
    if (data.email.includes("@") || data.email.length > 2) {
      const demoProfile: UserProfile = {
        ...DEFAULT_USER_PROFILE,
        id: `user_${Date.now()}`,
        name: data.email.split("@")[0],
        username: data.email.split("@")[0],
        email: data.email,
        isLoggedIn: true,
      };
      saveUserProfile(demoProfile);
      return { success: true, profile: demoProfile };
    }
    return { success: false, message: "No account found with this email/username." };
  }

  const updatedProfile: UserProfile = {
    ...match,
    isLoggedIn: true,
    token: `token_${Date.now()}`,
  };

  saveUserProfile(updatedProfile);
  return { success: true, profile: updatedProfile };
};

export const logoutAccount = (currentProfile: UserProfile): UserProfile => {
  const loggedOut: UserProfile = {
    ...currentProfile,
    isLoggedIn: false,
    token: undefined,
  };
  saveUserProfile(loggedOut);
  return loggedOut;
};

export const resetUserProfile = (): UserProfile => {
  try {
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
  } catch (err) {
    console.error("Failed resetting user profile", err);
  }
  return DEFAULT_USER_PROFILE;
};
