import { useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Send, 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  Coffee,
  BookOpen,
  Target,
  TrendingUp,
} from "lucide-react";

const suggestedQuestions = [
  "When can all 4 of us meet this week?",
  "Best time to study for ML exam?",
  "Schedule a 2-hour study session",
  "Plan my study breaks for today",
];

const chatHistory = [
  {
    id: 1,
    type: 'user',
    message: "When is the best time for our group to meet this week?",
    time: "2:30 PM",
  },
  {
    id: 2,
    type: 'ai',
    message: "I've checked everyone's timetable! Here are the best options:",
    time: "2:30 PM",
    suggestions: [
      {
        title: "Tomorrow (Saturday) at 5:00 PM",
        duration: "2-3 hours",
        location: "Library Study Room B",
        availability: "All 4 members free",
        color: "#b8a4d4",
        pros: ["Everyone available", "Quiet location", "Right after Jake's class"],
      },
      {
        title: "Sunday at 2:00 PM",
        duration: "2-3 hours",
        location: "Student Center",
        availability: "All 4 members free",
        color: "#d4e8f4",
        pros: ["Weekend relaxed vibe", "Food court nearby", "Long time slot available"],
      },
    ],
  },
  {
    id: 3,
    type: 'user',
    message: "Create a study plan for my ML exam next Monday",
    time: "2:35 PM",
  },
  {
    id: 4,
    type: 'ai',
    message: "I've created a personalized study plan based on your schedule and the exam topics:",
    time: "2:35 PM",
    studyPlan: {
      days: [
        {
          day: "Today (Friday)",
          tasks: [
            { topic: "Neural Networks Review", duration: "2 hours", time: "7:00 PM - 9:00 PM", completed: false },
            { topic: "Practice Problems Set 1", duration: "1 hour", time: "9:15 PM - 10:15 PM", completed: false },
          ],
        },
        {
          day: "Saturday",
          tasks: [
            { topic: "Backpropagation Deep Dive", duration: "2.5 hours", time: "10:00 AM - 12:30 PM", completed: false },
            { topic: "Review Sarah's Notes", duration: "1 hour", time: "3:00 PM - 4:00 PM", completed: false },
          ],
        },
        {
          day: "Sunday",
          tasks: [
            { topic: "Practice Exam", duration: "2 hours", time: "2:00 PM - 4:00 PM", completed: false },
            { topic: "Review Weak Areas", duration: "1.5 hours", time: "5:00 PM - 6:30 PM", completed: false },
          ],
        },
      ],
    },
  },
];

export function AIPlanner() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(chatHistory);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages([...messages, {
      id: messages.length + 1,
      type: 'user',
      message: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setMessage("");
  };

  return (
    <div className="grid grid-cols-[1fr_320px] gap-6 max-w-7xl mx-auto h-[calc(100vh-120px)]">
      {/* Chat Area */}
      <div className="flex flex-col bg-card rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-[#b8a4d4]/10 to-[#f4b8d0]/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#b8a4d4] to-[#f4b8d0] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Study Planner</h1>
              <p className="text-sm text-muted-foreground">Your smart scheduling assistant</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'user' ? (
                <div className="max-w-[70%]">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-5 py-3">
                    <p>{msg.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">{msg.time}</p>
                </div>
              ) : (
                <div className="max-w-[85%]">
                  <div className="bg-accent/50 rounded-2xl rounded-tl-sm px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">AI Assistant</span>
                    </div>
                    <p className="mb-4">{msg.message}</p>

                    {/* Meeting Suggestions */}
                    {msg.suggestions && (
                      <div className="space-y-3 mt-4">
                        {msg.suggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="bg-card rounded-xl p-4 border border-border hover:shadow-lg transition-all cursor-pointer"
                            style={{ borderLeft: `4px solid ${suggestion.color}` }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold mb-1">{suggestion.title}</h4>
                                <p className="text-sm text-muted-foreground">{suggestion.duration}</p>
                              </div>
                              <div 
                                className="px-3 py-1 rounded-lg text-xs"
                                style={{ 
                                  backgroundColor: `${suggestion.color}20`,
                                  color: suggestion.color 
                                }}
                              >
                                Recommended
                              </div>
                            </div>

                            <div className="space-y-2 mb-3">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{suggestion.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{suggestion.availability}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {suggestion.pros.map((pro, i) => (
                                <span 
                                  key={i}
                                  className="text-xs px-2 py-1 rounded-lg bg-accent"
                                >
                                  ✓ {pro}
                                </span>
                              ))}
                            </div>

                            <button 
                              className="w-full mt-3 py-2 rounded-lg transition-all hover:shadow-md"
                              style={{ 
                                backgroundColor: suggestion.color,
                                color: '#ffffff'
                              }}
                            >
                              Schedule This Meeting
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Study Plan */}
                    {msg.studyPlan && (
                      <div className="space-y-4 mt-4">
                        {msg.studyPlan.days.map((day, dayIdx) => (
                          <div
                            key={dayIdx}
                            className="bg-card rounded-xl p-4 border border-border"
                          >
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary" />
                              {day.day}
                            </h4>
                            <div className="space-y-2">
                              {day.tasks.map((task, taskIdx) => (
                                <div
                                  key={taskIdx}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={task.completed}
                                    className="w-5 h-5 rounded-md border-2 border-primary cursor-pointer"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium">{task.topic}</p>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {task.duration}
                                      </span>
                                      <span>{task.time}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground hover:shadow-lg transition-all">
                          Add to My Timetable
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-accent/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about scheduling, study plans, or breaks..."
              className="flex-1 px-4 py-3 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
            />
            <button
              onClick={handleSend}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Suggested Questions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-2xl border border-border p-5"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Try asking...
          </h3>
          <div className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setMessage(question)}
                className="w-full p-3 text-sm text-left rounded-xl bg-accent/50 hover:bg-accent transition-all"
              >
                {question}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-5"
        >
          <h3 className="font-semibold mb-4">Today's Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#b8a4d4]/10">
              <div className="w-10 h-10 rounded-lg bg-[#b8a4d4]/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#b8a4d4]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classes</p>
                <p className="font-semibold">3 scheduled</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#d4e8f4]/10">
              <div className="w-10 h-10 rounded-lg bg-[#d4e8f4]/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#d4e8f4]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Goal</p>
                <p className="font-semibold">4.5 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#d4f4e8]/10">
              <div className="w-10 h-10 rounded-lg bg-[#d4f4e8]/20 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-[#d4f4e8]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Breaks</p>
                <p className="font-semibold">5 planned</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Tips */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#f4b8d0]/20 to-[#b8a4d4]/20 rounded-2xl border border-[#f4b8d0]/30 p-5"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#f4b8d0]" />
            Smart Tip
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Your focus is best between 10 AM - 12 PM based on your productivity patterns. Schedule important study sessions during this time!
          </p>
          <div className="text-xs text-[#f4b8d0]">Based on 2 weeks of data</div>
        </motion.div>
      </div>
    </div>
  );
}
