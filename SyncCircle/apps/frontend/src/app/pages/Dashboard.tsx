import { motion } from "motion/react";
import { 
  Clock, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Sparkles,
  ChevronRight,
  Flame,
  Target,
  Award,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const todaysClasses = [
  { id: 1, name: "Data Structures", time: "10:00 AM", room: "CS-201", color: "#b8a4d4", minutesUntil: 45 },
  { id: 2, name: "Calculus II", time: "2:00 PM", room: "MATH-104", color: "#d4e8f4", minutesUntil: 285 },
  { id: 3, name: "Machine Learning", time: "4:00 PM", room: "CS-305", color: "#f4b8d0", minutesUntil: 405 },
];

const friendStatuses = [
  { id: 1, name: "Sarah Chen", status: "Studying at Library", avatar: "SC", online: true, color: "#d4f4e8" },
  { id: 2, name: "Jake Park", status: "In class - CS-201", avatar: "JP", online: true, color: "#d4e8f4" },
  { id: 3, name: "Maya Patel", status: "Free until 3 PM", avatar: "MP", online: true, color: "#fef4d4" },
  { id: 4, name: "Alex Kim", status: "Offline", avatar: "AK", online: false, color: "#f0e6f6" },
];

const upcomingSessions = [
  { id: 1, title: "Group Study: Algorithms Exam", time: "Tomorrow, 5:00 PM", participants: 4, color: "#b8a4d4" },
  { id: 2, title: "Calculus Problem Set Review", time: "Sat, 2:00 PM", participants: 3, color: "#d4e8f4" },
];

const sharedNotes = [
  { id: 1, title: "ML Week 5 - Neural Networks", author: "Sarah Chen", subject: "Machine Learning", color: "#f4b8d0", updated: "2h ago" },
  { id: 2, title: "Calculus Cheat Sheet - Integration", author: "Jake Park", subject: "Calculus II", color: "#d4e8f4", updated: "5h ago" },
];

const productivityData = [
  { day: 'Mon', hours: 3.5 },
  { day: 'Tue', hours: 4.2 },
  { day: 'Wed', hours: 5.1 },
  { day: 'Thu', hours: 4.8 },
  { day: 'Fri', hours: 6.2 },
  { day: 'Sat', hours: 7.5 },
  { day: 'Sun', hours: 5.8 },
];

export function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#b8a4d4] to-[#f4b8d0] rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Friday, June 26, 2026</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Good morning, Emma! ☀️</h1>
          <p className="text-lg opacity-90">You have 3 classes today and 2 upcoming study sessions. Let's make it productive!</p>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Study Streak", value: "12 days", icon: Flame, color: "#f4b8d0" },
          { label: "This Week", value: "37.1 hrs", icon: Clock, color: "#d4e8f4" },
          { label: "Study Friends", value: "24", icon: Users, color: "#b8a4d4" },
          { label: "Notes Shared", value: "156", icon: BookOpen, color: "#d4f4e8" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl p-6 border border-border hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer"
            style={{ 
              background: `linear-gradient(135deg, ${stat.color}15 0%, transparent 100%)`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}30` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Today's Classes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 border border-border col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#b8a4d4]/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#b8a4d4]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Today's Classes</h2>
                <p className="text-sm text-muted-foreground">3 classes scheduled</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {todaysClasses.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-accent/50 transition-all cursor-pointer"
                style={{ 
                  borderLeft: `4px solid ${cls.color}`,
                  background: `linear-gradient(90deg, ${cls.color}10 0%, transparent 100%)`,
                }}
              >
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{cls.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {cls.time}
                    </span>
                    <span>{cls.room}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: cls.color }}>
                    {cls.minutesUntil < 60 ? `${cls.minutesUntil}m` : `${Math.floor(cls.minutesUntil / 60)}h ${cls.minutesUntil % 60}m`}
                  </div>
                  <div className="text-xs text-muted-foreground">until class</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Friend Statuses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#d4f4e8]/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#d4f4e8]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Friends</h2>
              <p className="text-sm text-muted-foreground">3 online now</p>
            </div>
          </div>

          <div className="space-y-3">
            {friendStatuses.map((friend, index) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all cursor-pointer"
              >
                <div className="relative">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-medium"
                    style={{ backgroundColor: friend.color }}
                  >
                    {friend.avatar}
                  </div>
                  {friend.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-card"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{friend.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{friend.status}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-sm text-primary hover:bg-accent rounded-xl transition-colors flex items-center justify-center gap-2">
            View all friends
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Productivity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-6 border border-border col-span-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#d4e8f4]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#d4e8f4]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Productivity This Week</h2>
              <p className="text-sm text-muted-foreground">Study hours per day</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={productivityData}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b8a4d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#b8a4d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
              <XAxis dataKey="day" stroke="#9088a0" />
              <YAxis stroke="#9088a0" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Area type="monotone" dataKey="hours" stroke="#b8a4d4" strokeWidth={3} fill="url(#colorHours)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Upcoming Study Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#f4b8d0]/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#f4b8d0]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Study Sessions</h2>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </div>

          <div className="space-y-3">
            {upcomingSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-4 rounded-xl hover:shadow-md transition-all cursor-pointer"
                style={{ 
                  background: `linear-gradient(135deg, ${session.color}15 0%, transparent 100%)`,
                  border: `1px solid ${session.color}30`
                }}
              >
                <h3 className="font-medium mb-2">{session.title}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{session.time}</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{session.participants}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Shared Notes & AI Recommendations */}
      <div className="grid grid-cols-2 gap-6">
        {/* Shared Notes Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#d4f4e8]/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#d4f4e8]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Recently Shared Notes</h2>
              <p className="text-sm text-muted-foreground">From your study group</p>
            </div>
          </div>

          <div className="space-y-3">
            {sharedNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="p-4 rounded-xl hover:shadow-md transition-all cursor-pointer"
                style={{ 
                  background: `linear-gradient(135deg, ${note.color}15 0%, transparent 100%)`,
                  borderLeft: `3px solid ${note.color}`
                }}
              >
                <h3 className="font-medium mb-1">{note.title}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>By {note.author}</span>
                  <span>{note.updated}</span>
                </div>
                <div className="mt-2">
                  <span 
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{ 
                      backgroundColor: `${note.color}20`,
                      color: note.color
                    }}
                  >
                    {note.subject}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-[#b8a4d4]/10 to-[#d4e8f4]/10 rounded-2xl p-6 border border-[#b8a4d4]/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#b8a4d4]/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#b8a4d4]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Recommendations</h2>
              <p className="text-sm text-muted-foreground">Personalized for you</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#b8a4d4] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Best time to meet with study group</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on everyone's schedule, tomorrow at 5 PM works best for all 4 members.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f4b8d0] flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">You're on track for a personal best!</h4>
                  <p className="text-sm text-muted-foreground">
                    Keep it up! 3 more days to beat your longest study streak of 14 days.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#d4e8f4] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-[#d4e8f4]" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Review ML notes before Monday's exam</h4>
                  <p className="text-sm text-muted-foreground">
                    Sarah's neural networks notes from Week 5 might be helpful. Check them out!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
