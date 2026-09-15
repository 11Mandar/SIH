import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, KeyRound, User, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("siddiqa.bagwan@chetas.sec");
  const [password, setPassword] = useState("••••••••••••");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please provide an Operator ID and password.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ok = login(username, password);
      setIsSubmitting(false);
      if (ok) {
        navigate("/overview");
      } else {
        setError("Invalid credentials. Operator access denied.");
      }
    }, 400);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-dot-matrix px-4 overflow-hidden selection:bg-accent/25 selection:text-white">
      {/* Large low-opacity watermark ring emblem in the background */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-10"
        aria-hidden="true"
      >
        <img
          src="/Chetas_Icon.svg"
          alt=""
          className="w-[750px] h-[750px] max-w-none transform scale-125 select-none"
        />
      </div>

      {/* Decorative ambient radial glow */}
      <div className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-accent-indigo/10 blur-[130px]" />
      <div className="pointer-events-none absolute h-[350px] w-[350px] rounded-full bg-accent/10 blur-[100px] translate-x-32" />

      {/* Centered Login Card */}
      <div className="relative z-10 w-full max-w-md panel-surface border border-accent/20 rounded-xl p-8 shadow-2xl backdrop-blur-md">
        {/* Chetas Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/Chetas_Icon.svg"
            alt="Chetas Mark"
            className="h-16 w-16 mb-4 animate-status-pulse"
          />
          <h1 className="text-2xl font-bold font-mono tracking-wider text-gradient-brand">
            CHETAS
          </h1>
          <p className="text-xs font-mono text-text-secondary tracking-widest uppercase mt-1">
            Universal Log Pre-Processing Framework
          </p>
          <div className="mt-3 flex items-center gap-2 px-2.5 py-1 rounded bg-surface-raised border border-border text-[11px] font-mono text-text-secondary">
            <Shield size={12} className="text-accent" />
            <span>SOC COMMAND CENTER</span>
          </div>
        </div>

        {/* Error notification area */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-status-error/30 bg-status-error-soft px-3.5 py-2.5 text-xs text-status-error font-mono">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-wider">
              Operator ID / Email
            </label>
            <div className="relative">
              <User
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="analyst@chetas.sec"
                className="w-full rounded-lg border border-border bg-bg/90 px-3.5 py-2.5 pl-10 text-xs font-mono text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-wider">
              Security Key / Password
            </label>
            <div className="relative">
              <KeyRound
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-border bg-bg/90 px-3.5 py-2.5 pl-10 text-xs font-mono text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 font-mono text-xs font-semibold text-white gradient-brand shadow-lg hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <span>{isSubmitting ? "AUTHENTICATING..." : "SIGN IN TO COMMAND"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Footnote */}
        <div className="mt-6 pt-4 border-t border-border/60 text-center">
          <p className="text-[11px] font-mono text-text-muted">
            Restricted Security Operations Platform · Authorized Access Only
          </p>
        </div>
      </div>
    </div>
  );
}
