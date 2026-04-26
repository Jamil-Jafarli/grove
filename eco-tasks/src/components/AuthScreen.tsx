import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--e-bg)' }}>
      {/* Hero section */}
      <div
        className="flex-none px-6 pt-16 pb-10 flex flex-col items-center text-center"
        style={{ background: 'linear-gradient(160deg, #063232 0%, #2B5151 100%)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg"
          style={{ background: 'rgba(194,223,147,0.18)', border: '1px solid rgba(194,223,147,0.3)' }}
        >
          🌿
        </div>
        <h1 className="text-3xl font-extrabold tracking-wide text-white mb-1">GROVE</h1>
        <p className="text-sm font-medium" style={{ color: 'rgba(194,223,147,0.85)' }}>
          Ekoloji vərdişlər üçün tətbiq
        </p>

        {/* Decorative pills */}
        <div className="flex gap-2 mt-5 flex-wrap justify-center">
          {['🌱 Streak sistemi', '🏆 Mükafatlar', '🗺️ Problemlər', '⭐ Liderlik'].map(t => (
            <span
              key={t}
              className="text-[11px] font-semibold px-3 py-1 rounded-full"
              style={{ background: 'rgba(194,223,147,0.12)', color: 'rgba(194,223,147,0.85)', border: '1px solid rgba(194,223,147,0.2)' }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 flex items-start justify-center px-4 -mt-4">
        <div className="w-full max-w-sm enviro-card p-6 shadow-lg">
          {/* Mode switcher */}
          <div
            className="flex p-1 rounded-xl mb-5"
            style={{ background: 'var(--e-bg)', border: '1px solid var(--e-border)' }}
          >
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={
                  mode === m
                    ? { background: 'var(--e-dark)', color: 'var(--e-green)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }
                    : { color: 'var(--e-muted)' }
                }
              >
                {m === 'login' ? 'Giriş' : 'Qeydiyyat'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--e-dark)' }}>
                  İstifadəçi adı
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="istifadeciadı"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                  style={{
                    border: '1.5px solid var(--e-border)',
                    background: 'var(--e-bg)',
                    color: 'var(--e-text)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--e-dark)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--e-border)')}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--e-dark)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="siz@email.com"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid var(--e-border)',
                  background: 'var(--e-bg)',
                  color: 'var(--e-text)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--e-dark)')}
                onBlur={e => (e.target.style.borderColor = 'var(--e-border)')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--e-dark)' }}>
                Şifrə
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="ən azı 6 simvol"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid var(--e-border)',
                  background: 'var(--e-bg)',
                  color: 'var(--e-text)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--e-dark)')}
                onBlur={e => (e.target.style.borderColor = 'var(--e-border)')}
              />
            </div>

            {error && (
              <div
                className="text-sm rounded-xl px-3 py-2.5"
                style={{ background: '#FFF1F2', color: '#BE123C', border: '1px solid #FECDD3' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3 rounded-xl transition-all text-sm mt-1 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'var(--e-dark)', color: 'var(--e-green)' }}
            >
              {loading ? 'Gözləyin...' : mode === 'login' ? 'Daxil ol →' : 'Qeydiyyatdan keç →'}
            </button>
          </form>
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
