import { useState } from "react";
import { motion } from "motion/react";
import { 
  MessageSquare, 
  Hash, 
  Send, 
  Smile, 
  Paperclip, 
  Plus,
  Pin,
  Search,
  Users,
  Calendar,
  BarChart,
  Image as ImageIcon,
  FileText,
  ThumbsUp,
  Heart,
  Reply,
  MoreVertical,
  Video,
  Phone,
} from "lucide-react";

const channels = [
  { id: 1, name: "general", type: "text", unread: 0, color: "#b8a4d4" },
  { id: 2, name: "machine-learning", type: "text", unread: 3, color: "#f4b8d0" },
  { id: 3, name: "data-structures", type: "text", unread: 0, color: "#d4e8f4" },
  { id: 4, name: "calculus-help", type: "text", unread: 7, color: "#fef4d4" },
  { id: 5, name: "study-sessions", type: "text", unread: 1, color: "#d4f4e8" },
];

const messages = [
  {
    id: 1,
    user: "Sarah Chen",
    avatar: "SC",
    color: "#d4f4e8",
    message: "Hey everyone! Just uploaded my neural networks notes from today's lecture 📚",
    time: "10:30 AM",
    reactions: { thumbsUp: 5, heart: 2 },
    hasAttachment: true,
    attachmentType: "pdf",
    attachmentName: "Neural_Networks_Week5.pdf",
  },
  {
    id: 2,
    user: "Jake Park",
    avatar: "JP",
    color: "#d4e8f4",
    message: "Thanks Sarah! This is super helpful. Are we still meeting at 5 PM tomorrow?",
    time: "10:35 AM",
    reactions: { thumbsUp: 2 },
    replyTo: 1,
  },
  {
    id: 3,
    user: "You",
    avatar: "EW",
    color: "#b8a4d4",
    message: "Yes! Library study room B is booked. I'll bring snacks 🍪",
    time: "10:40 AM",
    reactions: { heart: 4, thumbsUp: 3 },
  },
  {
    id: 4,
    user: "Maya Patel",
    avatar: "MP",
    color: "#fef4d4",
    message: "Count me in! Also, does anyone have the practice problems from last week?",
    time: "10:42 AM",
    reactions: {},
  },
  {
    id: 5,
    user: "Alex Kim",
    avatar: "AK",
    color: "#f0e6f6",
    message: "I have them! Give me a sec to upload",
    time: "10:43 AM",
    isTyping: false,
    reactions: { thumbsUp: 1 },
  },
];

const pinnedMessages = [
  {
    id: 1,
    user: "Sarah Chen",
    message: "Exam schedule: ML - June 30, Data Structures - July 3, Calculus - July 5",
    time: "3 days ago",
  },
  {
    id: 2,
    user: "Jake Park",
    message: "Study group meets every Tuesday and Thursday at 5 PM",
    time: "1 week ago",
  },
];

const onlineMembers = [
  { id: 1, name: "Sarah Chen", avatar: "SC", status: "studying", color: "#d4f4e8" },
  { id: 2, name: "Jake Park", avatar: "JP", status: "in class", color: "#d4e8f4" },
  { id: 3, name: "Maya Patel", avatar: "MP", status: "online", color: "#fef4d4" },
  { id: 4, name: "You", avatar: "EW", status: "online", color: "#b8a4d4" },
];

export function GroupChat() {
  const [selectedChannel, setSelectedChannel] = useState(channels[1]);
  const [message, setMessage] = useState("");
  const [showPinned, setShowPinned] = useState(false);
  const [typingUsers, setTypingUsers] = useState(["Alex Kim"]);

  return (
    <div className="grid grid-cols-[260px_1fr_280px] gap-0 max-w-7xl mx-auto h-[calc(100vh-120px)] bg-card rounded-2xl border border-border overflow-hidden">
      {/* Channels Sidebar */}
      <div className="bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Server Header */}
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#b8a4d4] to-[#f4b8d0] flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            Study Group
          </h2>
          <p className="text-xs text-muted-foreground mt-1">CS 2026 Cohort</p>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">
            Channels
          </div>
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                selectedChannel.id === channel.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" style={{ color: channel.color }} />
                <span className="text-sm">{channel.name}</span>
              </div>
              {channel.unread > 0 && (
                <span 
                  className="text-xs px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: channel.color }}
                >
                  {channel.unread}
                </span>
              )}
            </button>
          ))}

          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-all text-sm text-muted-foreground">
            <Plus className="w-4 h-4" />
            Add Channel
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-all text-sm">
            <Calendar className="w-4 h-4" />
            Schedule Session
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-all text-sm">
            <BarChart className="w-4 h-4" />
            Create Poll
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col bg-background">
        {/* Channel Header */}
        <div className="h-14 border-b border-border px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5" style={{ color: selectedChannel.color }} />
            <div>
              <h3 className="font-semibold">{selectedChannel.name}</h3>
              <p className="text-xs text-muted-foreground">4 members online</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPinned(!showPinned)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Pin className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-accent transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-accent transition-colors">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-accent transition-colors">
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pinned Messages */}
        {showPinned && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-b border-border bg-accent/30 p-4"
          >
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Pin className="w-4 h-4" />
              Pinned Messages
            </h4>
            <div className="space-y-2">
              {pinnedMessages.map((msg) => (
                <div key={msg.id} className="p-2 bg-card rounded-lg text-sm">
                  <span className="font-medium">{msg.user}:</span> {msg.message}
                  <span className="text-xs text-muted-foreground ml-2">{msg.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-3 hover:bg-accent/20 -mx-4 px-4 py-2 rounded-lg transition-colors group"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-medium flex-shrink-0"
                style={{ backgroundColor: msg.color }}
              >
                {msg.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold">{msg.user}</span>
                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>

                {msg.replyTo && (
                  <div className="mb-2 pl-3 border-l-2 border-muted py-1">
                    <p className="text-xs text-muted-foreground">
                      Replying to {messages.find(m => m.id === msg.replyTo)?.user}
                    </p>
                  </div>
                )}

                <p className="text-sm mb-2">{msg.message}</p>

                {msg.hasAttachment && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50 border border-border max-w-sm mb-2">
                    <div className="w-10 h-10 rounded-lg bg-[#f4b8d0]/30 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#f4b8d0]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{msg.attachmentName}</p>
                      <p className="text-xs text-muted-foreground">2.4 MB • PDF</p>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-accent transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {Object.entries(msg.reactions).map(([reaction, count]) => (
                    <button
                      key={reaction}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/50 hover:bg-accent transition-colors text-xs"
                    >
                      {reaction === 'thumbsUp' && <ThumbsUp className="w-3 h-3" />}
                      {reaction === 'heart' && <Heart className="w-3 h-3" />}
                      <span>{count}</span>
                    </button>
                  ))}
                  <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-accent transition-all text-xs flex items-center gap-1">
                    <Smile className="w-3 h-3" />
                  </button>
                  <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-accent transition-all text-xs flex items-center gap-1">
                    <Reply className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-input-background border border-border rounded-xl overflow-hidden">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Message #${selectedChannel.name}`}
                rows={1}
                className="w-full px-4 py-3 bg-transparent border-none outline-none resize-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // Send message logic
                  }
                }}
              />
              <div className="flex items-center gap-2 px-4 pb-3">
                <button className="p-1 rounded-lg hover:bg-accent transition-colors">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-1 rounded-lg hover:bg-accent transition-colors">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-1 rounded-lg hover:bg-accent transition-colors">
                  <Smile className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <button className="p-3 rounded-xl bg-primary text-primary-foreground hover:shadow-lg transition-all">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Members Sidebar */}
      <div className="bg-sidebar border-l border-sidebar-border p-4 overflow-y-auto">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Members ({onlineMembers.length})
        </h3>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Online — {onlineMembers.length}
          </div>
          {onlineMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer"
            >
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ backgroundColor: member.color }}
                >
                  {member.avatar}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-sidebar"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Create Study Session */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#b8a4d4]/20 to-[#f4b8d0]/20 border border-[#b8a4d4]/30">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Quick Session
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            Create a study session with this group
          </p>
          <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:shadow-md transition-all">
            Create Session
          </button>
        </div>

        {/* Shared Resources */}
        <div className="mt-4">
          <h4 className="font-semibold mb-3 text-sm">Shared Resources</h4>
          <div className="space-y-2">
            {[
              { name: "Exam Schedule.pdf", type: "PDF", color: "#f4b8d0" },
              { name: "Study Guide.docx", type: "DOC", color: "#d4e8f4" },
              { name: "Notes_Week5.pdf", type: "PDF", color: "#d4f4e8" },
            ].map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${file.color}30` }}
                >
                  <FileText className="w-4 h-4" style={{ color: file.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
