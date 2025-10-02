import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import MentorDashboard from './pages/MentorDashboard';
import StudentDashboard from './pages/StudentDashboard';

function DashboardRouter() {
  // Get user role from localStorage to determine which dashboard to show
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role;
  
  if (role === 'Mentor') {
    return <MentorDashboard />;
  } else if (role === 'Student') {
    return <StudentDashboard />;
  } else {
    // Fallback to original dashboard if role is not set
    return <Dashboard />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/auth' replace />} />
        <Route path='/auth' element={<AuthPage />} />
        <Route path='/dashboard' element={<DashboardRouter />} />
        <Route path='/mentor-dashboard' element={<MentorDashboard />} />
        <Route path='/student-dashboard' element={<StudentDashboard />} />
        <Route path='*' element={<Navigate to='/auth' replace />} />
      </Routes>
    </BrowserRouter>
  );
}
