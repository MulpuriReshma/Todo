import React from "react";

function Todo({ todo, onDelete, onEdit }) {
  return (
    <div className="todo-item">
      <span>{todo.title}</span>

      <button onClick={() => onEdit(todo)}>Edit</button>
      <button onClick={() => onDelete(todo._id)}>Delete</button>
    </div>
  );
}

export default Todo;
