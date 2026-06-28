import { motion } from "motion/react";
import { 
  Users, 
  Search, 
  UserPlus, 
  MessageCircle, 
  Calendar, 
  BookOpen,
  Flame,
  Clock,
  Video,
  Phone,
  MoreVertical,
  Award,
  TrendingUp,
} from "lucide-react";

const friends = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "SC",
    status: "Studying at Library",
    online: true,
    streak: 18,
    availability: "Free until 5 PM",
    commonModules: ["Machine Learning", "Data Structures", "Algorithms"],
    studyHours: 42.5,
    notesShared: 24,
    color: "#d4f4e8",
    badges: ["Top Contributor", "Study MVP"],
  },
  {
    id: 2,
    name: "Jake Park",
    avatar: "JP",
    status: "In class - CS-201",
    online: true,
    streak: 12,
    availability: "Busy until 4 PM",
    commonModules: ["Data Structures", "Calculus II"],
    studyHours: 35.2,
    notesShared: 18,
    color: "#d4e8f4",
    badges: ["Rising Star"],
  },
  {
    id: 3,
    name: "Maya Patel",
    avatar: "MP",
    status: "Free for study session",
    online: true,
    streak: 25,
    availability: "Available now",
    commonModules: ["Calculus II", "Physics II"],
    studyHours: 48.0,
    notesShared: 31,
    color: "#fef4d4",
    badges: ["Streak Master", "Top Contributor"],
  },
  {
    id: 4,
    name: "Alex Kim",
    avatar: "AK",
    status: "Last seen 2 hours ago",
    online: false,
    streak: 8,
    availability: "Unknown",
    commonModules: ["Machine Learning"],
    studyHours: 28.5,
    notesShared: 12,
    color: "#f0e6f6",
    badges: [],
  },
  {
    id: 5,
    name: "Emma Davis",
    avatar: "ED",
    status: "Working on notes",
    online: true,
    streak: 15,
    availability: "Free after 3 PM",
    commonModules: ["Data Structures", "Machine Learning", "Database Systems"],
    studyHours: 39.8,
    notesShared: 27,
    color: "#f4b8d0",
    badges: ["Note Ninja"],
  },
  {
    id: 6,
    name: "Liam Johnson",
    avatar: "LJ",
    status: "Taking a break",
    online: true,
    streak: 6,
    availability: "Free until 2 PM",
    commonModules: ["Physics II", "Calculus II"],
    studyHours: 22.3,
    notesShared: 9,
    color: "#b8a4d4",
    badges: [],
  },
];

const friendRequests = [
  { id: 1, name: "Sophie Martinez", avatar: "SM", mutualFriends: 3, color: "#ffd4c8" },
  { id: 2, name: "Ryan Lee", avatar: "RL", mutualFriends: 2, color: "#d4e8f4" },
];

export function Friends() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Study Friends</h1>
          <p className="text-muted-foreground">Connect and collaborate with your study buddies</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search friends..."
              className="pl-10 pr-4 py-2 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all w-64"
            />
          </div>
          <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:shadow-lg transition-all flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Friend
          </button>
        </div>
      </motion.div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#b8a4d4]/10 to-[#f4b8d0]/10 rounded-2xl border border-[#b8a4d4]/30 p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Friend Requests ({friendRequests.length})
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {friendRequests.map((request) => (
              <div
                key={request.id}
                className="bg-card rounded-xl p-4 flex items-center gap-4"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg"
                  style={{ backgroundColor: request.color }}
                >
                  {request.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{request.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {request.mutualFriends} mutual friends
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-sm hover:shadow-md transition-all">
                    Accept
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-accent text-sm hover:bg-accent/70 transition-all">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Friends", value: friends.length, icon: Users, color: "#b8a4d4" },
          { label: "Online Now", value: friends.filter(f => f.online).length, icon: TrendingUp, color: "#d4f4e8" },
          { label: "Study Sessions", value: "34", icon: Calendar, color: "#d4e8f4" },
          { label: "Notes Exchanged", value: "156", icon: BookOpen, color: "#f4b8d0" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="bg-card rounded-2xl p-5 border border-border"
            style={{
              background: `linear-gradient(135deg, ${stat.color}15 0%, transparent 100%)`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${stat.color}30` }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-3 gap-6">
        {friends.map((friend, index) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="bg-card rounded-2xl border border-border p-6 hover:shadow-xl hover:shadow-primary/5 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg"
                    style={{ backgroundColor: friend.color }}
                  >
                    {friend.avatar}
                  </div>
                  {friend.online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-card"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{friend.name}</h3>
                  <p className="text-xs text-muted-foreground">{friend.status}</p>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-accent transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-accent/30">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-[#f4b8d0]" />
                  <span className="text-xs text-muted-foreground">Streak</span>
                </div>
                <p className="font-semibold">{friend.streak} days</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/30">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-[#d4e8f4]" />
                  <span className="text-xs text-muted-foreground">Study Hrs</span>
                </div>
                <p className="font-semibold">{friend.studyHours}h</p>
              </div>
            </div>

            {/* Availability */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Availability</span>
              </div>
              <p 
                className="text-sm px-3 py-2 rounded-lg"
                style={{ 
                  backgroundColor: friend.online ? `${friend.color}30` : '#f0e6f6',
                  color: friend.online ? friend.color : '#9088a0'
                }}
              >
                {friend.availability}
              </p>
            </div>

            {/* Common Modules */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Common Modules</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {friend.commonModules.map((module, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 rounded-lg bg-accent"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </div>

            {/* Badges */}
            {friend.badges.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {friend.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                    style={{ 
                      backgroundColor: `${friend.color}20`,
                      color: friend.color
                    }}
                  >
                    <Award className="w-3 h-3" />
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                className="py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm hover:shadow-md"
                style={{ 
                  backgroundColor: `${friend.color}30`,
                  color: friend.color
                }}
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
              <button className="py-2 px-3 rounded-xl bg-accent hover:bg-accent/70 transition-all flex items-center justify-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                Invite
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className="py-2 px-3 rounded-xl bg-accent hover:bg-accent/70 transition-all flex items-center justify-center gap-2 text-sm">
                <BookOpen className="w-4 h-4" />
                Notes
              </button>
              <button className="py-2 px-3 rounded-xl bg-accent hover:bg-accent/70 transition-all flex items-center justify-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                Schedule
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
