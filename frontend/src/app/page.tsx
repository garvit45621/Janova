'use client';

import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import DashboardLayout from '../components/DashboardLayout';
import AIAssistant from '../components/AIAssistant';

// Import Views
import LandingView from '../views/Landing';
import DashboardView from '../views/DashboardView';
import ServicesView from '../views/ServicesView';
import BenefitsView from '../views/BenefitsView';
import VaultView from '../views/VaultView';
import LifeEventsView from '../views/LifeEventsView';
import BusinessView from '../views/BusinessView';
import ComplaintsView from '../views/ComplaintsView';
import CalendarView from '../views/CalendarView';
import SettingsView from '../views/SettingsView';
import AdminView from '../views/AdminView';

function WorkspaceContent() {
  const context = useContext(AppContext);
  if (!context) return null;
  const { user, activeView } = context;

  // Protected View router
  if (!user) {
    return <LandingView />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'services':
        return <ServicesView />;
      case 'benefits':
        return <BenefitsView />;
      case 'vault':
        return <VaultView />;
      case 'lifeevents':
        return <LifeEventsView />;
      case 'business':
        return <BusinessView />;
      case 'complaints':
        return <ComplaintsView />;
      case 'calendar':
        return <CalendarView />;
      case 'settings':
        return <SettingsView />;
      case 'admin':
        return user.role === 'admin' ? <AdminView /> : <DashboardView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <DashboardLayout>
      {renderActiveView()}
      <AIAssistant />
    </DashboardLayout>
  );
}

export default function Home() {
  return <WorkspaceContent />;
}
