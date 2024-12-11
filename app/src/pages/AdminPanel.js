import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { userData } = useAuth();

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome, {userData?.name || 'Гость'}</p>
    </div>
  );
};

export default AdminPanel;