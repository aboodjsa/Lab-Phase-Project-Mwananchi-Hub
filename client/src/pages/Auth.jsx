import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth";
import { errMsg } from "../api";
const DEMOS = [["Customer", "customer@servicehub.com", "Customer123!"], ["Provider", "omar@servicehub.com", "Provider123!"], ["Admin", "admin@servicehub.com", "Admin123!"]];
function Form({ reg }) {
  const { login, register } = useAuth(), nav = useNavigate();
  const [d, setD] = useState({ name: "", email: "", password: "", role: "customer", city: "", phone: "" }), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { const u = await (reg ? register : login)(d); nav(u.role === "admin" ? "/admin" : "/dashboard"); }
    catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (<form className="box" onSubmit={submit}>
    <h2>{reg ? "Create your account" : "Welcome back"}</h2>
    {err && <p className="err" role="alert">{err}</p>}
    {reg && <>
      <input placeholder="Full name" required value={d.name} onChange={set("name")} />
      <input placeholder="City" value={d.city} onChange={set("city")} />
      <input placeholder="Phone" value={d.phone} onChange={set("phone")} />
      <select value={d.role} onChange={set("role")}><option value="customer">I need a service</option><option value="provider">I offer services</option></select></>}
    <input type="email" placeholder="Email" required autoComplete="email" value={d.email} onChange={set("email")} />
    <input type="password" placeholder="Password (6+ characters)" minLength={6} required autoComplete={reg ? "new-password" : "current-password"} value={d.password} onChange={set("password")} />
    <button disabled={busy}>{busy ? "Please wait..." : reg ? "Create account" : "Log in"}</button>
    <p>{reg ? <>Already registered? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</p>
    {!reg && <div><p>Try a demo account (after running the seed):</p>{DEMOS.map(([n, e, p]) => <button type="button" key={n} onClick={() => setD({ ...d, email: e, password: p })}>{n}</button>)}</div>}
  </form>);
}
export const Login = () => <Form />;
export const Register = () => <Form reg />;
