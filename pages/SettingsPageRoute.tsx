import React from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../components/Settings';
import { useSettings } from '../providers/SettingsProvider';
import { useUser } from '../providers/UserProvider';
import { UserRole } from '../types';

const SettingsPageRoute: React.FC = () => {
  const navigate = useNavigate();
  const { settings, setSettings } = useSettings();
  const { user } = useUser();

  return (
    <div className="h-full overflow-hidden">
      <SettingsPage
        user={user}
        settings={settings}
        onUpdateSettings={setSettings}
        onClose={() => navigate(user.role === UserRole.STUDENT ? '/dashboard' : '/admin')}
      />
    </div>
  );
};

export default SettingsPageRoute;
