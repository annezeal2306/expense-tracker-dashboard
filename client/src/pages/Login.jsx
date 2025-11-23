// src/pages/Login.jsx
import { useState, useContext } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user, login } = useContext(AuthContext);   // 👈 now also using user
  const navigate = useNavigate();

  if (user) {
    // already logged in → don't show login page
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data); // { token, user }
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="card auth-card">
  <h2 className="auth-title">Login</h2>
  <p className="auth-sub">Access your expense dashboard</p>

  {error && <div className="alert alert-error">{error}</div>}

  <form className="form-vertical" onSubmit={handleSubmit}>
    <input
      className="input"
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />

    <input
      className="input"
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    <button className="btn btn-primary" type="submit">
      Login
    </button>
  </form>

  <p className="text-muted">
    Don't have an account?{" "}
    <Link className="text-link" to="/register">
      Register
    </Link>
  </p>
</div>

  );
};

export default Login;
