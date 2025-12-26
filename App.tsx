import React from 'react';
import { BrandingProvider } from './providers/BrandingProvider';
import { PostsProvider } from './providers/PostsProvider';
import { SettingsProvider } from './providers/SettingsProvider';
import { UserProvider } from './providers/UserProvider';
import { ExamDataProvider } from './providers/ExamDataProvider';
import { ExamSessionProvider } from './providers/ExamSessionProvider';
import AppRouter from './routes/AppRouter';

const App: React.FC = () => (
  <BrandingProvider>
    <PostsProvider>
      <UserProvider>
        <SettingsProvider>
          <ExamDataProvider>
            <ExamSessionProvider>
              <AppRouter />
            </ExamSessionProvider>
          </ExamDataProvider>
        </SettingsProvider>
      </UserProvider>
    </PostsProvider>
  </BrandingProvider>
);

export default App;
