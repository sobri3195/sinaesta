import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalDocs from '../components/LegalDocs';
import { ViewState } from '../types';

const LegalDocsRoute: React.FC<{ type: ViewState }> = ({ type }) => {
  const navigate = useNavigate();

  return <LegalDocs type={type} onBack={() => navigate('/')} />;
};

export default LegalDocsRoute;
