import { useState } from "react";

export default function TasksPage({
  tasks,
  setTasks,
  socket,
  apiUrl,
}) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    dueDate: "",
    category: "Bill",
  });

  async function createTask(e) {
    e.preventDefault();

    if (!form.title.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      ...form,
      completed: false,
      createdAt: new Date().toLocaleString(),
    };

    try {
      await fetch(`${apiUrl}/tasks`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(newTask),
      });

      setForm({
        title: "",
        amount: "",
        dueDate: "",
        category: "Bill",
      });
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  }

  async function toggleTask(task) {
    try {
      await fetch(`${apiUrl}/tasks/${task.id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...task,
          completed: !task.completed,
        }),
      });
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  }

  async function deleteTask(id) {
    try {
      await fetch(`${apiUrl}/tasks/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  }

  return (
    <section className="article-page">
      <div className="card form-card">
        <div className="card-header">
          <h2>Add Bill / Task</h2>
        </div>

        <form className="form" onSubmit={createTask}>
          <label>
            Title

            <input
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              placeholder="Electric bill"
            />
          </label>

          <label>
            Amount

            <input
              value={form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: e.target.value,
                })
              }
              placeholder="$120"
            />
          </label>

          <label>
            Due Date

            <input
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  dueDate: e.target.value,
                })
              }
            />
          </label>

          <label>
            Category

            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
            >
              <option>Bill</option>
              <option>Task</option>
              <option>Reminder</option>
            </select>
          </label>

          <button className="gold-button">
            Save
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Current Bills & Tasks</h2>

        <div className="article-list">
          {tasks.length === 0 ? (
            <p className="empty">
              No tasks yet.
            </p>
          ) : (
            tasks.map((task) => (
              <article
                key={task.id}
                className={`article article-summary ${
                  task.completed
                    ? "task-complete"
                    : ""
                }`}
              >
                <div>
                  <h3>{task.title}</h3>

                  <small>
                    {task.category}

                    {task.amount &&
                      ` • ${task.amount}`}

                    {task.dueDate &&
                      ` • Due ${task.dueDate}`}
                  </small>
                </div>

                <div className="article-actions">
                  <button
                    className="gold-button"
                    onClick={() =>
                      toggleTask(task)
                    }
                  >
                    {task.completed
                      ? "Undo"
                      : "Done"}
                  </button>

                  <button
                    className="delete"
                    onClick={() =>
                      deleteTask(task.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}