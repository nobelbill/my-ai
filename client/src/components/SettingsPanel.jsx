import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Save, Bus, Bell } from 'lucide-react';
import { fetchSettings, updateSettings } from '../utils/api';

export default function SettingsPanel({ theme }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) fetchSettings().then(setSettings);
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    await updateSettings(settings);
    setSaving(false);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`fixed top-6 right-6 p-3 rounded-full ${theme.cardBg} shadow-lg border ${theme.border} hover:scale-105 transition-transform z-10`}
      >
        <Settings className={`w-5 h-5 ${theme.icon}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl p-6 ${theme.cardBg} border ${theme.border} shadow-xl`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-bold ${theme.text}`}>⚙️ 설정</h2>
                <button onClick={() => setOpen(false)}>
                  <X className={`w-5 h-5 ${theme.subtext}`} />
                </button>
              </div>

              {settings && (
                <div className="space-y-5">
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-medium ${theme.text} mb-2`}>
                      <Bus className="w-4 h-4" /> 출근 정류장 ID
                    </label>
                    <input
                      type="text"
                      value={settings.commuteStation?.stationId || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        commuteStation: { ...settings.commuteStation, stationId: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-xl border ${theme.border} bg-transparent ${theme.text} text-sm`}
                      placeholder="경기버스 정류장 ID"
                    />
                  </div>

                  <div>
                    <label className={`flex items-center gap-2 text-sm font-medium ${theme.text} mb-2`}>
                      <Bus className="w-4 h-4" /> 퇴근 정류장 ID
                    </label>
                    <input
                      type="text"
                      value={settings.homeStation?.stationId || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        homeStation: { ...settings.homeStation, stationId: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-xl border ${theme.border} bg-transparent ${theme.text} text-sm`}
                      placeholder="서울버스 정류장 ID"
                    />
                  </div>

                  <div>
                    <label className={`flex items-center gap-2 text-sm font-medium ${theme.text} mb-2`}>
                      <Bell className="w-4 h-4" /> 아침 알림 시간
                    </label>
                    <input
                      type="time"
                      value={settings.notifications?.morning || '07:00'}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, morning: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-xl border ${theme.border} bg-transparent ${theme.text} text-sm`}
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`w-full py-2.5 rounded-xl ${theme.badge} font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? '저장 중...' : '설정 저장'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
