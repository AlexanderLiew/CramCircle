import { useState } from "react";
import { motion } from "motion/react";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Lock, 
  Palette, 
  Accessibility,
  Sparkles,
  Moon,
  Sun,
  Volume2,
  Eye,
  Shield,
  Globe,
  Smartphone,
  ChevronRight,
} from "lucide-react";

const settingsSections = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Lock },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "ai", label: "AI Preferences", icon: Sparkles },
];

const pastelThemes = [
  { name: "Lavender Dream", primary: "#b8a4d4", secondary: "#f4b8d0" },
  { name: "Ocean Breeze", primary: "#d4e8f4", secondary: "#d4f4e8" },
  { name: "Peachy Keen", primary: "#ffd4c8", secondary: "#fef4d4" },
  { name: "Mint Fresh", primary: "#d4f4e8", secondary: "#d4e8f4" },
  { name: "Rose Garden", primary: "#f4b8d0", secondary: "#fef4d4" },
  { name: "Twilight Sky", primary: "#b8a4d4", secondary: "#d4e8f4" },
];

export function Settings() {
  const [activeSection, setActiveSection] = useState("account");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(pastelThemes[0]);
  const [notifications, setNotifications] = useState({
    studySessions: true,
    friendRequests: true,
    noteShares: true,
    achievements: true,
    reminders: true,
    messages: true,
  });

  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Emma Wilson"
                    className="w-full px-4 py-2 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="emma.wilson@university.edu"
                    className="w-full px-4 py-2 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Major</label>
                  <input
                    type="text"
                    defaultValue="Computer Science"
                    className="w-full px-4 py-2 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <select className="w-full px-4 py-2 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring/20">
                    <option>Freshman</option>
                    <option>Sophomore</option>
                    <option selected>Junior</option>
                    <option>Senior</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <button className="px-6 py-2 rounded-xl bg-primary text-primary-foreground hover:shadow-lg transition-all">
                Save Changes
              </button>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Theme Mode</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDarkMode(false)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    !darkMode
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Sun className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Light Mode</p>
                </button>
                <button
                  onClick={() => setDarkMode(true)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    darkMode
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Moon className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Dark Mode</p>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Pastel Color Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {pastelThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedTheme.name === theme.name
                        ? 'border-primary shadow-lg'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-lg"
                        style={{ backgroundColor: theme.primary }}
                      ></div>
                      <div
                        className="w-8 h-8 rounded-lg"
                        style={{ backgroundColor: theme.secondary }}
                      ></div>
                    </div>
                    <p className="font-medium text-sm">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Interface Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-muted-foreground">Show more content</p>
                    </div>
                  </div>
                  <input type="checkbox" className="w-12 h-6 rounded-full" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Animations</p>
                      <p className="text-sm text-muted-foreground">Smooth transitions</p>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-12 h-6 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                {Object.entries(notifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-xl bg-accent/30"
                  >
                    <div>
                      <p className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about {key.toLowerCase()}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() =>
                        setNotifications({ ...notifications, [key]: !value })
                      }
                      className="w-12 h-6 rounded-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Notification Channels</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Desktop & mobile</p>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-12 h-6 rounded-full" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Sound Alerts</p>
                      <p className="text-sm text-muted-foreground">Audio notifications</p>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-12 h-6 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-muted-foreground">Who can see your profile</p>
                    </div>
                  </div>
                  <select className="px-4 py-2 rounded-lg bg-input-background border border-border">
                    <option>Everyone</option>
                    <option selected>Friends Only</option>
                    <option>Private</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Activity Status</p>
                      <p className="text-sm text-muted-foreground">Show when you're online</p>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-12 h-6 rounded-full" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Share Study Data</p>
                      <p className="text-sm text-muted-foreground">For personalized AI recommendations</p>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-12 h-6 rounded-full" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Security</h3>
              <div className="space-y-3">
                <button className="w-full p-4 rounded-xl bg-accent/30 hover:bg-accent transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-muted-foreground">Update your password</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="w-full p-4 rounded-xl bg-accent/30 hover:bg-accent transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add extra security</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        );

      case "accessibility":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Visual Accessibility</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div>
                    <p className="font-medium">Text Size</p>
                    <p className="text-sm text-muted-foreground">Adjust font size</p>
                  </div>
                  <select className="px-4 py-2 rounded-lg bg-input-background border border-border">
                    <option>Small</option>
                    <option selected>Medium</option>
                    <option>Large</option>
                    <option>Extra Large</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div>
                    <p className="font-medium">High Contrast</p>
                    <p className="text-sm text-muted-foreground">Improve readability</p>
                  </div>
                  <input type="checkbox" className="w-12 h-6 rounded-full" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div>
                    <p className="font-medium">Reduce Motion</p>
                    <p className="text-sm text-muted-foreground">Minimize animations</p>
                  </div>
                  <input type="checkbox" className="w-12 h-6 rounded-full" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Screen Reader</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div>
                    <p className="font-medium">Enable Screen Reader Support</p>
                    <p className="text-sm text-muted-foreground">Optimize for assistive technology</p>
                  </div>
                  <input type="checkbox" className="w-12 h-6 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#b8a4d4]/20 to-[#f4b8d0]/20 border border-[#b8a4d4]/30">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-[#b8a4d4]" />
                <h4 className="font-semibold">AI Study Assistant</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Customize how the AI assistant helps with your studying
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">AI Features</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div>
                    <p className="font-medium">Smart Scheduling</p>
                    <p className="text-sm text-muted-foreground">AI suggests optimal meeting times</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-12 h-6 rounded-full" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div>
                    <p className="font-medium">Study Recommendations</p>
                    <p className="text-sm text-muted-foreground">Personalized study tips</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-12 h-6 rounded-full" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div>
                    <p className="font-medium">Break Reminders</p>
                    <p className="text-sm text-muted-foreground">AI suggests when to take breaks</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-12 h-6 rounded-full" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30">
                  <div>
                    <p className="font-medium">Note Summaries</p>
                    <p className="text-sm text-muted-foreground">Auto-generate note summaries</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-12 h-6 rounded-full" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Learning Style</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-accent/30">
                  <p className="font-medium mb-2">Preferred Study Time</p>
                  <select className="w-full px-4 py-2 rounded-lg bg-input-background border border-border">
                    <option selected>Morning (6 AM - 12 PM)</option>
                    <option>Afternoon (12 PM - 6 PM)</option>
                    <option>Evening (6 PM - 12 AM)</option>
                    <option>Night (12 AM - 6 AM)</option>
                  </select>
                </div>
                <div className="p-4 rounded-xl bg-accent/30">
                  <p className="font-medium mb-2">Focus Duration</p>
                  <select className="w-full px-4 py-2 rounded-lg bg-input-background border border-border">
                    <option>25 minutes (Pomodoro)</option>
                    <option selected>50 minutes (Standard)</option>
                    <option>90 minutes (Deep Focus)</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6 max-w-7xl mx-auto">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card rounded-2xl border border-border p-4"
      >
        <div className="flex items-center gap-3 mb-6 p-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b8a4d4] to-[#f4b8d0] flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Settings</h2>
            <p className="text-xs text-muted-foreground">Customize your experience</p>
          </div>
        </div>

        <div className="space-y-1">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'hover:bg-accent'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-8"
      >
        <h2 className="text-2xl font-bold mb-6">
          {settingsSections.find(s => s.id === activeSection)?.label}
        </h2>
        {renderSection()}
      </motion.div>
    </div>
  );
}
