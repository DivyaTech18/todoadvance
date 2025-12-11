"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Phase 1.1: Expanded Task Interface
interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: "Pending" | "Completed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  dueDate?: string;
  category?: string;
  subtasks: Subtask[];
  createdAt: number;
  completedAt?: number;
}

type FilterType = "All" | "Pending" | "Completed";
type SortType = "date" | "priority" | "dueDate" | "alphabetical";

// Phase 1.2: Local Storage Helpers
const STORAGE_KEY = "todo-tasks";
const TEMPLATES_KEY = "todo-templates";
const THEME_KEY = "todo-theme";

const loadTasks = (): Task[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const tasks = JSON.parse(stored);
      return tasks.map((task: any) => ({
        ...task,
        createdAt: task.createdAt || Date.now(),
      }));
    }
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
  return [
    { id: 1, title: "Study DSA", status: "Pending", priority: "Medium", subtasks: [], createdAt: Date.now() },
    { id: 2, title: "Build To-Do App", status: "Completed", priority: "High", subtasks: [], createdAt: Date.now() },
  ];
};

const saveTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
};

export default function TodoPage() {
  // Core State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");
  const [sortBy, setSortBy] = useState<SortType>("date");
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("");
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);

  // Phase 1.2: Load tasks and theme on mount
  useEffect(() => {
    setTasks(loadTasks());
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  // Save tasks on change
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      saveTasks(tasks);
    }
  }, [tasks]);

  // Apply theme
  useEffect(() => {
    document.documentElement.style.backgroundColor = isDarkMode ? "#1a1a1a" : "#f5f5f5";
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Phase 3.7: Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setShowNewTaskForm(true);
        setTimeout(() => taskInputRef.current?.focus(), 0);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsDarkMode((prev) => !prev);
      }
      if (e.key === "Escape") {
        setEditingId(null);
        setShowNewTaskForm(false);
        setShowTemplates(false);
        setShowShortcuts(false);
        setDeleteConfirmId(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Phase 3.3: Notifications
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Phase 2.4 & 2.2: Filter and Sort Tasks
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      if (filter === "Pending" && task.status !== "Pending") return false;
      if (filter === "Completed" && task.status !== "Completed") return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.category?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "date":
        default:
          return b.createdAt - a.createdAt;
      }
    });

  // Phase 2.8: Stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    completionRate: tasks.length > 0 ? (tasks.filter((t) => t.status === "Completed").length / tasks.length) * 100 : 0,
  };

  // Task Operations
  const handleAddTask = () => {
    const taskTitle = newTaskTitle.trim();
    if (taskTitle === "") return;

    const newTask: Task = {
      id: Date.now(),
      title: taskTitle,
      description: newTaskDescription.trim() || undefined,
      status: "Pending",
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
      category: newTaskCategory.trim() || undefined,
      subtasks: [],
      createdAt: Date.now(),
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("Medium");
    setNewTaskDueDate("");
    setNewTaskCategory("");
    setShowNewTaskForm(false);

    // Phase 3.3: Notification for due date
    if (newTaskDueDate) {
      const dueDate = new Date(newTaskDueDate);
      const now = new Date();
      const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours > 0 && diffHours <= 24 && Notification.permission === "granted") {
        setTimeout(() => {
          new Notification(`Task due soon: ${taskTitle}`, {
            body: `Due in ${Math.round(diffHours)} hours`,
            icon: "/favicon.ico",
          });
        }, 100);
      }
    }
  };

  const handleUpdateTask = (id: number, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
    setEditingId(null);
  };

  const toggleTaskStatus = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "Pending" ? "Completed" : "Pending",
              completedAt: task.status === "Pending" ? Date.now() : undefined,
            }
          : task
      )
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setDeleteConfirmId(null);
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleExpandTask = (id: number) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Phase 3.2: Subtasks
  const addSubtask = (taskId: number, subtaskTitle: string) => {
    if (!subtaskTitle.trim()) return;
    const newSubtask: Subtask = {
      id: Date.now(),
      title: subtaskTitle.trim(),
      completed: false,
    };
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, subtasks: [...task.subtasks, newSubtask] }
          : task
      )
    );
  };

  const toggleSubtask = (taskId: number, subtaskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              ),
            }
          : task
      )
    );
  };

  const deleteSubtask = (taskId: number, subtaskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, subtasks: task.subtasks.filter((st) => st.id !== subtaskId) }
          : task
      )
    );
  };

  // Phase 3.8: Bulk Operations
  const toggleSelectTask = (id: number) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedTasks(new Set(filteredAndSortedTasks.map((t) => t.id)));
  };

  const deselectAll = () => {
    setSelectedTasks(new Set());
  };

  const bulkDelete = () => {
    setTasks((prev) => prev.filter((task) => !selectedTasks.has(task.id)));
    setSelectedTasks(new Set());
  };

  const bulkComplete = () => {
    setTasks((prev) =>
      prev.map((task) =>
        selectedTasks.has(task.id) && task.status === "Pending"
          ? { ...task, status: "Completed" as const, completedAt: Date.now() }
          : task
      )
    );
    setSelectedTasks(new Set());
  };

  const bulkUpdatePriority = (priority: Task["priority"]) => {
    setTasks((prev) =>
      prev.map((task) =>
        selectedTasks.has(task.id) ? { ...task, priority } : task
      )
    );
    setSelectedTasks(new Set());
  };

  // Phase 3.5: Templates
  const saveAsTemplate = (task: Task) => {
    try {
      const templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || "[]");
      templates.push({ ...task, id: Date.now(), title: `${task.title} (Template)` });
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const loadTemplates = () => {
    try {
      return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const useTemplate = (template: Task) => {
    const newTask: Task = {
      ...template,
      id: Date.now(),
      status: "Pending" as const,
      createdAt: Date.now(),
      completedAt: undefined,
      title: template.title.replace(" (Template)", ""),
    };
    setTasks((prev) => [...prev, newTask]);
    setShowTemplates(false);
  };

  // Phase 3.6: Export/Import
  const exportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `todo-backup-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setTasks(imported);
          alert(`Imported ${imported.length} tasks successfully!`);
        } else {
          alert("Invalid file format");
        }
      } catch (error) {
        alert("Error importing file");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // Priority Colors
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "Urgent":
        return isDarkMode ? "#dc3545" : "#dc3545";
      case "High":
        return isDarkMode ? "#fd7e14" : "#ff9800";
      case "Medium":
        return isDarkMode ? "#ffc107" : "#ffc107";
      case "Low":
        return isDarkMode ? "#28a745" : "#28a745";
    }
  };

  const categoryColors: Record<string, string> = {
    Work: isDarkMode ? "#0070f3" : "#0070f3",
    Personal: isDarkMode ? "#28a745" : "#28a745",
    Shopping: isDarkMode ? "#ff9800" : "#ff9800",
    Health: isDarkMode ? "#e91e63" : "#e91e63",
    Finance: isDarkMode ? "#9c27b0" : "#9c27b0",
  };

  const bgColor = isDarkMode ? "#070b16" : "#eef2ff";
  const cardBg = isDarkMode ? "rgba(17, 24, 38, 0.72)" : "#ffffff";
  const textColor = isDarkMode ? "#f3f4f6" : "#0f172a";
  const textSecondary = isDarkMode ? "#9ca3af" : "#4b5563";
  const borderColor = isDarkMode ? "rgba(255,255,255,0.08)" : "#e5e7eb";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDarkMode
          ? "radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.08), transparent 28%), radial-gradient(circle at 80% 0%, rgba(34, 211, 238, 0.08), transparent 24%), linear-gradient(145deg, #05070e 0%, #0c1324 50%, #0a0f1d 100%)"
          : "#f5f7ff",
        color: textColor,
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        padding: "1.5rem",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", margin: 0 }}>
            Your Tasks
          </h1>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Link
              href="/chat"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                color: textColor,
                cursor: "pointer",
                fontSize: "0.9rem",
                textDecoration: "none",
                display: "inline-block",
              }}
              title="Chat with AI Assistant"
            >
              💬 Chat
            </Link>
            <button
              type="button"
              onClick={() => setShowShortcuts(true)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                color: textColor,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
              title="Keyboard Shortcuts (Ctrl+/)"
            >
              ⌨️ Shortcuts
            </button>
            <button
              type="button"
              onClick={() => setShowTemplates(true)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                color: textColor,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              📋 Templates
            </button>
            <button
              type="button"
              onClick={exportTasks}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                color: textColor,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              💾 Export
            </button>
            <label
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                color: textColor,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              📥 Import
              <input
                type="file"
                accept=".json"
                onChange={importTasks}
                style={{ display: "none" }}
              />
            </label>
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                color: textColor,
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
              title="Toggle Dark Mode (Ctrl+K)"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Phase 2.8: Stats */}
        <div
          style={{
            backgroundColor: cardBg,
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2rem",
            border: `1px solid ${borderColor}`,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <div style={{ color: textSecondary, fontSize: "0.9rem" }}>Total</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.total}</div>
            </div>
            <div>
              <div style={{ color: textSecondary, fontSize: "0.9rem" }}>Pending</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#ffc107" }}>
                {stats.pending}
              </div>
            </div>
            <div>
              <div style={{ color: textSecondary, fontSize: "0.9rem" }}>Completed</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#28a745" }}>
                {stats.completed}
              </div>
            </div>
            <div>
              <div style={{ color: textSecondary, fontSize: "0.9rem" }}>Progress</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {Math.round(stats.completionRate)}%
              </div>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: isDarkMode ? "#404040" : "#e0e0e0",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${stats.completionRate}%`,
                height: "100%",
                backgroundColor: "#28a745",
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>

        {/* Phase 2.4: Search and Filters */}
        <div
          style={{
            backgroundColor: cardBg,
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "2rem",
            border: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tasks... (Ctrl+F)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "0.75rem",
                fontSize: "1rem",
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                backgroundColor: bgColor,
                color: textColor,
                outline: "none",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: isDarkMode ? "#dc3545" : "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            {/* Phase 2.2: Filter */}
            <span style={{ color: textSecondary, marginRight: "0.5rem" }}>Filter:</span>
            {(["All", "Pending", "Completed"] as FilterType[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: filter === f ? "#0070f3" : cardBg,
                  color: filter === f ? "#fff" : textColor,
                  border: `1px solid ${filter === f ? "#0070f3" : borderColor}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                {f}
              </button>
            ))}

            <span style={{ color: textSecondary, margin: "0 0.5rem" }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              <option value="date">Date Created</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Phase 3.8: Bulk Operations */}
        {selectedTasks.size > 0 && (
          <div
            style={{
              backgroundColor: "#0070f3",
              color: "#fff",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <span>{selectedTasks.size} task(s) selected</span>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={bulkComplete}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Mark Complete
              </button>
              <select
                onChange={(e) => bulkUpdatePriority(e.target.value as Task["priority"])}
                style={{
                  padding: "0.5rem",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                <option value="">Change Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
              <button
                type="button"
                onClick={bulkDelete}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
              <button
                type="button"
                onClick={deselectAll}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add New Task */}
        {showNewTaskForm ? (
          <div
            style={{
              backgroundColor: cardBg,
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "2rem",
              border: `1px solid ${borderColor}`,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Add New Task</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input
                ref={taskInputRef}
                type="text"
                placeholder="Task title *"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddTask();
                  }
                  if (e.key === "Escape") {
                    setShowNewTaskForm(false);
                  }
                }}
                style={{
                  padding: "0.75rem",
                  fontSize: "1rem",
                  border: `2px solid ${borderColor}`,
                  borderRadius: "8px",
                  backgroundColor: bgColor,
                  color: textColor,
                  outline: "none",
                }}
              />
              <textarea
                placeholder="Description (optional)"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
                style={{
                  padding: "0.75rem",
                  fontSize: "1rem",
                  border: `2px solid ${borderColor}`,
                  borderRadius: "8px",
                  backgroundColor: bgColor,
                  color: textColor,
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: textSecondary }}>
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Task["priority"])}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: `2px solid ${borderColor}`,
                      borderRadius: "8px",
                      backgroundColor: bgColor,
                      color: textColor,
                      cursor: "pointer",
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: textSecondary }}>
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: `2px solid ${borderColor}`,
                      borderRadius: "8px",
                      backgroundColor: bgColor,
                      color: textColor,
                      cursor: "pointer",
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: textSecondary }}>
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="Work, Personal, etc."
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    list="categories"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: `2px solid ${borderColor}`,
                      borderRadius: "8px",
                      backgroundColor: bgColor,
                      color: textColor,
                      outline: "none",
                    }}
                  />
                  <datalist id="categories">
                    <option value="Work" />
                    <option value="Personal" />
                    <option value="Shopping" />
                    <option value="Health" />
                    <option value="Finance" />
                  </datalist>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={handleAddTask}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#0070f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                  }}
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTaskForm(false);
                    setNewTaskTitle("");
                    setNewTaskDescription("");
                    setNewTaskPriority("Medium");
                    setNewTaskDueDate("");
                    setNewTaskCategory("");
                  }}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: cardBg,
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "2rem" }}>
            <button
              type="button"
              onClick={() => {
                setShowNewTaskForm(true);
                setTimeout(() => taskInputRef.current?.focus(), 0);
              }}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                width: "100%",
                maxWidth: "600px",
                display: "block",
                margin: "0 auto",
              }}
              title="Or press Ctrl+N"
            >
              + Add New Task
            </button>
          </div>
        )}

        {/* Tasks List */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {filteredAndSortedTasks.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: textSecondary,
                backgroundColor: cardBg,
                borderRadius: "8px",
                border: `1px solid ${borderColor}`,
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
              <div style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                {searchQuery ? "No tasks match your search" : "No tasks yet"}
              </div>
              <div style={{ fontSize: "0.9rem" }}>
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Click 'Add New Task' to get started"}
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: textSecondary }}>
                  Showing {filteredAndSortedTasks.length} task(s)
                </span>
                <div>
                  <button
                    type="button"
                    onClick={selectedTasks.size === filteredAndSortedTasks.length ? deselectAll : selectAll}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: cardBg,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    {selectedTasks.size === filteredAndSortedTasks.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
              </div>
              {filteredAndSortedTasks.map((task, index) => {
                const isExpanded = expandedTasks.has(task.id);
                const isEditing = editingId === task.id;
                const isSelected = selectedTasks.has(task.id);
                const isOverdue =
                  task.dueDate &&
                  task.status === "Pending" &&
                  new Date(task.dueDate) < new Date();
                const subtasksComplete = task.subtasks.filter((st) => st.completed).length;
                const subtasksTotal = task.subtasks.length;
                const subtaskProgress =
                  subtasksTotal > 0 ? (subtasksComplete / subtasksTotal) * 100 : 0;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", task.id.toString());
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedId = parseInt(e.dataTransfer.getData("text/plain"));
                      if (draggedId !== task.id) {
                        setTasks((prev) => {
                          const newTasks = [...prev];
                          const draggedIndex = newTasks.findIndex((t) => t.id === draggedId);
                          const dropIndex = newTasks.findIndex((t) => t.id === task.id);
                          const [dragged] = newTasks.splice(draggedIndex, 1);
                          newTasks.splice(dropIndex, 0, dragged);
                          return newTasks;
                        });
                      }
                    }}
                    style={{
                      backgroundColor: cardBg,
                      borderRadius: "8px",
                      padding: "1.5rem",
                      border: `2px solid ${isSelected ? "#0070f3" : isOverdue ? "#dc3545" : borderColor}`,
                      boxShadow: isSelected
                        ? "0 4px 12px rgba(0,112,243,0.3)"
                        : "0 2px 4px rgba(0,0,0,0.1)",
                      transition: "all 0.2s",
                      opacity: task.status === "Completed" ? 0.8 : 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "flex-start",
                      }}
                    >
                      {/* Phase 3.8: Bulk Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectTask(task.id)}
                        style={{
                          marginTop: "0.25rem",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Task Header */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "1rem",
                            marginBottom: "0.5rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {isEditing ? (
                              <input
                                type="text"
                                value={task.title}
                                onChange={(e) =>
                                  handleUpdateTask(task.id, { title: e.target.value })
                                }
                                onBlur={() => {
                                  if (!task.title.trim()) {
                                    handleUpdateTask(task.id, { title: "Untitled Task" });
                                  }
                                  setEditingId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.currentTarget.blur();
                                  }
                                  if (e.key === "Escape") {
                                    setEditingId(null);
                                  }
                                }}
                                autoFocus
                                style={{
                                  width: "100%",
                                  padding: "0.5rem",
                                  fontSize: "1.2rem",
                                  fontWeight: "600",
                                  border: `2px solid #0070f3`,
                                  borderRadius: "4px",
                                  backgroundColor: bgColor,
                                  color: textColor,
                                  outline: "none",
                                }}
                              />
                            ) : (
                              <h3
                                onClick={() => setEditingId(task.id)}
                                style={{
                                  fontSize: "1.2rem",
                                  fontWeight: "600",
                                  color: task.status === "Completed" ? textSecondary : textColor,
                                  margin: 0,
                                  textDecoration:
                                    task.status === "Completed" ? "line-through" : "none",
                                  cursor: "pointer",
                                }}
                                title="Click to edit"
                              >
                                {task.title}
                              </h3>
                            )}

                            {/* Phase 2.6: Category Tag */}
                            {task.category && (
                              <span
                                style={{
                                  display: "inline-block",
                                  marginTop: "0.5rem",
                                  padding: "0.25rem 0.75rem",
                                  backgroundColor:
                                    categoryColors[task.category] ||
                                    (isDarkMode ? "#555" : "#e0e0e0"),
                                  color: "#fff",
                                  borderRadius: "12px",
                                  fontSize: "0.75rem",
                                  fontWeight: "500",
                                  marginRight: "0.5rem",
                                }}
                              >
                                {task.category}
                              </span>
                            )}

                            {/* Phase 2.3: Priority Indicator */}
                            <span
                              style={{
                                display: "inline-block",
                                marginTop: "0.5rem",
                                padding: "0.25rem 0.75rem",
                                backgroundColor: getPriorityColor(task.priority),
                                color: "#fff",
                                borderRadius: "12px",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                              }}
                            >
                              {task.priority}
                            </span>
                          </div>

                          {/* Phase 2.5: Due Date */}
                          {task.dueDate && (
                            <div
                              style={{
                                textAlign: "right",
                                fontSize: "0.9rem",
                                color: isOverdue ? "#dc3545" : textSecondary,
                                fontWeight: isOverdue ? "600" : "normal",
                              }}
                            >
                              <div>📅 {new Date(task.dueDate).toLocaleDateString()}</div>
                              {isOverdue && <div style={{ fontSize: "0.75rem" }}>Overdue!</div>}
                            </div>
                          )}

                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "4px",
                                fontSize: "0.9rem",
                                fontWeight: "500",
                                backgroundColor:
                                  task.status === "Completed" ? "#d4edda" : "#fff3cd",
                                color: task.status === "Completed" ? "#155724" : "#856404",
                              }}
                            >
                              {task.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleTaskStatus(task.id)}
                              style={{
                                padding: "0.5rem 1rem",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                color: "#fff",
                                backgroundColor:
                                  task.status === "Pending" ? "#28a745" : "#ffc107",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              {task.status === "Pending" ? "✓ Done" : "↩ Undo"}
                            </button>
                          </div>
                        </div>

                        {/* Phase 3.1: Description */}
                        {task.description && (
                          <div
                            style={{
                              marginTop: "0.5rem",
                              color: textSecondary,
                              fontSize: "0.9rem",
                              lineHeight: "1.5",
                            }}
                          >
                            {task.description}
                          </div>
                        )}

                        {/* Phase 3.2: Subtasks Progress */}
                        {task.subtasks.length > 0 && (
                          <div style={{ marginTop: "1rem" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "0.5rem",
                              }}
                            >
                              <span style={{ fontSize: "0.9rem", color: textSecondary }}>
                                Subtasks: {subtasksComplete}/{subtasksTotal}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleExpandTask(task.id)}
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  color: textColor,
                                  cursor: "pointer",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {isExpanded ? "▼" : "▶"}
                              </button>
                            </div>
                            <div
                              style={{
                                width: "100%",
                                height: "4px",
                                backgroundColor: isDarkMode ? "#404040" : "#e0e0e0",
                                borderRadius: "2px",
                                overflow: "hidden",
                                marginBottom: "0.5rem",
                              }}
                            >
                              <div
                                style={{
                                  width: `${subtaskProgress}%`,
                                  height: "100%",
                                  backgroundColor: "#28a745",
                                  transition: "width 0.3s",
                                }}
                              />
                            </div>
                            {isExpanded && (
                              <div style={{ marginTop: "0.5rem" }}>
                                {task.subtasks.map((subtask) => (
                                  <div
                                    key={subtask.id}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.5rem",
                                      marginBottom: "0.5rem",
                                      padding: "0.5rem",
                                      backgroundColor: bgColor,
                                      borderRadius: "4px",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={subtask.completed}
                                      onChange={() => toggleSubtask(task.id, subtask.id)}
                                      style={{ cursor: "pointer" }}
                                    />
                                    <span
                                      style={{
                                        flex: 1,
                                        textDecoration: subtask.completed
                                          ? "line-through"
                                          : "none",
                                        color: subtask.completed ? textSecondary : textColor,
                                      }}
                                    >
                                      {subtask.title}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => deleteSubtask(task.id, subtask.id)}
                                      style={{
                                        padding: "0.25rem 0.5rem",
                                        backgroundColor: "transparent",
                                        border: "none",
                                        color: "#dc3545",
                                        cursor: "pointer",
                                        fontSize: "0.8rem",
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                                <input
                                  type="text"
                                  placeholder="Add subtask..."
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                      addSubtask(task.id, e.currentTarget.value);
                                      e.currentTarget.value = "";
                                    }
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "0.5rem",
                                    fontSize: "0.9rem",
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: "4px",
                                    backgroundColor: cardBg,
                                    color: textColor,
                                    outline: "none",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginTop: "1rem",
                            flexWrap: "wrap",
                          }}
                        >
                          {task.subtasks.length === 0 && (
                            <button
                              type="button"
                              onClick={() => toggleExpandTask(task.id)}
                              style={{
                                padding: "0.5rem 1rem",
                                fontSize: "0.9rem",
                                backgroundColor: cardBg,
                                color: textColor,
                                border: `1px solid ${borderColor}`,
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              + Add Subtask
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => saveAsTemplate(task)}
                            style={{
                              padding: "0.5rem 1rem",
                              fontSize: "0.9rem",
                              backgroundColor: cardBg,
                              color: textColor,
                              border: `1px solid ${borderColor}`,
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                            title="Save as template"
                          >
                            📋 Template
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (deleteConfirmId === task.id) {
                                handleDeleteTask(task.id);
                              } else {
                                setDeleteConfirmId(task.id);
                                setTimeout(() => setDeleteConfirmId(null), 3000);
                              }
                            }}
                            style={{
                              padding: "0.5rem 1rem",
                              fontSize: "0.9rem",
                              backgroundColor:
                                deleteConfirmId === task.id ? "#dc3545" : cardBg,
                              color: deleteConfirmId === task.id ? "#fff" : "#dc3545",
                              border: `1px solid ${deleteConfirmId === task.id ? "#dc3545" : borderColor}`,
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            {deleteConfirmId === task.id ? "Confirm?" : "🗑 Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Phase 3.7: Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowShortcuts(false)}
        >
          <div
            style={{
              backgroundColor: cardBg,
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              border: `1px solid ${borderColor}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Keyboard Shortcuts</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <strong>Ctrl/Cmd + N</strong> - New Task
              </div>
              <div>
                <strong>Ctrl/Cmd + F</strong> - Focus Search
              </div>
              <div>
                <strong>Ctrl/Cmd + K</strong> - Toggle Dark Mode
              </div>
              <div>
                <strong>Ctrl/Cmd + /</strong> - Show Shortcuts
              </div>
              <div>
                <strong>Esc</strong> - Close Modals / Cancel
              </div>
              <div>
                <strong>Enter</strong> - Submit / Confirm
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowShortcuts(false)}
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Phase 3.5: Templates Modal */}
      {showTemplates && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowTemplates(false)}
        >
          <div
            style={{
              backgroundColor: cardBg,
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              border: `1px solid ${borderColor}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Task Templates</h2>
            {loadTemplates().length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: textSecondary }}>
                No templates yet. Save a task as a template to get started.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {loadTemplates().map((template: Task) => (
                  <div
                    key={template.id}
                    style={{
                      padding: "1rem",
                      backgroundColor: bgColor,
                      borderRadius: "6px",
                      border: `1px solid ${borderColor}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600" }}>{template.title}</div>
                      {template.description && (
                        <div style={{ fontSize: "0.9rem", color: textSecondary, marginTop: "0.25rem" }}>
                          {template.description}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => useTemplate(template)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#0070f3",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowTemplates(false)}
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1.5rem",
                backgroundColor: cardBg,
                color: textColor,
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
