import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import RoomList from './Components/RoomList';
import RoomDetail from './Components/RoomDetail';
import RequestRent from './Components/RequestRent';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Hệ thống quản lý nhà trọ</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/rooms" element={<RoomList />} />
              <Route path="/rooms/:id" element={<RoomDetail />} />
              <Route path="/request-rent/:roomId" element={<RequestRentWrapper />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

// Wrapper component to handle roomId parameter for RequestRent
function RequestRentWrapper() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const handleClose = () => {
    navigate('/rooms');
  };
  
  return <RequestRent roomId={roomId} onClose={handleClose} />;
}

export default App;