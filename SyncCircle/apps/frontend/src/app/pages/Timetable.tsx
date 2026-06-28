import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Calendar, ChevronLeft, ChevronRight, Users, Filter, Plus, MapPin, Upload, X, Check, AlertCircle } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM",
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type ClassItem = {
  id: number;
  name: string;
  day: number;
  startTime: number;
  duration: number;
  room: string;
  professor: string;
  color: string;
  friends: string[];
  source?: "personal" | "imported";
};

type ImportedClassItem = Partial<ClassItem> & {
  _removed?: boolean;
};

const initialClasses: ClassItem[] = [
  { id: 1, name: "Data Structures", day: 0, startTime: 2, duration: 2, room: "CS-201", professor: "Dr. Smith", color: "#b8a4d4", friends: ["Sarah Chen", "Jake Park"] },
  { id: 2, name: "Calculus II", day: 0, startTime: 6, duration: 1, room: "MATH-104", professor: "Dr. Johnson", color: "#d4e8f4", friends: ["Maya Patel"] },
  { id: 3, name: "Machine Learning", day: 1, startTime: 3, duration: 2, room: "CS-305", professor: "Dr. Lee", color: "#f4b8d0", friends: ["Sarah Chen", "Alex Kim"] },
  { id: 4, name: "Database Systems", day: 2, startTime: 1, duration: 2, room: "CS-202", professor: "Dr. Williams", color: "#d4f4e8", friends: ["Jake Park"] },
  { id: 5, name: "Data Structures Lab", day: 3, startTime: 4, duration: 2, room: "CS-Lab-1", professor: "TA: Emma Davis", color: "#b8a4d4", friends: ["Sarah Chen", "Jake Park", "Maya Patel"] },
  { id: 6, name: "Physics II", day: 4, startTime: 2, duration: 1, room: "PHY-101", professor: "Dr. Brown", color: "#fef4d4", friends: [] },
];

// Friend schedules for availability overlay
const friendSchedules: Record<string, number[][]> = {
  "Sarah Chen": [[0, 2], [0, 3], [1, 3], [1, 4], [3, 4], [3, 5]],
  "Jake Park": [[0, 2], [0, 3], [2, 1], [2, 2], [3, 4], [3, 5]],
  "Maya Patel": [[0, 6], [1, 3], [1, 4]],
  "Alex Kim": [[1, 3], [1, 4], [4, 5], [4, 6]],
};

// Compute which days ALL friends are free (no scheduled class for any friend)
function computeFreeDays(friendSched: Record<string, number[][]>): Set<number> {
  const busyDays = new Set<number>();
  Object.values(friendSched).forEach(slots => {
    slots.forEach(([day]) => busyDays.add(day));
  });
  return new Set([0, 1, 2, 3, 4].filter(d => !busyDays.has(d)));
}

// Minimal ICS parser — extracts VEVENT blocks
function parseICS(text: string): ImportedClassItem[] {
  const events: ImportedClassItem[] = [];
  const blocks = text.split("BEGIN:VEVENT");
  blocks.slice(1).forEach((block, idx) => {
    const get = (key: string) => {
      const m = block.match(new RegExp(`${key}[^:]*:([^\r\n]+)`));
      return m ? m[1].trim() : "";
    };
    const summary = get("SUMMARY");
    const location = get("LOCATION");
    const dtstart = get("DTSTART");
    // Parse day-of-week from DTSTART (YYYYMMDD or YYYYMMDDTHHMMSSZ)
    let day = idx % 5;
    let startTime = 2;
    if (dtstart.length >= 8) {
      const dateStr = dtstart.slice(0, 8);
      const date = new Date(`${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`);
      if (!isNaN(date.getTime())) {
        const dow = date.getDay(); // 0=Sun, 1=Mon...
        day = Math.max(0, Math.min(4, dow - 1));
      }
      if (dtstart.length >= 13) {
        const hour = parseInt(dtstart.slice(9, 11), 10);
        startTime = Math.max(0, Math.min(10, hour - 8));
      }
    }
    if (summary) {
      events.push({
        id: Date.now() + idx,
        name: summary,
        day,
        startTime,
        duration: 1,
        room: location || "TBA",
        professor: "TBA",
        color: ["#b8a4d4", "#d4e8f4", "#f4b8d0", "#d4f4e8", "#fef4d4", "#ffd4c8"][idx % 6],
        friends: [],
        source: "imported",
      });
    }
  });
  return events;
}

function ClassCard({ classItem }: { classItem: ClassItem }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "class",
    item: classItem,
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  return (
    <motion.div
      ref={drag as any}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      className="p-3 rounded-xl shadow-md cursor-move hover:shadow-lg transition-all h-full"
      style={{ backgroundColor: classItem.color, color: "#fff" }}
    >
      <h4 className="font-semibold mb-1 text-sm leading-tight">{classItem.name}</h4>
      <div className="flex items-center gap-1 text-xs opacity-90 mb-1">
        <MapPin className="w-3 h-3" />
        {classItem.room}
      </div>
      {classItem.friends.length > 0 && (
        <div className="flex items-center gap-1 mt-auto">
          <Users className="w-3 h-3" />
          <span className="text-xs">{classItem.friends.length}</span>
        </div>
      )}
      {classItem.source === "imported" && (
        <div className="mt-1 text-[10px] bg-white/20 rounded px-1 inline-block">imported</div>
      )}
    </motion.div>
  );
}

function TimeSlot({ day, time, onDrop, isFreeDay }: { day: number; time: number; onDrop: (item: any) => void; isFreeDay: boolean }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "class",
    drop: (item: any) => onDrop(item),
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  return (
    <div
      ref={drop as any}
      className={`border border-border/30 rounded-lg transition-colors min-h-[52px] ${
        isOver ? "bg-primary/10" : isFreeDay ? "" : "hover:bg-accent/30"
      }`}
      style={isFreeDay ? { backgroundColor: "rgba(180, 240, 200, 0.25)" } : {}}
    />
  );
}

export function Timetable() {
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [view, setView] = useState<"week" | "month">("week");
  const [showFriendOverlay, setShowFriendOverlay] = useState(false);
  const [importedClasses, setImportedClasses] = useState<ImportedClassItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmEdits, setConfirmEdits] = useState<ImportedClassItem[]>([]);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const freeDays = computeFreeDays(friendSchedules);

  const handleDrop = (item: ClassItem, newDay: number, newTime: number) => {
    setClasses(prev => prev.map(c => c.id === item.id ? { ...c, day: newDay, startTime: newTime } : c));
  };

  const handleICSFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".ics")) {
      setImportError("Please upload a valid .ics calendar file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseICS(text);
      if (parsed.length === 0) {
        setImportError("No events found in this .ics file.");
        return;
      }
      setImportedClasses(parsed);
      setConfirmEdits(parsed.map(p => ({ ...p })));
      setShowConfirm(true);
      setImportError("");
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const toAdd: ClassItem[] = confirmEdits
      .filter(e => !e._removed)
      .map((e, i) => ({
        id: Date.now() + i,
        name: e.name || "Untitled",
        day: e.day ?? 0,
        startTime: e.startTime ?? 2,
        duration: e.duration ?? 1,
        room: e.room || "TBA",
        professor: e.professor || "TBA",
        color: e.color || "#b8a4d4",
        friends: [],
        source: "imported" as const,
      }));
    setClasses(prev => [...prev, ...toAdd]);
    setShowConfirm(false);
    setImportedClasses([]);
    setConfirmEdits([]);
  };

  const updateConfirmEdit = (idx: number, field: keyof ClassItem, value: any) => {
    setConfirmEdits(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const toggleRemoveConfirmEdit = (idx: number) => {
    setConfirmEdits(prev => prev.map((e, i) => i === idx ? { ...e, _removed: !e._removed } : e));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shared Timetable</h1>
            <p className="text-muted-foreground">Collaborative schedule with your study group</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFriendOverlay(!showFriendOverlay)}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                showFriendOverlay ? "bg-primary text-primary-foreground shadow-lg" : "bg-card border border-border hover:bg-accent"
              }`}
            >
              <Users className="w-4 h-4" />
              Friend Availability
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-card border border-border hover:bg-accent transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#b8a4d4]" />
              Import .ics
            </button>
            <input ref={fileInputRef} type="file" accept=".ics" className="hidden" onChange={handleICSFile} />

            <button className="px-4 py-2 rounded-xl bg-card border border-border hover:bg-accent transition-all flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:shadow-lg transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Class
            </button>
          </div>
        </motion.div>

        {importError && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#f4b8d0]/20 border border-[#f4b8d0] text-sm text-[#c05870]">
            <AlertCircle className="w-4 h-4" />
            {importError}
          </div>
        )}

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
            {(["week", "month"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg transition-all capitalize ${
                  view === v ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-accent"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium">June 23 – June 27, 2026</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free day legend */}
        {freeDays.size > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 rounded bg-[rgba(180,240,200,0.4)] border border-[#a0d8b0]"></div>
            <span>Everyone free — {[...freeDays].map(d => days[d]).join(", ")}</span>
          </div>
        )}

        {/* Timetable Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-6 overflow-x-auto"
        >
          <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-3 min-w-[900px]">
            {/* Header Row */}
            <div></div>
            {days.map((day, index) => (
              <div key={day} className="text-center pb-3 relative">
                <div className="font-semibold">{day}</div>
                <div className="text-sm text-muted-foreground">Jun {23 + index}</div>
                {freeDays.has(index) && (
                  <div className="absolute -top-1 right-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#d4f4e8] text-[#2a8a5a]">
                    free ✓
                  </div>
                )}
              </div>
            ))}

            {/* Time Slots */}
            {timeSlots.map((time, timeIndex) => (
              <div key={time} className="contents">
                <div className="flex items-start justify-end pr-3 text-sm text-muted-foreground pt-2">{time}</div>
                {days.map((_, dayIndex) => {
                  const classInSlot = classes.find(c => c.day === dayIndex && c.startTime === timeIndex);
                  const isFreeDay = freeDays.has(dayIndex);
                  return (
                    <div key={`${dayIndex}-${timeIndex}`} className="relative">
                      {classInSlot ? (
                        <ClassCard classItem={classInSlot} />
                      ) : (
                        <TimeSlot
                          day={dayIndex}
                          time={timeIndex}
                          isFreeDay={isFreeDay}
                          onDrop={(item) => handleDrop(item, dayIndex, timeIndex)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Friend Availability Panel */}
        {showFriendOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#d4f4e8]/20 to-[#d4e8f4]/20 rounded-2xl border border-[#d4f4e8]/50 p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2a8a5a]" />
              Friend Availability
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(friendSchedules).map(([friend], index) => (
                <div key={friend} className="p-4 bg-white/70 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: ["#d4f4e8", "#d4e8f4", "#fef4d4", "#f0e6f6"][index] }}
                    >
                      {friend.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="font-medium text-sm">{friend}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Free: Mon 12–2 pm, Wed 3–5 pm</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Module Color Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h3 className="font-semibold mb-4">Module Colors</h3>
          <div className="flex flex-wrap gap-3">
            {Array.from(new Set(classes.map(c => c.name))).map(name => {
              const cls = classes.find(c => c.name === name);
              return (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: cls?.color }}></div>
                  <span className="text-sm">{name}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ICS Import Confirmation Modal */}
      {showConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold mb-1">Review Imported Schedule</h2>
              <p className="text-sm text-muted-foreground">
                {confirmEdits.filter(e => !(e as any)._removed).length} of {confirmEdits.length} classes will be added to the shared calendar.
                Make any edits before confirming.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {confirmEdits.map((evt, idx) => {
                const removed = (evt as any)._removed;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      removed
                        ? "border-border opacity-40 line-through bg-muted/20"
                        : "border-border bg-accent/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-4 h-4 rounded mt-1 flex-shrink-0"
                        style={{ backgroundColor: evt.color }}
                      />
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Class Name</label>
                          <input
                            value={evt.name || ""}
                            onChange={e => updateConfirmEdit(idx, "name", e.target.value)}
                            disabled={removed}
                            className="w-full text-sm font-medium bg-transparent border-b border-border/50 focus:outline-none focus:border-primary py-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Room / Location</label>
                          <input
                            value={evt.room || ""}
                            onChange={e => updateConfirmEdit(idx, "room", e.target.value)}
                            disabled={removed}
                            className="w-full text-sm bg-transparent border-b border-border/50 focus:outline-none focus:border-primary py-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Day</label>
                          <select
                            value={evt.day}
                            onChange={e => updateConfirmEdit(idx, "day", Number(e.target.value))}
                            disabled={removed}
                            className="w-full text-sm bg-transparent border-b border-border/50 focus:outline-none focus:border-primary py-0.5"
                          >
                            {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Start Time</label>
                          <select
                            value={evt.startTime}
                            onChange={e => updateConfirmEdit(idx, "startTime", Number(e.target.value))}
                            disabled={removed}
                            className="w-full text-sm bg-transparent border-b border-border/50 focus:outline-none focus:border-primary py-0.5"
                          >
                            {timeSlots.map((t, i) => <option key={t} value={i}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleRemoveConfirmEdit(idx)}
                        className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${removed ? "text-[#2a8a5a] hover:bg-[#d4f4e8]/40" : "text-destructive hover:bg-destructive/10"}`}
                      >
                        {removed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-border flex items-center justify-between">
              <button
                onClick={() => { setShowConfirm(false); setConfirmEdits([]); }}
                className="px-4 py-2 rounded-xl hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Add to Shared Calendar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </DndProvider>
  );
}
