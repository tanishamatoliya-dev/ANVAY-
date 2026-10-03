import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, ExternalLink, LogOut, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../api/axiosInstance';

interface NavbarProps {
  currentTab?: string;
  onNavigate?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { user, therapist, logout, quickDemoLogin } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dbHealth, setDbHealth] = useState<any>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data: any = await api.get('/notifications');
      setNotifications(data || []);
    } catch (e) {
      // quiet catch
    }
  };

  const fetchHealth = async () => {
    try {
      const res: any = await api.get('/health');
      setDbHealth(res.database);
    } catch (e) {
      // quiet catch
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchHealth();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (e) {
      // ignore
    }
  };

  return (
    <header className="h-16 border-b border-[#e7e5dc] bg-[#fdfdfc] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Context */}
      <div className="flex items-center gap-6">
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

        {/* Database & Runtime Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f4f3ef] border border-[#e2dfd5] text-[11px] text-[#48534d]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>{dbHealth?.connected ? 'Atlas Connected' : 'Standalone Mode Active'}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Role Switcher for instant testing */}
        <div className="hidden sm:flex items-center bg-[#f4f3ef] p-0.5 rounded border border-[#e2dfd5] text-xs">
          <button
            onClick={() => quickDemoLogin('therapist')}
            className={`px-2.5 py-1 rounded transition-colors text-[11px] font-medium ${
              user?.role === 'therapist'
                ? 'bg-[#1e2321] text-white shadow-xs'
                : 'text-[#5b6560] hover:text-[#1e2321]'
            }`}
            title="Switch to Therapist view (Dr. Clara Vance)"
          >
            Therapist View
          </button>
          <button
            onClick={() => quickDemoLogin('client')}
            className={`px-2.5 py-1 rounded transition-colors text-[11px] font-medium ${
              user?.role === 'client'
                ? 'bg-[#1e2321] text-white shadow-xs'
                : 'text-[#5b6560] hover:text-[#1e2321]'
            }`}
            title="Switch to Client Portal view (Julian Ross)"
          >
            Client Portal
          </button>
        </div>

        {/* Public Booking Link (if therapist) */}
        {therapist && (
          <button
            onClick={() => onNavigate && onNavigate(`public_booking_${therapist.slug}`)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2d3831] bg-[#f4f3ef] hover:bg-[#eae8df] border border-[#d9d5c8] rounded transition-colors"
          >
            <span>Public Profile</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#5e6963]" />
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded flex items-center justify-center text-[#404b44] hover:bg-[#f4f3ef] border border-transparent hover:border-[#e2dfd5] transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#92400e] rounded-full ring-2 ring-[#fdfdfc]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#dedad0] rounded shadow-lg z-50 overflow-hidden">
              <div className="p-3.5 border-b border-[#eeece4] flex items-center justify-between bg-[#fbfbf9]">
                <span className="font-serif-editorial text-base font-semibold text-[#1e2321]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-[#4d5c52] hover:text-[#1e2321] underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#f2f0ea]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#7d8681]">
                    No notifications at this time.
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

        {/* User Avatar & Logout */}
        {user ? (
          <div className="flex items-center gap-3 pl-2 border-l border-[#e7e5dc]">
            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold text-[#1e2321] leading-tight">{user.name}</p>
              <p className="text-[10px] text-[#717a75] capitalize tracking-wide">{user.role}</p>
            </div>
            <button
              onClick={logout}
              title="Sign out of ANVAY"
              className="w-9 h-9 rounded flex items-center justify-center text-[#55615a] hover:text-[#991b1b] hover:bg-[#fbf2f2] border border-[#e2dfd5] transition-colors"
            >
              <LogOut className="w-4 h-4" />
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
  );
};
