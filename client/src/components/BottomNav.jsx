import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Camera, CloudSun, Lightbulb, History } from 'lucide-react';

export default function BottomNav() {
  const { t } = useTranslation();

  const items = [
    { to: '/',           label: t('nav.home',        'Home'),       icon: Home },
    { to: '/detect',     label: t('nav.checkCrop',   'Check Crop'), icon: Camera, centerAction: true },
    { to: '/weather',    label: t('nav.weather',     'Weather'),    icon: CloudSun },
    { to: '/advisories', label: t('nav.advisories',  'Advice'),     icon: Lightbulb },
    { to: '/history',    label: t('nav.history',     'History'),    icon: History },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-pb"
      style={{
        background: 'rgba(248,252,246,0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #C9DEC1',
        boxShadow: '0 -4px 24px rgba(41,67,51,0.08)',
      }}>
      <div className="flex items-center justify-around max-w-md mx-auto px-2 py-1.5">
        {items.map((item) => {
          const Icon = item.icon;

          if (item.centerAction) {
            return (
              <NavLink key={item.to} to={item.to}
                className="flex flex-col items-center justify-center -mt-6 group">
                {({ isActive }) => (
                  <>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, #3F6246, #527A5A)'
                          : 'linear-gradient(135deg, #2E4D35, #527A5A)',
                        boxShadow: '0 6px 20px rgba(41,67,51,0.30)',
                        transform: isActive ? 'scale(1.06)' : 'scale(1)',
                        outline: isActive ? '4px solid #C9DEC1' : 'none',
                        outlineOffset: 2,
                      }}>
                      <Icon className="w-7 h-7 text-white" strokeWidth={2.2} />
                    </div>
                    <span className="text-[10px] font-bold mt-1.5"
                      style={{ color: isActive ? '#2E4D35' : '#527A5A' }}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          }

          return (
            <NavLink key={item.to} to={item.to}
              className="flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all">
              {({ isActive }) => (
                <>
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
                    style={{ background: isActive ? '#EAF4E4' : 'transparent' }}>
                    <Icon className="w-5 h-5 transition-all"
                      strokeWidth={isActive ? 2.5 : 1.8}
                      style={{ color: isActive ? '#294333' : '#899B6A' }} />
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight font-medium"
                    style={{ color: isActive ? '#294333' : '#899B6A' }}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
