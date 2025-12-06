"use client";

import { useState } from "react";

interface Task {
  id: number;
  title: string;
  status: "Pending" | "Completed";
}

export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Study DSA", status: "Pending" },
    { id: 2, title: "Build To-Do App", status: "Completed" },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddTask = () => {
    const taskTitle = newTaskTitle.trim();
    if (taskTitle === "") {
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: taskTitle,
      status: "Pending",
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    setNewTaskTitle("");
  };

  const toggleTaskStatus = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "Pending" ? "Completed" : "Pending",
            }
          : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "2rem",
          color: "#333",
        }}
      >
        Your Tasks
      </h1>

      {/* Add Task Section */}
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          marginBottom: "2rem",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a new task..."
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            fontSize: "1rem",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={handleAddTask}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontWeight: "600",
            color: "#fff",
            backgroundColor: "#0070f3",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.2s",
            pointerEvents: "auto",
            zIndex: 1,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#0051cc")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#0070f3")
          }
        >
          Add Task
        </button>
      </div>

      {/* Tasks List */}
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {tasks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#666",
              fontSize: "1.1rem",
            }}
          >
            No tasks yet. Add one above!
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "600",
                    color: task.status === "Completed" ? "#888" : "#333",
                    margin: 0,
                    textDecoration:
                      task.status === "Completed" ? "line-through" : "none",
                    flex: 1,
                  }}
                >
                  {task.title}
                </h3>
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleTaskStatus(task.id);
                  }}
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
                    transition: "background-color 0.2s",
                    minWidth: "100px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      task.status === "Pending" ? "#218838" : "#e0a800")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      task.status === "Pending" ? "#28a745" : "#ffc107")
                  }
                >
                  {task.status === "Pending" ? "Mark Done" : "Undo"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#fff",
                    backgroundColor: "#dc3545",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    minWidth: "80px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#c82333")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#dc3545")
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

