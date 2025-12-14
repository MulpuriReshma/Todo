import React, { useState } from "react";

function Signup({ setAuthPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert(data.message);
    setAuthPage("login");
  };

  return (
    <div>
      <h2>Signup</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={signup}>Sign Up</button>

      <p onClick={() => setAuthPage("login")} style={{ cursor: "pointer" }}>
        Already have an account? Login
      </p>
    </div>
  );
}

export default Signup;
