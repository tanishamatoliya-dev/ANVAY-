import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/therapist/Dashboard';
import { ClientsPage } from './pages/therapist/Clients';
import { SchedulePage } from './pages/therapist/Schedule';
import { NotesPage } from './pages/therapist/Notes';
import { PaymentsPage } from './pages/therapist/Payments';
import { AnalyticsPage } from './pages/therapist/Analytics';
import { MessagesPage } from './pages/therapist/Messages';
import { ProfileSettingsPage } from './pages/therapist/ProfileSettings';
import { SubscriptionPage } from './pages/therapist/SubscriptionPage';
import { BookingPage } from './pages/client/BookingPage';
import { ClientPortal } from './pages/client/ClientPortal';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicy';
import { TermsConditionsPage } from './pages/legal/TermsConditions';
import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { AddClientModal } from './components/crm/AddClientModal';
import { BookAppointmentModal } from './components/scheduling/BookAppointmentModal';
import { ClientDetailModal } from './components/crm/ClientDetailModal';

function AppContent() {
  const { user, therapist, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Global modals
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showBookAppointmentModal, setShowBookAppointmentModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showClientDetailModal, setShowClientDetailModal] = useState(false);
  const [preselectedClientForAppt, setPreselectedClientForAppt] = useState<{ id: string; name: string } | null>(null);
  const [preselectedClientForNote, setPreselectedClientForNote] = useState<string | undefined>(undefined);

  // Sync route with window pathname or default view
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/t/')) {
      const slug = path.replace('/t/', '').split('/')[0];
      if (slug) setCurrentTab(`public_booking_${slug}`);
    } else if (path === '/privacy-policy') {
      setCurrentTab('privacy-policy');
    } else if (path === '/terms-and-conditions') {
      setCurrentTab('terms-and-conditions');
    } else if (path === '/portal') {
      setCurrentTab('portal');
    }
  }, []);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbf9] flex flex-col items-center justify-center text-xs text-[#637068] space-y-3">
        <div className="w-8 h-8 rounded bg-[#1e2321] text-white flex items-center justify-center font-serif text-lg font-bold animate-pulse">
          U
        </div>
        <span>Initializing UNLOX clinical platform...</span>
      </div>
    );
  }

  // Handle Public Profile / Booking URL (/t/:slug)
  if (currentTab.startsWith('public_booking_')) {
    const slug = currentTab.replace('public_booking_', '');
    return <BookingPage slug={slug} onNavigate={handleNavigate} />;
  }

  // Handle Legal & Landing Pages without app shell
  if (currentTab === 'landing' || (!user && currentTab === 'dashboard')) {
    return <LandingPage onNavigate={handleNavigate} />;
  }

  if (currentTab === 'login') {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  if (currentTab === 'register') {
    return <RegisterPage onNavigate={handleNavigate} />;
  }

  if (currentTab === 'privacy-policy') {
    return <PrivacyPolicyPage onNavigate={handleNavigate} />;
  }

  if (currentTab === 'terms-and-conditions') {
    return <TermsConditionsPage onNavigate={handleNavigate} />;
  }

  // Client Portal View (when user.role === 'client' or tab === 'portal')
  if (user?.role === 'client' || currentTab === 'portal') {
    return (
      <div className="min-h-screen bg-[#fbfbf9] flex flex-col text-[#1e2321]">
        <Navbar currentTab={currentTab} onNavigate={handleNavigate} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <ClientPortal />
        </main>
        <Footer onNavigate={handleNavigate} />
      </div>
    );
  }

  // Therapist Application Shell
  return (
    <div className="min-h-screen bg-[#fbfbf9] flex flex-col text-[#1e2321]">
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Editorial Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          onOpenAIModal={() => setShowAIModal(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigate={handleNavigate}
              onOpenAddClient={() => setShowAddClientModal(true)}
              onOpenBookAppointment={() => setShowBookAppointmentModal(true)}
              onOpenCreateNote={() => {
                setPreselectedClientForNote(undefined);
                setCurrentTab('notes');
              }}
              onOpenAIModal={() => setShowAIModal(true)}
              onSelectClient={(c) => {
                setSelectedClientId(c._id || c.id);
                setShowClientDetailModal(true);
              }}
            />
          )}

          {currentTab === 'clients' && (
            <ClientsPage
              onOpenBookAppointment={(cId, cName) => {
                setPreselectedClientForAppt({ id: cId, name: cName });
                setShowBookAppointmentModal(true);
              }}
              onOpenCreateNote={(cId) => {
                setPreselectedClientForNote(cId);
                setCurrentTab('notes');
              }}
            />
          )}

          {currentTab === 'schedule' && <SchedulePage />}

          {currentTab === 'notes' && (
            <NotesPage
              onOpenAIModal={() => setShowAIModal(true)}
              preselectedClientId={preselectedClientForNote}
            />
          )}

          {currentTab === 'payments' && <PaymentsPage />}

          {currentTab === 'analytics' && <AnalyticsPage onNavigate={handleNavigate} />}

          {currentTab === 'messages' && <MessagesPage />}

          {currentTab === 'profile' && <ProfileSettingsPage onNavigate={handleNavigate} />}

          {currentTab === 'subscription' && <SubscriptionPage />}
        </main>
      </div>

      <Footer onNavigate={handleNavigate} />

      {/* Global Modals */}
      <AIAssistantModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />

      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onClientAdded={() => {
          // If on clients page or dashboard, will refresh
        }}
      />

      <BookAppointmentModal
        isOpen={showBookAppointmentModal}
        onClose={() => {
          setShowBookAppointmentModal(false);
          setPreselectedClientForAppt(null);
        }}
        onAppointmentBooked={() => {
          // Refresh
        }}
        preselectedClientId={preselectedClientForAppt?.id}
        preselectedClientName={preselectedClientForAppt?.name}
      />

      <ClientDetailModal
        clientId={selectedClientId}
        isOpen={showClientDetailModal}
        onClose={() => {
          setShowClientDetailModal(false);
          setSelectedClientId(null);
        }}
        onClientUpdated={() => {}}
        onOpenBookAppointment={(cId, cName) => {
          setShowClientDetailModal(false);
          setPreselectedClientForAppt({ id: cId, name: cName });
          setShowBookAppointmentModal(true);
        }}
        onOpenCreateNote={(cId) => {
          setShowClientDetailModal(false);
          setPreselectedClientForNote(cId);
          setCurrentTab('notes');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}
