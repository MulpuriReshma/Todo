import { useState, useEffect } from "react";
import "./App.css";
import Login from "./Login";
import Signup from "./Signup";

function App() {
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authPage, setAuthPage] = useState("login");

  /* ---------------- FETCH TODOS ---------------- */
  const fetchTodos = async () => {
    try {
      const res = await fetch("http://localhost:5000/todos", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setTodos(data);
      } else {
        console.error("Todos API did not return array:", data);
        setTodos([]);
      }
    } catch (err) {
      console.error("Fetch todos error:", err);
      setTodos([]);
    }
  };

  /* 🔁 LOAD TODOS AFTER LOGIN */
  useEffect(() => {
    if (token) {
      fetchTodos();
    }
  }, [token]);

  /* ---------------- ADD TODO ---------------- */
  const addTodo = async () => {
    if (!task.trim()) return;

    await fetch("http://localhost:5000/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: task })
    });

    setTask("");
    fetchTodos();
  };

  /* ---------------- DELETE TODO ---------------- */
  const deleteTodo = async (id) => {
    await fetch(`http://localhost:5000/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    fetchTodos();
  };

  /* ---------------- UPDATE TODO ---------------- */
  const updateTodo = async (id, oldTitle) => {
    const newTitle = prompt("Edit task:", oldTitle);
    if (!newTitle) return;

    await fetch(`http://localhost:5000/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: newTitle })
    });

    fetchTodos();
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setTodos([]);
    setAuthPage("login");
  };

  /* ---------------- AUTH SCREENS ---------------- */
  if (!token) {
    return authPage === "login" ? (
      <Login setToken={setToken} setAuthPage={setAuthPage} />
    ) : (
      <Signup setAuthPage={setAuthPage} />
    );
  }

  /* ---------------- TODO UI ---------------- */
  return (
    <div className="container">
      <h1>Todo App</h1>

      <button onClick={logout} className="logout-btn">
        Logout
      </button>

      <div className="input-section">
        <input
          placeholder="Enter a task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo._id} className="todo-item">
            <span>{todo.title}</span>
            <div className="actions">
              <button onClick={() => updateTodo(todo._id, todo.title)}>
                ✏️
              </button>
              <button onClick={() => deleteTodo(todo._id)}>
                ❌
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
