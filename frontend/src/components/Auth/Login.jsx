import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import './auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'Student' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    if (!form.role) e.role = 'Role is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (evt) => {
    setForm((f) => ({ ...f, [evt.target.name]: evt.target.value }));
    setErrors((e) => ({ ...e, [evt.target.name]: '' }));
    setServerError('');
  };

  const onSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      const { data } = await api.post('/api/auth/login', {
        email: form.email,
        password: form.password,
        role: form.role,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form">
      {serverError ? <div className="alert">{serverError}</div> : null}

      <div className="field">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          className="input"
          placeholder="you@example.com"
        />
        {errors.email ? <p className="error">{errors.email}</p> : null}
      </div>

      <div className="field">
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          className="input"
          placeholder="••••••••"
        />
        {errors.password ? <p className="error">{errors.password}</p> : null}
      </div>

      <div className="field">
        <label>Role</label>
        <select
          name="role"
          value={form.role}
          onChange={onChange}
          className="select"
        >
          <option>Student</option>
          <option>Mentor</option>
        </select>
        {errors.role ? <p className="error">{errors.role}</p> : null}
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
