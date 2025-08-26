import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-page-bg text-white">
      <Navbar />
      
      {/* Add padding-top to prevent content from being hidden behind the fixed navbar */}
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
};
