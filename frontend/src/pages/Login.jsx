import React, { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function login(e) {
    e.preventDefault();

    try {
      const body = new URLSearchParams();

      body.append("username", username);
      body.append("password", password);

      const res = await axios.post(`${API}/auth/login`, body, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("access_token", res.data.access_token);

      window.location = "/";
    } catch (err) {
      console.error(err);

      if (err.response) {
        console.log(err.response.data);
        alert(JSON.stringify(err.response.data));
      } else {
        alert(err.message);
      }
    }
  }

  return (
    <div className="login">
      <div className="login__panel">
        <div className="brand">
          <div className="brand__mark">E</div>
          <h2>EYETHU</h2>
          <p>Butchery Management System</p>
        </div>

        <div>
          <h1>Inventory operations, neatly controlled.</h1>
          <p>Sign in to manage stock, deliveries, damages, adjustments and operational reports.</p>
        </div>

        <p>Secure staff access</p>
      </div>

      <form onSubmit={login}>
        <div>
          <h2>Welcome back</h2>
          <p>Use your staff credentials to continue.</p>
        </div>

        <label className="form-field">
          <span>Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>

        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
