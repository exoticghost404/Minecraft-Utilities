import React, { useState, useEffect } from 'react';
import { ArrowLeft, Notebook, Plus, Trash2, Edit2, X, Save, Pin, Search, Palette, Check } from 'lucide-react';
import { Note } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface NotesViewProps {
  onBack: () => void;
}

const COLORS = [
  { id: 'zinc', label: 'Default', bg: 'bg-zinc-900', border: 'border-zinc-800', hover: 'hover:border-zinc-700', swatch: 'bg-zinc-600' },
  { id: 'red', label: 'Red', bg: 'bg-red-950/40', border: 'border-red-900/50', hover: 'hover:border-red-800/50', swatch: 'bg-red-500' },
  { id: 'orange', label: 'Orange', bg: 'bg-orange-950/40', border: 'border-orange-900/50', hover: 'hover:border-orange-800/50', swatch: 'bg-orange-500' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-950/40', border: 'border-amber-900/50', hover: 'hover:border-amber-800/50', swatch: 'bg-amber-500' },
  { id: 'green', label: 'Green', bg: 'bg-emerald-950/40', border: 'border-emerald-900/50', hover: 'hover:border-emerald-800/50', swatch: 'bg-emerald-500' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-950/40', border: 'border-blue-900/50', hover: 'hover:border-blue-800/50', swatch: 'bg-blue-500' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-950/40', border: 'border-purple-900/50', hover: 'hover:border-purple-800/50', swatch: 'bg-purple-500' },
  { id: 'pink', label: 'Pink', bg: 'bg-pink-950/40', border: 'border-pink-900/50', hover: 'hover:border-pink-800/50', swatch: 'bg-pink-500' },
];

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onPin: (note: Note, e: React.MouseEvent) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onPin, onDelete }) => {
    const colorTheme = COLORS.find(c => c.id === note.color) || COLORS[0];
    
    return (
      <div 
          onClick={() => onEdit(note)}
          className={`
              group relative ${colorTheme.bg} border ${colorTheme.border} ${colorTheme.hover} 
              rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer flex flex-col h-[220px]
          `}
      >
          <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-zinc-100 line-clamp-1 pr-8">{note.title}</h3>
              
              {/* Pin Indicator (always visible if pinned) */}
              {note.isPinned && (
                  <div className="absolute top-5 right-5 text-amber-400 rotate-45">
                      <Pin size={16} fill="currentColor" />
                  </div>
              )}
          </div>
          
          <p className="text-zinc-300 text-sm whitespace-pre-wrap line-clamp-5 flex-1 font-mono leading-relaxed opacity-90">
              {note.content}
          </p>
          
          <div className="flex items-end justify-between mt-4 pt-3 border-t border-white/5">
              <span className="text-[10px] text-zinc-500">
                  {new Date(note.updatedAt).toLocaleDateString()}
              </span>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                      onClick={(e) => onPin(note, e)}
                      className={`p-1.5 rounded hover:bg-white/10 ${note.isPinned ? 'text-amber-400' : 'text-zinc-400 hover:text-white'}`}
                      title={note.isPinned ? "Unpin" : "Pin"}
                  >
                      <Pin size={14} />
                  </button>
                  <button 
                      onClick={(e) => onDelete(note.id, e)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                      title="Delete"
                  >
                      <Trash2 size={14} />
                  </button>
              </div>
          </div>
      </div>
    );
};

export const NotesView: React.FC<NotesViewProps> = ({ onBack }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load notes
  useEffect(() => {
    const saved = localStorage.getItem('minecraft_notes_v2');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load notes", e);
      }
    }
  }, []);

  // Save notes
  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem('minecraft_notes_v2')) {
        localStorage.setItem('minecraft_notes_v2', JSON.stringify(notes));
    }
  }, [notes]);

  const handleSave = () => {
    if (!currentNote.title?.trim() && !currentNote.content?.trim()) return;

    if (currentNote.id) {
      // Update existing
      setNotes(prev => prev.map(n => n.id === currentNote.id ? { 
          ...n, 
          title: currentNote.title || '', 
          content: currentNote.content || '', 
          color: currentNote.color,
          isPinned: currentNote.isPinned,
          updatedAt: Date.now() 
      } : n));
    } else {
      // Create new
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: currentNote.title || 'Untitled',
        content: currentNote.content || '',
        updatedAt: Date.now(),
        color: currentNote.color || 'zinc',
        isPinned: currentNote.isPinned || false
      };
      setNotes(prev => [newNote, ...prev]);
    }
    closeEditor();
  };

  const requestDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
        setNotes(prev => prev.filter(n => n.id !== deleteId));
        setDeleteId(null);
    }
  };

  const openEditor = (note?: Note) => {
    setCurrentNote(note || { title: '', content: '', color: 'zinc', isPinned: false });
    setIsEditing(true);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setCurrentNote({});
  };

  const togglePin = (note: Note, e: React.MouseEvent) => {
      e.stopPropagation();
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isPinned: !n.isPinned } : n));
  };

  // Filter and Sort
  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Menu
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                    <Notebook className="text-blue-400" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        Notes
                    </h1>
                    <p className="text-xs text-zinc-400">Coordinates, To-Do lists, and Ideas</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3 flex-1 md:justify-end">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input 
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <button
                    onClick={() => openEditor()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-900/20 shrink-0"
                >
                    <Plus size={18} /> <span className="hidden sm:inline">New Note</span>
                </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                <Notebook size={48} className="mb-4 opacity-20" />
                <p>No notes yet. Create one to get started!</p>
            </div>
        ) : (
            <div className="space-y-8">
                {pinnedNotes.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Pin size={14} /> Pinned
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {pinnedNotes.map(note => (
                                <NoteCard 
                                    key={note.id} 
                                    note={note} 
                                    onEdit={openEditor} 
                                    onPin={togglePin} 
                                    onDelete={requestDelete} 
                                />
                            ))}
                        </div>
                    </section>
                )}

                {(otherNotes.length > 0 || pinnedNotes.length === 0) && (
                    <section>
                        {pinnedNotes.length > 0 && (
                            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Others</h2>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {otherNotes.map(note => (
                                <NoteCard 
                                    key={note.id} 
                                    note={note} 
                                    onEdit={openEditor} 
                                    onPin={togglePin} 
                                    onDelete={requestDelete} 
                                />
                            ))}
                        </div>
                        {otherNotes.length === 0 && searchQuery && (
                            <p className="text-zinc-500 italic">No matching notes found.</p>
                        )}
                    </section>
                )}
            </div>
        )}
      </main>

      {/* Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                    <input 
                        type="text" 
                        placeholder="Note Title"
                        className="bg-transparent text-xl font-bold text-zinc-100 placeholder-zinc-600 outline-none w-full"
                        value={currentNote.title}
                        onChange={e => setCurrentNote({...currentNote, title: e.target.value})}
                        autoFocus
                    />
                    <div className="flex items-center gap-2 ml-4">
                         <button 
                            onClick={() => setCurrentNote(prev => ({ ...prev, isPinned: !prev.isPinned }))}
                            className={`p-2 rounded-lg transition-colors ${currentNote.isPinned ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:bg-zinc-800'}`}
                            title="Pin Note"
                        >
                            <Pin size={20} fill={currentNote.isPinned ? "currentColor" : "none"} />
                        </button>
                        <button onClick={closeEditor} className="text-zinc-500 hover:text-zinc-300">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 p-0 bg-zinc-950 relative">
                    <textarea 
                        className="w-full h-full min-h-[400px] bg-transparent p-6 text-zinc-300 outline-none resize-none font-mono text-sm leading-relaxed placeholder-zinc-700"
                        placeholder="Start typing..."
                        value={currentNote.content}
                        onChange={e => setCurrentNote({...currentNote, content: e.target.value})}
                    />
                </div>

                <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Color Picker */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Color Label</span>
                        <div className="flex items-center gap-2 flex-wrap">
                            {COLORS.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setCurrentNote({...currentNote, color: c.id})}
                                    className={`
                                        w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center shrink-0
                                        ${c.swatch}
                                        ${currentNote.color === c.id 
                                            ? 'border-white scale-110 shadow-lg shadow-black/50' 
                                            : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}
                                    `}
                                    title={c.label}
                                >
                                    {currentNote.color === c.id && <Check size={14} className="text-white drop-shadow-md" strokeWidth={3} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4 sm:mt-0">
                        <button onClick={closeEditor} className="px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2">
                            <Save size={16} /> Save
                        </button>
                    </div>
                </div>
             </div>
        </div>
      )}

        <ConfirmationModal 
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={handleConfirmDelete}
            title="Delete Note"
            message="Are you sure you want to delete this note? This action cannot be undone."
            confirmText="Yes, Delete"
        />
    </div>
  );
};