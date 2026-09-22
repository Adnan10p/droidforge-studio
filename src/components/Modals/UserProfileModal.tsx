import React, { useState } from "react";
import {
  X,
  User,
  Check,
  Shield,
  Key,
  FolderKanban,
  Building2,
  Mail,
  Sparkles,
  Github,
  Lock,
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  BadgeCheck,
  LogOut,
  UserPlus,
  LogIn,
} from "lucide-react";
import { UserProfile, SavedProject } from "../../types";
import { AVATAR_PRESETS, saveUserProfile, resetUserProfile } from "../../utils/profileManager";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout?: () => void;
  onOpenAuth?: (mode?: "login" | "register") => void;
  projects?: SavedProject[];
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onLogout,
  onOpenAuth,
  projects = [],
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "keys" | "stats">("general");
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    saveUserProfile(formData);
    showToast("User profile saved successfully!");
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your user profile to default values?")) {
      const reset = resetUserProfile();
      setFormData(reset);
      onUpdateProfile(reset);
      showToast("Profile reset to defaults.");
    }
  };

  const handleExportProfile = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
      const anchor = document.createElement("a");
      anchor.setAttribute("href", dataStr);
      anchor.setAttribute("download", `droidforge-profile-${formData.username || "user"}.json`);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      showToast("Profile exported as JSON!");
    } catch (err) {
      console.error(err);
      showToast("Export failed.");
    }
  };

  const handleImportProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === "object" && parsed.name) {
          const merged = { ...formData, ...parsed };
          setFormData(merged);
          onUpdateProfile(merged);
          saveUserProfile(merged);
          showToast("Profile imported successfully!");
        } else {
          showToast("Invalid profile format.");
        }
      } catch (err) {
        showToast("Error parsing profile JSON.");
      }
    };
    reader.readAsText(file);
  };

  // Find current avatar preset
  const currentPreset = AVATAR_PRESETS.find((p) => p.id === formData.avatar) || AVATAR_PRESETS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentPreset.bgGradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}
            >
              {currentPreset.initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {formData.name || "User Profile"}
                <BadgeCheck className="w-4 h-4 text-blue-400" />
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {formData.email} • @{formData.username || "dev"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Log Out Button */}
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Log Out of your active user account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip (No Project Defaults tab as requested) */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("general")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === "general"
                  ? "border-indigo-500 text-indigo-400 bg-indigo-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile & Identity</span>
            </button>
            <button
              onClick={() => setActiveTab("keys")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === "keys"
                  ? "border-indigo-500 text-indigo-400 bg-indigo-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Key className="w-4 h-4" />
              <span>API Keys & Credentials</span>
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === "stats"
                  ? "border-indigo-500 text-indigo-400 bg-indigo-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>My Projects & Backup</span>
            </button>
          </div>

          {/* Quick Switch / Register Link */}
          {onOpenAuth && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth("register");
              }}
              className="py-1.5 px-3 rounded-lg text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 font-semibold flex items-center gap-1.5 transition-all shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Account / Register</span>
            </button>
          )}
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GENERAL PROFILE & IDENTITY */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-3">
                  Developer Avatar & Style
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = formData.avatar === preset.id;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => handleChange("avatar", preset.id)}
                        className={`relative rounded-xl p-3 flex flex-col items-center justify-center gap-2 border transition-all ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/40"
                            : "border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800/50"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${preset.bgGradient} flex items-center justify-center text-white font-bold text-base shadow-sm`}
                        >
                          {preset.initials}
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 truncate max-w-full">
                          {preset.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Developer Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Alex Developer"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username / Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                      @
                    </span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      placeholder="alexdev"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="developer@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Organization / Studio</span>
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => handleChange("organization", e.target.value)}
                    placeholder="e.g. Acme Mobile Labs"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Developer Bio / Tagline
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Describe your role or mobile development goals..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: API KEYS & CREDENTIALS */}
          {activeTab === "keys" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-amber-200">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Secure Local Storage
                </p>
                <p>
                  API keys are stored safely in your browser localStorage to unlock live AI code generation and instant cloud deployment.
                </p>
              </div>

              <div className="space-y-4">
                {/* Gemini API Key */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Gemini API Key (AI App Generator)
                    </span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      Get Key
                    </a>
                  </label>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? "text" : "password"}
                      value={formData.geminiApiKey || ""}
                      onChange={(e) => handleChange("geminiApiKey", e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* GitHub Username & Token */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-slate-400" />
                      GitHub Username
                    </label>
                    <input
                      type="text"
                      value={formData.githubUsername || ""}
                      onChange={(e) => handleChange("githubUsername", e.target.value)}
                      placeholder="octocat"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      GitHub Access Token
                    </label>
                    <div className="relative">
                      <input
                        type={showGithubToken ? "text" : "password"}
                        value={formData.githubToken || ""}
                        onChange={(e) => handleChange("githubToken", e.target.value)}
                        placeholder="ghp_..."
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGithubToken(!showGithubToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MY PROJECTS & PROFILE BACKUP */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              {/* Profile Overview Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentPreset.bgGradient} flex items-center justify-center text-white font-bold text-lg shadow-sm`}
                  >
                    {currentPreset.initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {formData.name}
                      <span className="text-xs font-normal text-slate-400">(@{formData.username})</span>
                    </h3>
                    <p className="text-xs text-slate-400">{formData.organization || "Independent Developer"}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-400">{projects.length}</span>
                  <p className="text-[11px] text-slate-400 font-medium">Total Projects</p>
                </div>
              </div>

              {/* Profile JSON Export/Import */}
              <div className="border-t border-slate-800 pt-5 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Profile Backup & Data Sync
                </h4>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleExportProfile}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span>Export Profile JSON</span>
                  </button>

                  <label className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Import Profile JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportProfile}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-900/50 text-red-300 text-xs font-semibold flex items-center gap-2 transition-colors ml-auto"
                  >
                    <RotateCcw className="w-4 h-4 text-red-400" />
                    <span>Reset Profile</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {toastMsg && (
              <div className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{toastMsg}</span>
              </div>
            )}
            {!toastMsg && <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
