import { useState, useContext } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);   // 👈
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" />;
  }

  // ...rest of your component

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      await api.post("/auth/register", { name, email, password });
      setMsg("Registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="card auth-card" >
  <h2 className="auth-title">Register</h2>
  {msg && <p style={{ color: "green" }}>{msg}</p>}
  {error && <p style={{ color: "red" }}>{error}</p>}
  <p className="auth-sub">Access your expense dashboard</p>

  {error && <div className="alert alert-error">{error}</div>}

  <form className="form-vertical" onSubmit={handleSubmit}>
    <input
        className="input"
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
    />

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
      Register
    </button>
  </form>

  <p className="text-muted">
    Already have an account?{" "}
    <Link className="text-link" to="/login">
      Login
    </Link>
  </p>
</div>
    // <div style={{ maxWidth: 400, margin: "40px auto" }}>
    //   <h2>Register</h2>
    //   {msg && <p style={{ color: "green" }}>{msg}</p>}
    //   {error && <p style={{ color: "red" }}>{error}</p>}
    //   <form
    //     onSubmit={handleSubmit}
    //     style={{ display: "flex", flexDirection: "column", gap: 8 }}
    //   >
    //     <input
    //       type="text"
    //       placeholder="Name"
    //       value={name}
    //       onChange={(e) => setName(e.target.value)}
    //       required
    //     />
    //     <input
    //       type="email"
    //       placeholder="Email"
    //       value={email}
    //       onChange={(e) => setEmail(e.target.value)}
    //       required
    //     />
    //     <input
    //       type="password"
    //       placeholder="Password (min 6 chars)"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //       required
    //     />
    //     <button type="submit">Register</button>
    //   </form>
    //   <p style={{ marginTop: 10 }}>
    //     Already have an account? <Link to="/login">Login</Link>
    //   </p>
    // </div>
  );
};

export default Register;
