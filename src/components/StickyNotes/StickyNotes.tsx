import { useState, useRef, useEffect, useCallback } from 'react';
import type { StickyNote, TodoItem, PomodoroState } from '../../types/settings';
import './StickyNotes.css';

interface StickyNotesProps {
  note: StickyNote | null;
  onNoteChange: (note: StickyNote | null) => void;
}

const FONT_OPTIONS = [
  { name: 'Mona Sans', value: '"Mona Sans", system-ui, sans-serif' },
  { name: 'System', value: 'system-ui, -apple-system, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Mono', value: 'ui-monospace, monospace' },
  { name: 'Cursive', value: 'cursive' },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24];

const NOTE_COLORS = [
  { name: 'primary', value: 'primary' },
  { name: 'secondary', value: 'secondary' },
  { name: 'accent', value: 'accent' },
  { name: 'surface', value: 'surface' },
];

const TEXT_COLORS = [
  { name: 'Light', value: 'rgba(255, 255, 255, 0.9)' },
  { name: 'Dark', value: 'rgba(0, 0, 0, 0.85)' },
  { name: 'Theme', value: 'var(--color-text)' },
];

const DEFAULT_POMODORO: PomodoroState = {
  isRunning: false,
  mode: 'work',
  timeLeft: 25 * 60,
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsCompleted: 0,
};

export const StickyNotes = ({ note, onNoteChange }: StickyNotesProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [newTodoText, setNewTodoText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Migrate existing notes to new format
  const migratedNote = note ? {
    ...note,
    mode: note.mode || 'notes',
    todos: note.todos || [],
    pomodoro: note.pomodoro || { ...DEFAULT_POMODORO },
  } as StickyNote : null;

  // Create note if it doesn't exist
  useEffect(() => {
    if (!note) {
      const newNote: StickyNote = {
        id: Date.now().toString(),
        content: '',
        position: { 
          x: Math.max(50, (window.innerWidth - 300) / 2),
          y: Math.max(50, (window.innerHeight - 250) / 2)
        },
        size: { width: 300, height: 300 },
        fontSize: 14,
        fontFamily: FONT_OPTIONS[0].value,
        color: NOTE_COLORS[0].value,
        textColor: TEXT_COLORS[2].value,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        mode: 'notes',
        todos: [],
        pomodoro: { ...DEFAULT_POMODORO },
      };
      onNoteChange(newNote);
    } else if (!note.pomodoro || !note.todos || !note.mode) {
      // Migrate old note to new format
      onNoteChange({
        ...note,
        mode: note.mode || 'notes',
        todos: note.todos || [],
        pomodoro: note.pomodoro || { ...DEFAULT_POMODORO },
      });
    }
  }, [note, onNoteChange]);

  // Handle dragging
  useEffect(() => {
    if (!migratedNote) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 100));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 100));

      onNoteChange({ ...migratedNote, position: { x: newX, y: newY } });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, migratedNote, onNoteChange]);

  // Memoized handlers
  const updateContent = useCallback((content: string) => {
    if (!migratedNote) return;
    onNoteChange({ ...migratedNote, content, updatedAt: Date.now() });
  }, [migratedNote, onNoteChange]);

  const updateFontSize = useCallback((fontSize: number) => {
    if (!migratedNote) return;
    onNoteChange({ ...migratedNote, fontSize, updatedAt: Date.now() });
  }, [migratedNote, onNoteChange]);

  const updateFontFamily = useCallback((fontFamily: string) => {
    if (!migratedNote) return;
    onNoteChange({ ...migratedNote, fontFamily, updatedAt: Date.now() });
  }, [migratedNote, onNoteChange]);

  const updateColor = useCallback((color: string) => {
    if (!migratedNote) return;
    onNoteChange({ ...migratedNote, color, updatedAt: Date.now() });
  }, [migratedNote, onNoteChange]);

  const updateTextColor = useCallback((textColor: string) => {
    if (!migratedNote) return;
    onNoteChange({ ...migratedNote, textColor, updatedAt: Date.now() });
  }, [migratedNote, onNoteChange]);

  const setMode = useCallback((mode: 'notes' | 'todos' | 'pomodoro') => {
    if (!migratedNote) return;
    onNoteChange({ ...migratedNote, mode, updatedAt: Date.now() });
  }, [migratedNote, onNoteChange]);

  // Todo handlers
  const addTodo = useCallback(() => {
    if (!migratedNote || !newTodoText.trim()) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    onNoteChange({ 
      ...migratedNote, 
      todos: [...migratedNote.todos, newTodo],
      updatedAt: Date.now(),
    });
    setNewTodoText('');
  }, [migratedNote, newTodoText, onNoteChange]);

  const toggleTodo = useCallback((todoId: string) => {
    if (!migratedNote) return;
    onNoteChange({
      ...migratedNote,
      todos: migratedNote.todos.map(todo => 
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      ),
      updatedAt: Date.now(),
    });
  }, [migratedNote, onNoteChange]);

  const deleteTodo = useCallback((todoId: string) => {
    if (!migratedNote) return;
    onNoteChange({
      ...migratedNote,
      todos: migratedNote.todos.filter(todo => todo.id !== todoId),
      updatedAt: Date.now(),
    });
  }, [migratedNote, onNoteChange]);

  // Pomodoro handlers
  const togglePomodoro = useCallback(() => {
    if (!migratedNote) return;
    onNoteChange({
      ...migratedNote,
      pomodoro: {
        ...migratedNote.pomodoro,
        isRunning: !migratedNote.pomodoro.isRunning,
      },
    });
  }, [migratedNote, onNoteChange]);

  const resetPomodoro = useCallback(() => {
    if (!migratedNote) return;
    const duration = migratedNote.pomodoro.mode === 'work' 
      ? migratedNote.pomodoro.workDuration * 60
      : migratedNote.pomodoro.mode === 'shortBreak'
        ? migratedNote.pomodoro.shortBreakDuration * 60
        : migratedNote.pomodoro.longBreakDuration * 60;
    
    onNoteChange({
      ...migratedNote,
      pomodoro: {
        ...migratedNote.pomodoro,
        isRunning: false,
        timeLeft: duration,
      },
    });
  }, [migratedNote, onNoteChange]);

  const setPomodoroMode = useCallback((mode: 'work' | 'shortBreak' | 'longBreak') => {
    if (!migratedNote) return;
    const duration = mode === 'work' 
      ? migratedNote.pomodoro.workDuration * 60
      : mode === 'shortBreak'
        ? migratedNote.pomodoro.shortBreakDuration * 60
        : migratedNote.pomodoro.longBreakDuration * 60;
    
    onNoteChange({
      ...migratedNote,
      pomodoro: {
        ...migratedNote.pomodoro,
        isRunning: false,
        mode,
        timeLeft: duration,
      },
    });
  }, [migratedNote, onNoteChange]);

  // Early return after all hooks
  if (!migratedNote) return null;

  // Start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.sticky-note-textarea') ||
        (e.target as HTMLElement).closest('.sticky-note-actions') ||
        (e.target as HTMLElement).closest('.sticky-note-resize') ||
        (e.target as HTMLElement).closest('.sticky-note-settings-panel') ||
        (e.target as HTMLElement).closest('.sticky-note-content') ||
        (e.target as HTMLElement).closest('.sticky-note-tabs')) {
      return;
    }

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - migratedNote.position.x,
      y: e.clientY - migratedNote.position.y,
    });
  };

  // Start resizing
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = migratedNote.size.width;
    const startHeight = migratedNote.size.height;

    const handleResizeMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(280, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY));

      onNoteChange({ ...migratedNote, size: { width: newWidth, height: newHeight } });
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // Download note
  const handleDownload = () => {
    let content = '';
    if (migratedNote.mode === 'notes') {
      content = migratedNote.content;
    } else if (migratedNote.mode === 'todos') {
      content = migratedNote.todos.map(todo => 
        `${todo.completed ? '[x]' : '[ ]'} ${todo.text}`
      ).join('\n');
    } else {
      content = `Pomodoro Sessions: ${migratedNote.pomodoro.sessionsCompleted}`;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sticky-${migratedNote.mode}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Upload note
  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        
        // Handle upload based on current mode
        if (migratedNote.mode === 'todos') {
          // Parse todo format: [x] or [ ] followed by text
          const lines = content.split('\n').filter(line => line.trim());
          const newTodos: TodoItem[] = lines.map((line, index) => {
            const isCompleted = line.startsWith('[x]') || line.startsWith('[X]');
            const text = line.replace(/^\[[ xX]\]\s*/, '').trim();
            return {
              id: `${Date.now()}-${index}`,
              text: text || line.trim(),
              completed: isCompleted,
              createdAt: Date.now(),
            };
          }).filter(todo => todo.text);
          
          onNoteChange({
            ...migratedNote,
            todos: [...migratedNote.todos, ...newTodos],
            updatedAt: Date.now(),
          });
        } else {
          // Notes mode - just update content
          updateContent(content);
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format time for pomodoro
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="sticky-notes-container" ref={containerRef}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.md"
        style={{ display: 'none' }}
      />

      <div
        className={`sticky-note sticky-note-${migratedNote.color || 'primary'}`}
        style={{
          left: migratedNote.position.x,
          top: migratedNote.position.y,
          width: migratedNote.size.width,
          height: migratedNote.size.height,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header with drag handle and actions */}
        <div className="sticky-note-header">
          <div className="sticky-note-drag-handle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="5" r="2"/>
              <circle cx="12" cy="5" r="2"/>
              <circle cx="19" cy="5" r="2"/>
              <circle cx="5" cy="12" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="19" cy="12" r="2"/>
            </svg>
          </div>
          
          <div className="sticky-note-actions">
            {/* Color picker */}
            <div className="sticky-note-colors">
              {NOTE_COLORS.map((color) => (
                <button
                  key={color.name}
                  className={`color-btn color-btn-${color.value} ${migratedNote.color === color.value ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateColor(color.value);
                  }}
                  title={color.name}
                />
              ))}
            </div>

            {/* Upload button */}
            <button 
              className="sticky-note-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              title="Upload note"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </button>

            {/* Download button */}
            <button 
              className="sticky-note-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              title="Download note"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>

            {/* Settings button */}
            <button 
              className={`sticky-note-action-btn ${showSettings ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              title="Text settings"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 7 4 4 20 4 20 7"/>
                <line x1="9" y1="20" x2="15" y2="20"/>
                <line x1="12" y1="4" x2="12" y2="20"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="sticky-note-tabs" onClick={(e) => e.stopPropagation()}>
          <button 
            className={`tab-btn ${migratedNote.mode === 'notes' ? 'active' : ''}`}
            onClick={() => setMode('notes')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Notes
          </button>
          <button 
            className={`tab-btn ${migratedNote.mode === 'todos' ? 'active' : ''}`}
            onClick={() => setMode('todos')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Todos
          </button>
          <button 
            className={`tab-btn ${migratedNote.mode === 'pomodoro' ? 'active' : ''}`}
            onClick={() => setMode('pomodoro')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Pomodoro
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="sticky-note-settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="settings-row">
              <label>Font</label>
              <select 
                value={migratedNote.fontFamily}
                onChange={(e) => updateFontFamily(e.target.value)}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.name} value={font.value}>{font.name}</option>
                ))}
              </select>
            </div>
            <div className="settings-row">
              <label>Size</label>
              <select 
                value={migratedNote.fontSize}
                onChange={(e) => updateFontSize(Number(e.target.value))}
              >
                {FONT_SIZES.map((size) => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
            </div>
            <div className="settings-row">
              <label>Text</label>
              <select 
                value={migratedNote.textColor}
                onChange={(e) => updateTextColor(e.target.value)}
              >
                {TEXT_COLORS.map((color) => (
                  <option key={color.name} value={color.value}>{color.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="sticky-note-content" onClick={(e) => e.stopPropagation()}>
          {/* Notes Mode */}
          {migratedNote.mode === 'notes' && (
            <textarea
              className="sticky-note-textarea"
              value={migratedNote.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="Write your note here... (Press N to toggle)"
              style={{
                fontSize: `${migratedNote.fontSize}px`,
                fontFamily: migratedNote.fontFamily,
                color: migratedNote.textColor,
              }}
            />
          )}

          {/* Todos Mode */}
          {migratedNote.mode === 'todos' && (
            <div className="todo-list" style={{ fontFamily: migratedNote.fontFamily }}>
              <div className="todo-input-row">
                <input
                  type="text"
                  className="todo-input"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="Add a task..."
                  style={{ 
                    fontSize: `${migratedNote.fontSize}px`,
                    color: migratedNote.textColor,
                  }}
                />
                <button className="todo-add-btn" onClick={addTodo}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>
              <div className="todo-items">
                {migratedNote.todos.map((todo) => (
                  <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                    <button 
                      className="todo-checkbox"
                      onClick={() => toggleTodo(todo.id)}
                    >
                      {todo.completed ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                        </svg>
                      )}
                    </button>
                    <span 
                      className="todo-text"
                      style={{ 
                        fontSize: `${migratedNote.fontSize}px`,
                        color: migratedNote.textColor,
                      }}
                    >
                      {todo.text}
                    </span>
                    <button 
                      className="todo-delete-btn"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
                {migratedNote.todos.length === 0 && (
                  <div className="todo-empty" style={{ color: migratedNote.textColor }}>
                    No tasks yet. Add one above!
                  </div>
                )}
              </div>
              <div className="todo-stats" style={{ color: migratedNote.textColor }}>
                {migratedNote.todos.filter(t => t.completed).length}/{migratedNote.todos.length} completed
              </div>
            </div>
          )}

          {/* Pomodoro Mode */}
          {migratedNote.mode === 'pomodoro' && (
            <div className="pomodoro" style={{ fontFamily: migratedNote.fontFamily }}>
              <div className="pomodoro-mode-btns">
                <button 
                  className={`pomodoro-mode-btn ${migratedNote.pomodoro.mode === 'work' ? 'active' : ''}`}
                  onClick={() => setPomodoroMode('work')}
                >
                  Work
                </button>
                <button 
                  className={`pomodoro-mode-btn ${migratedNote.pomodoro.mode === 'shortBreak' ? 'active' : ''}`}
                  onClick={() => setPomodoroMode('shortBreak')}
                >
                  Short
                </button>
                <button 
                  className={`pomodoro-mode-btn ${migratedNote.pomodoro.mode === 'longBreak' ? 'active' : ''}`}
                  onClick={() => setPomodoroMode('longBreak')}
                >
                  Long
                </button>
              </div>

              <div 
                className={`pomodoro-timer ${migratedNote.pomodoro.isRunning ? 'running' : ''}`}
                style={{ color: migratedNote.textColor }}
              >
                {formatTime(migratedNote.pomodoro.timeLeft)}
              </div>

              <div className="pomodoro-controls">
                <button 
                  className={`pomodoro-btn ${migratedNote.pomodoro.isRunning ? 'pause' : 'start'}`}
                  onClick={togglePomodoro}
                >
                  {migratedNote.pomodoro.isRunning ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16"/>
                      <rect x="14" y="4" width="4" height="16"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  )}
                </button>
                <button className="pomodoro-btn reset" onClick={resetPomodoro}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                </button>
              </div>

              <div className="pomodoro-stats" style={{ color: migratedNote.textColor }}>
                <span className="pomodoro-sessions">
                  🍅 {migratedNote.pomodoro.sessionsCompleted} sessions
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Resize handle */}
        <div 
          className="sticky-note-resize"
          onMouseDown={handleResizeStart}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 22L12 22L22 12L22 22Z"/>
            <path d="M22 22L18 22L22 18L22 22Z" opacity="0.5"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
