import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import { ViewState } from '../types';
import { useBranding } from '../providers/BrandingProvider';
import { usePosts } from '../providers/PostsProvider';
import { useUser } from '../providers/UserProvider';

const LandingPageRoute: React.FC = () => {
  const navigate = useNavigate();
  const { logoUrl } = useBranding();
  const { posts } = usePosts();
  const { registerUser, switchRole } = useUser();

  const handleNavigate = (view: ViewState) => {
    if (view === 'PRIVACY') {
      navigate('/privacy');
      return;
    }
    if (view === 'TERMS') {
      navigate('/terms');
      return;
    }
    if (view === 'SUPPORT') {
      navigate('/support');
      return;
    }
    navigate('/');
  };

  return (
    <LandingPage
      logoUrl={logoUrl}
      posts={posts}
      onGetStarted={() => navigate('/dashboard')}
      onNavigate={handleNavigate}
      onRegister={(data) => {
        registerUser(data);
        navigate('/dashboard');
      }}
      onLoginSuccess={(role) => {
        switchRole(role);
        navigate('/dashboard');
      }}
    />
  );
};

export default LandingPageRoute;
