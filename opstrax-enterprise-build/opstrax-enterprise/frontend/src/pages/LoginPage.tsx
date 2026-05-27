import { useNavigate } from 'react-router-dom';
import { LockKeyhole, RadioTower, ShieldCheck } from 'lucide-react';
import { postData } from '../services/api';

const demoUsers = ['admin@opstrax.com', 'dispatcher@opstrax.com', 'driver@opstrax.com', 'mechanic@opstrax.com', 'customer@opstrax.com'];

export default function LoginPage() {
  const navigate = useNavigate();

  async function login(email: string) {
    const session = await postData<{ token: string; user: { name: string; email: string; role: string; company: string } }>('/auth/login', { email, password: 'Admin@12345' });
    localStorage.setItem('opstrax_token', session.token);
    localStorage.setItem('opstrax_user', JSON.stringify(session.user));
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#12314a,#07111f_45%,#050a12)] text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.1fr_.9fr]">
        <section>
          <div className="mb-8 inline-flex items-center gap-3 rounded-md border border-teal/30 bg-teal/10 px-4 py-2 text-sm text-teal-100">
            <RadioTower size={18} /> Enterprise command-center SaaS
          </div>
          <h1 className="text-5xl font-semibold leading-tight md:text-6xl">OpsTrax Transport Management Solution</h1>
          <p className="mt-5 max-w-2xl text-xl text-slate-300">Connected transport. Intelligent control. Enterprise execution.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {['JWT-ready access', 'Tenant-aware data', 'Live telemetry stream'].map((item) => (
              <div key={item} className="rounded-lg border border-line bg-white/5 p-4">
                <ShieldCheck className="text-teal-200" size={22} />
                <p className="mt-3 text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-line bg-panel/90 p-6 shadow-2xl shadow-black/30">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-teal font-black text-navy">OT</div>
            <div>
              <h2 className="text-2xl font-semibold">Secure demo login</h2>
              <p className="text-sm text-slate-400">Choose an enterprise role to enter the workspace.</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {demoUsers.map((email) => (
              <button key={email} onClick={() => login(email)} className="flex w-full items-center justify-between rounded-md border border-line bg-navy px-4 py-3 text-left text-sm hover:border-teal">
                <span>{email}</span>
                <LockKeyhole size={16} className="text-teal-200" />
              </button>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500">Demo password: Admin@12345. The API returns a token, role, user profile, and company context.</p>
        </section>
      </div>
    </div>
  );
}
