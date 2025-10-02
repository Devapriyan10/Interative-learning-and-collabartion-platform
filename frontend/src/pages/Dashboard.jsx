import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }
    (async () => {
      try {
        const { data } = await api.get('/api/auth/me');
        setUser(data.user);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='rounded-md bg-white p-6 shadow'>Loading dashboard...</div>
      </div>
    );
  }

  const role = user?.role || 'Student';
  const name = user?.name || '';

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-3xl px-4 py-10'>
        <div className='rounded-xl bg-white p-8 shadow-sm'>
          <h1 className='text-2xl font-semibold text-gray-900'>
            {role === 'Mentor' ? `Welcome Mentor ${name}` : `Welcome Student ${name}`}
          </h1>
          <p className='mt-2 text-gray-600'>You are now logged in.</p>

          <div className='mt-6'>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/auth');
              }}
              className='rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
