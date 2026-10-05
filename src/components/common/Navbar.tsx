import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosInstance';
import { 
  Bell, 
  ExternalLink, 
  LogOut, 
  User, 
  Sparkles,
  Compass,
  ArrowRight,
  X
} from 'lucide-react';

interface NavbarProps {
  currentTab?: string;
  onNavigate?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, therapist, logout, quickDemoLogin, isGuestMode, exitGuestMode } = useAuth();
  const [dbHealth, setDbHealth] = useState<{ connected: boolean; type: string } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showGuestBanner, setShowGuestBanner] = useState(true);

  // Check database connectivity
  useEffect(() => {
    api.get('/health')
      .then((data: any) => {
        if (data && data.database) {
          setDbHealth(data.database);
        }
      })
      .catch(() => {
        setDbHealth({ connected: false, type: 'local' });
      });
  }, []);

  // Fetch unread notifications
  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then((data: any) => {
          if (Array.isArray(data)) {
            setNotifications(data);
            setUnreadCount(data.filter((n) => !n.read).length);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/mark-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Interactive Guest Mode Notice Banner */}
      {isGuestMode && showGuestBanner && (
        <div className="bg-[#1e2321] text-[#fbfbf9] px-4 py-2 text-xs border-b border-[#333b36]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[11px] sm:text-xs">
                <strong>Guest Mode:</strong> You are exploring ANVAY with full access to client records, calendar scheduling, SOAP notes, and direct billing.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  exitGuestMode();
                  onNavigate && onNavigate('register');
                }}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white text-[#1e2321] rounded hover:bg-[#eae8e1] transition-colors"
              >
                Create Account
              </button>
              <button
                onClick={() => {
                  exitGuestMode();
                  onNavigate && onNavigate('login');
                }}
                className="text-[11px] text-[#cfd5d1] hover:text-white underline"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowGuestBanner(false)}
                title="Dismiss banner"
                className="text-[#9ea7a2] hover:text-white ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="h-16 border-b border-[#e7e5dc] bg-[#fdfdfc] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
        {/* Brand & Context */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div 
            onClick={() => onNavigate && onNavigate('dashboard')} 
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded bg-[#1e2321] text-[#fbfbf9] flex items-center justify-center font-serif-editorial text-lg font-bold tracking-tight">
              A
            </div>
            <div>
              <span className="font-serif-editorial text-xl font-semibold tracking-wide text-[#1e2321] block leading-none">
                ANVAY
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#727a75] font-medium block mt-0.5">
                Practice Management
              </span>
            </div>
          </div>

          {/* Guest Mode Indicator Badge */}
          {isGuestMode ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f3efe6] border border-[#d8d3c5] text-[11px] text-[#3c4a41] font-medium">
              <Compass className="w-3 h-3 text-emerald-800" />
              <span>Guest Explorer</span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f4f3ef] border border-[#e2dfd5] text-[11px] text-[#48534d]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>{dbHealth?.connected ? 'Atlas Connected' : 'Standalone Active'}</span>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher (Therapist vs Client) */}
          <div className="flex items-center bg-[#f4f3ef] p-0.5 rounded border border-[#e2dfd5] text-xs">
            <button
              onClick={async () => {
                await quickDemoLogin('therapist');
                onNavigate && onNavigate('dashboard');
              }}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-medium ${
                user?.role === 'therapist'
                  ? 'bg-[#1e2321] text-white shadow-xs'
                  : 'text-[#5b6560] hover:text-[#1e2321]'
              }`}
              title="View as Practitioner (Dr. Clara Vance)"
            >
              Therapist View
            </button>
            <button
              onClick={async () => {
                await quickDemoLogin('client');
                onNavigate && onNavigate('portal');
              }}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-medium ${
                user?.role === 'client'
                  ? 'bg-[#1e2321] text-white shadow-xs'
                  : 'text-[#5b6560] hover:text-[#1e2321]'
              }`}
              title="View as Client / Patient (Julian Ross)"
            >
              Client Portal
            </button>
          </div>

          {/* Public Booking Link (if therapist) */}
          {therapist && (
            <button
              onClick={() => onNavigate && onNavigate(`public_booking_${therapist.slug || 'dr-clara-vance'}`)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2d3831] bg-[#f4f3ef] hover:bg-[#eae8df] border border-[#d9d5c8] rounded transition-colors"
            >
              <span>Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#5e6963]" />
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) markAllRead();
              }}
              className="w-8 h-8 rounded flex items-center justify-center text-[#55615a] hover:text-[#1e2321] hover:bg-[#f4f3ef] border border-[#e2dfd5] relative transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-700 text-white text-[9px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-[#e2dfd5] rounded shadow-lg z-50 py-2">
                <div className="px-3 py-1.5 border-b border-[#eeebe3] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#1e2321]">Clinical Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-emerald-800 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-[#f4f2ea]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#717e76]">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n: any) => (
                      <div
                        key={n._id || n.id}
                        className={`p-3 text-xs transition-colors ${n.read ? 'bg-white' : 'bg-[#faf9f5]'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-[#1e2321]">{n.title}</span>
                          <span className="text-[10px] text-[#8e9691] whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[#515c55] mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Status / Account CTAs */}
          {isGuestMode ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#e7e5dc]">
              <button
                onClick={() => {
                  exitGuestMode();
                  onNavigate && onNavigate('register');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1e2321] hover:bg-[#2e3732] rounded shadow-xs"
              >
                Create Account
              </button>
              <button
                onClick={() => {
                  exitGuestMode();
                  onNavigate && onNavigate('login');
                }}
                className="px-2.5 py-1.5 text-xs font-medium text-[#3b4740] hover:bg-[#f2efe6] rounded border border-[#cfcbc0]"
              >
                Sign In
              </button>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-[#e7e5dc]">
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold text-[#1e2321] leading-tight">{user.name}</p>
                <p className="text-[10px] text-[#717a75] capitalize tracking-wide">{user.role}</p>
              </div>
              <button
                onClick={logout}
                title="Sign out of ANVAY"
                className="w-8 h-8 rounded flex items-center justify-center text-[#55615a] hover:text-[#991b1b] hover:bg-[#fbf2f2] border border-[#e2dfd5] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate && onNavigate('login')}
                className="px-3 py-1.5 text-xs font-medium text-[#2d3831] hover:bg-[#f4f3ef] rounded border border-[#d9d5c8]"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate && onNavigate('register')}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2c3430] rounded shadow-xs"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
