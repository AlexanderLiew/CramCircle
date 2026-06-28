import { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  Plus,
  Folder,
  FileText,
  Image,
  Paperclip,
  MessageCircle,
  Heart,
  ThumbsUp,
  Share2,
  MoreVertical,
  Clock,
  User,
  Search,
  Upload,
  FileIcon,
  X,
  Download,
  Eye,
} from "lucide-react";

const folders = [
  { id: 1, name: "Computer Science", color: "#b8a4d4", noteCount: 24 },
  { id: 2, name: "Mathematics", color: "#d4e8f4", noteCount: 18 },
  { id: 3, name: "Machine Learning", color: "#f4b8d0", noteCount: 12 },
  { id: 4, name: "Physics", color: "#fef4d4", noteCount: 8 },
];

type Attachment = {
  id: string;
  name: string;
  type: "pdf" | "doc" | "image" | "other";
  size: string;
};

const notes = [
  {
    id: 1,
    title: "Neural Networks - Week 5",
    folder: "Machine Learning",
    author: "Sarah Chen",
    lastEdited: "2 hours ago",
    shared: true,
    comments: 5,
    reactions: { likes: 12, hearts: 3 },
    preview: "Introduction to backpropagation and gradient descent...",
    color: "#f4b8d0",
    attachments: [
      { id: "a1", name: "lecture_slides_w5.pdf", type: "pdf" as const, size: "2.4 MB" },
      { id: "a2", name: "backprop_notes.docx", type: "doc" as const, size: "340 KB" },
    ],
  },
  {
    id: 2,
    title: "Data Structures Cheat Sheet",
    folder: "Computer Science",
    author: "You",
    lastEdited: "1 day ago",
    shared: true,
    comments: 8,
    reactions: { likes: 24, hearts: 8 },
    preview: "Quick reference for arrays, linked lists, trees, graphs...",
    color: "#b8a4d4",
    attachments: [
      { id: "a3", name: "ds_cheatsheet.pdf", type: "pdf" as const, size: "1.1 MB" },
    ],
  },
  {
    id: 3,
    title: "Calculus Integration Techniques",
    folder: "Mathematics",
    author: "Jake Park",
    lastEdited: "3 days ago",
    shared: true,
    comments: 3,
    reactions: { likes: 15, hearts: 2 },
    preview: "U-substitution, integration by parts, partial fractions...",
    color: "#d4e8f4",
    attachments: [],
  },
  {
    id: 4,
    title: "Quantum Physics Notes",
    folder: "Physics",
    author: "Maya Patel",
    lastEdited: "5 days ago",
    shared: false,
    comments: 1,
    reactions: { likes: 6, hearts: 1 },
    preview: "Wave-particle duality and Heisenberg's uncertainty principle...",
    color: "#fef4d4",
    attachments: [
      { id: "a4", name: "quantum_lecture.pdf", type: "pdf" as const, size: "5.2 MB" },
      { id: "a5", name: "problem_set_3.docx", type: "doc" as const, size: "220 KB" },
    ],
  },
];

const recentComments = [
  { id: 1, user: "Sarah Chen", note: "Neural Networks - Week 5", text: "Great explanation of backprop!", time: "10 min ago", avatar: "SC" },
  { id: 2, user: "Jake Park", note: "Data Structures Cheat Sheet", text: "Can you add examples for B-trees?", time: "1 hour ago", avatar: "JP" },
];

function fileTypeColor(type: Attachment["type"]) {
  if (type === "pdf") return { bg: "#f4b8d0", text: "#c05880" };
  if (type === "doc") return { bg: "#d4e8f4", text: "#3a7abf" };
  if (type === "image") return { bg: "#d4f4e8", text: "#2a8a5a" };
  return { bg: "#f0e6f6", text: "#7a5aaa" };
}

function fileTypeLabel(type: Attachment["type"]) {
  if (type === "pdf") return "PDF";
  if (type === "doc") return "DOC";
  if (type === "image") return "IMG";
  return "FILE";
}

function AttachmentChip({ att, onRemove }: { att: Attachment; onRemove?: () => void }) {
  const col = fileTypeColor(att.type);
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card/60">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
        style={{ backgroundColor: col.bg, color: col.text }}
      >
        {fileTypeLabel(att.type)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate max-w-[120px]">{att.name}</p>
        <p className="text-[10px] text-muted-foreground">{att.size}</p>
      </div>
      <div className="flex items-center gap-1 ml-1">
        <button className="p-1 rounded hover:bg-accent transition-colors">
          <Download className="w-3 h-3 text-muted-foreground" />
        </button>
        {onRemove && (
          <button onClick={onRemove} className="p-1 rounded hover:bg-accent transition-colors">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

function detectFileType(file: File): Attachment["type"] {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.includes("word") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) return "doc";
  if (file.type.startsWith("image/")) return "image";
  return "other";
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Notes() {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editorAttachments, setEditorAttachments] = useState<Attachment[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNoteWithAttachments = (note: any) => {
    setSelectedNote(note);
    setEditorAttachments([...(note.attachments || [])]);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const accepted = files.filter(f =>
      f.type === "application/pdf" ||
      f.type.includes("word") ||
      f.name.endsWith(".docx") ||
      f.name.endsWith(".doc") ||
      f.type.startsWith("image/")
    );
    const newAtts: Attachment[] = accepted.map(f => ({
      id: `${Date.now()}-${Math.random()}`,
      name: f.name,
      type: detectFileType(f),
      size: formatBytes(f.size),
    }));
    setEditorAttachments(prev => [...prev, ...newAtts]);
  };

  const removeAttachment = (id: string) => {
    setEditorAttachments(prev => prev.filter(a => a.id !== id));
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6 max-w-7xl mx-auto h-[calc(100vh-120px)]">
      {/* Sidebar — Folders */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card rounded-2xl border border-border p-4 flex flex-col overflow-hidden"
      >
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            Folders
          </h2>
          <button className="w-full py-2 px-3 rounded-xl bg-primary text-primary-foreground hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            New Folder
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between ${
              selectedFolder === null
                ? "bg-primary text-primary-foreground shadow-lg"
                : "hover:bg-accent"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span className="font-medium">All Notes</span>
            </div>
            <span className="text-sm opacity-70">{notes.length}</span>
          </button>

          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full p-3 rounded-xl text-left transition-all ${
                selectedFolder === folder.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "hover:bg-accent"
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: folder.color }}></div>
                <span className="font-medium">{folder.name}</span>
              </div>
              <div className="text-xs opacity-70 ml-6">{folder.noteCount} notes</div>
            </button>
          ))}
        </div>

        {/* Recent Comments */}
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {recentComments.map((comment) => (
              <div key={comment.id} className="p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-[#d4f4e8] text-[10px] flex items-center justify-center">
                    {comment.avatar}
                  </div>
                  <span className="text-xs font-medium">{comment.user}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-col overflow-hidden">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Notes</h1>
              <p className="text-muted-foreground">
                {selectedFolder === null
                  ? "All your notes"
                  : folders.find((f) => f.id === selectedFolder)?.name}
              </p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:shadow-lg transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
            />
          </div>
        </motion.div>

        {/* Notes Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => openNoteWithAttachments(note)}
                className="bg-card rounded-2xl border border-border p-5 cursor-pointer hover:shadow-xl hover:shadow-primary/5 transition-all"
                style={{ borderLeft: `4px solid ${note.color}` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{note.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{note.author}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{note.lastEdited}</span>
                    </div>
                  </div>
                  <button className="p-1 rounded-lg hover:bg-accent transition-colors" onClick={e => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{note.preview}</p>

                {/* Attachment previews */}
                {note.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.attachments.map(att => {
                      const col = fileTypeColor(att.type);
                      return (
                        <div
                          key={att.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium"
                          style={{ backgroundColor: col.bg + "40", color: col.text }}
                        >
                          <FileIcon className="w-3 h-3" />
                          {att.name.length > 16 ? att.name.slice(0, 14) + "…" : att.name}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm">
                      <ThumbsUp className="w-4 h-4 text-[#b8a4d4]" />
                      <span>{note.reactions.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Heart className="w-4 h-4 text-[#f4b8d0]" />
                      <span>{note.reactions.hearts}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <MessageCircle className="w-4 h-4 text-[#d4e8f4]" />
                      <span>{note.comments}</span>
                    </div>
                  </div>
                  {note.shared && (
                    <div className="flex items-center gap-1 text-xs text-[#2a8a5a] bg-[#d4f4e8]/40 px-2 py-1 rounded-lg">
                      <Share2 className="w-3 h-3" />
                      <span>Shared</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Note Editor Modal */}
      {selectedNote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-8"
          onClick={() => setSelectedNote(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Editor Header */}
            <div className="p-6 border-b border-border">
              <input
                type="text"
                defaultValue={selectedNote.title}
                className="text-2xl font-bold w-full bg-transparent border-none outline-none mb-3"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors text-sm border border-border"
                >
                  <Upload className="w-4 h-4 text-[#f4b8d0]" />
                  Upload PDF / Doc
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors text-sm border border-border">
                  <Image className="w-4 h-4 text-[#d4e8f4]" />
                  Image
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors text-sm border border-border">
                  <Paperclip className="w-4 h-4 text-[#b8a4d4]" />
                  Attach
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors text-sm border border-border">
                  <MessageCircle className="w-4 h-4 text-[#d4f4e8]" />
                  Comment
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors text-sm border border-border">
                  <Eye className="w-4 h-4 text-[#fef4d4]" />
                  Preview
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="min-h-[200px] p-4 rounded-xl bg-accent/20 border-2 border-dashed border-border">
                <p>{selectedNote.preview}</p>
                <p className="text-muted-foreground text-sm mt-4">Start typing or use "/" for commands...</p>
              </div>

              {/* File drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDraggingOver
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-accent/30"
                }`}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Drop PDFs, Word docs, or images here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse — shared with your study group</p>
              </div>

              {/* Attachments list */}
              {editorAttachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Shared Files ({editorAttachments.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {editorAttachments.map(att => (
                      <AttachmentChip
                        key={att.id}
                        att={att}
                        onRemove={() => removeAttachment(att.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Editor Footer */}
            <div className="p-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Edited by {selectedNote.author} {selectedNote.lastEdited}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="px-4 py-2 rounded-xl hover:bg-accent transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:shadow-lg transition-all">
                  Save & Share
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
