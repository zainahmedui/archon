import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { Feed } from './pages/Feed';
import { Auth } from './pages/Auth';
import { CreatePost } from './pages/CreatePost';
import { Profile } from './pages/Profile';
import { Search } from './pages/Search';
import { Onboarding } from './pages/Onboarding';
import { Notifications } from './pages/Notifications';
import { Messages } from './pages/Messages';
import { Settings } from './pages/Settings';
import { Communities } from './pages/Communities';
import { CreateCommunity } from './pages/CreateCommunity';
import { CommunityProfile } from './pages/CommunityProfile';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  // If user hasn't completed onboarding and isn't currently on the onboarding page, redirect them
  if (user && !user.hasCompletedOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  // If user HAS completed onboarding but tries to go to onboarding, send them home
  if (user && user.hasCompletedOnboarding && location.pathname === '/onboarding') {
    return <Navigate to="/" />;
  }

  // For onboarding page, render without Main Layout
  if (location.pathname === '/onboarding') {
    return <>{children}</>;
  }
  
  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
            
            <Route path="/onboarding" element={
                <ProtectedRoute>
                    <Onboarding />
                </ProtectedRoute>
            } />

            <Route path="/" element={
                <ProtectedRoute>
                    <Feed />
                </ProtectedRoute>
            } />
            
            <Route path="/search" element={
                <ProtectedRoute>
                    <Search />
                </ProtectedRoute>
            } />
            
            <Route path="/create" element={
                <ProtectedRoute>
                    <CreatePost />
                </ProtectedRoute>
            } />
            
            <Route path="/profile/:id" element={
                <ProtectedRoute>
                    <Profile />
                </ProtectedRoute>
            } />

            <Route path="/notifications" element={
                <ProtectedRoute>
                    <Notifications />
                </ProtectedRoute>
            } />

            <Route path="/messages" element={
                <ProtectedRoute>
                    <Messages />
                </ProtectedRoute>
            } />

            <Route path="/settings" element={
                <ProtectedRoute>
                    <Settings />
                </ProtectedRoute>
            } />

            <Route path="/communities" element={
                <ProtectedRoute>
                    <Communities />
                </ProtectedRoute>
            } />

            <Route path="/communities/create" element={
                <ProtectedRoute>
                    <CreateCommunity />
                </ProtectedRoute>
            } />

            <Route path="/communities/:id" element={
                <ProtectedRoute>
                    <CommunityProfile />
                </ProtectedRoute>
            } />
        </Routes>
    )
}

const App: React.FC = () => {
  return (
    <DataProvider>
      <AuthProvider>
        <Router>
            <AppRoutes />
        </Router>
      </AuthProvider>
    </DataProvider>
  );
};

export default App;