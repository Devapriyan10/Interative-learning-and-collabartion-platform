import { useState } from 'react';
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';

export default function AuthPage() {
  const [tab, setTab] = useState('login');

  return (
    <div className="container-center">
      <div className="card" style={{ maxWidth: 520 }}>
        <div className="tabs">
          <button
            onClick={() => setTab('login')}
            className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
          >
            Login
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`tab-btn ${tab === 'signup' ? 'active' : ''}`}
          >
            Signup
          </button>
        </div>

        <h1 className="title">{tab === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="subtitle">
          {tab === 'login' ? 'Sign in to access your dashboard' : 'Join us as a Student or Mentor'}
        </p>

        {tab === 'login' ? <Login /> : <Signup />}

        <div className="space-top muted" style={{ textAlign: 'center' }}>
          {tab === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setTab('signup')} className="link">Sign up</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setTab('login')} className="link">Log in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
