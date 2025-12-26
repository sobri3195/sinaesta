import React, { createContext, useContext, useMemo, useState } from 'react';
import { MOCK_ADMIN, MOCK_STUDENT, MOCK_TEACHER } from '../mockData';
import { Specialty, User, UserRole } from '../types';

export interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  institution: string;
  targetSpecialty: Specialty;
  expectedYear: number;
}

interface UserContextValue {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  switchRole: (targetRole: UserRole) => void;
  updateSpecialty: (specialty: Specialty) => void;
  registerUser: (registrationData: RegistrationData) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(MOCK_STUDENT);

  const switchRole = (targetRole: UserRole) => {
    let newUser: User = { ...user, role: targetRole };

    if (targetRole === UserRole.STUDENT) {
      newUser = { ...MOCK_STUDENT, targetSpecialty: user.targetSpecialty || 'Internal Medicine' };
    } else if (targetRole === UserRole.PROGRAM_ADMIN) {
      newUser = MOCK_ADMIN;
    } else if (targetRole === UserRole.TEACHER) {
      newUser = MOCK_TEACHER;
    } else if (targetRole === UserRole.SUPER_ADMIN) {
      newUser = { ...MOCK_ADMIN, role: UserRole.SUPER_ADMIN, name: 'Super Admin' };
    }

    setUser(newUser);
  };

  const updateSpecialty = (specialty: Specialty) => {
    setUser((prev) => ({ ...prev, targetSpecialty: specialty }));
  };

  const registerUser = (registrationData: RegistrationData) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: registrationData.name,
      role: UserRole.STUDENT,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(registrationData.name)}&background=0D8ABC&color=fff`,
      targetSpecialty: registrationData.targetSpecialty,
      institution: registrationData.institution,
      strNumber: registrationData.phone
    };

    setUser(newUser);
  };

  const logout = () => {
    setUser(MOCK_STUDENT);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      switchRole,
      updateSpecialty,
      registerUser,
      logout
    }),
    [user]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
