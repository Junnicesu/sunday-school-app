import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ParentRegister from './components/ParentRegister';
import ParentDashboard from './components/ParentDashboard';
import SignForm from './components/SignForm';
import TeacherLogin from './components/TeacherLogin';
import Attendance from './components/Attendance';
import RoomPage from './components/RoomPage'; // Import RoomPage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/parent/register" element={<ParentRegister />} />
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
        <Route path="/parent/sign" element={<SignForm />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/attendance" element={<Attendance />} />
        <Route path="/room/:roomId" element={<RoomPage />} /> {/* New RoomPage route */}
        <Route path="/" element={<h1>Welcome to Sunday School App</h1>} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;