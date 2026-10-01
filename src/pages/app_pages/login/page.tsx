'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { Lock, UserCheck, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const { user, login, loginWithGoogle, register, quickLoginAsAdmin, quickLoginAsMember } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatic Role Discrimination & Redirection
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/miembros/admin');
      } else {
        router.push('/miembros');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        const res = await register(name, username, email, password);
        if (!res.success) {
          setErrorMessage(res.message || 'Error al registrar la nueva cuenta.');
        }
      } else {
        const inputToLogin = email.trim() || username.trim();
        const res = await login(inputToLogin, password);
        if (!res.success) {
          setErrorMessage(res.message || 'Error de autenticación. Verifica tus credenciales.');
        } else if (res.role) {
          if (res.role === 'admin') router.push('/miembros/admin');
          else router.push('/miembros');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error inesperado en el servidor de autenticación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMessage(res.message || 'No se pudo completar el acceso con Google.');
      } else if (res.role) {
        if (res.role === 'admin') router.push('/miembros/admin');
        else router.push('/miembros');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el proveedor de Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-10 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] text-white flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(6,182,212,0.35)]">
          {isRegisterMode ? <UserCheck size={28} /> : <Lock size={26} />}
        </div>

        <h1 className="font-syne text-2xl sm:text-3xl font-bold text-white mb-2">
          {isRegisterMode ? 'Registro de Nuevo Miembro' : 'Acceso de Miembros & Admin'}
        </h1>
        <p className="text-sm text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
          {isRegisterMode
            ? 'Crea tu cuenta de miembro para acceder al catálogo completo, salas 3D y herramientas de creación.'
            : 'Inicia sesión para acceder a la galería 3D, el atelier de investigación y contenidos exclusivos.'}
        </p>
      </div>

      {/* Google Login Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200 hover:border-white/30 disabled:opacity-50"
        >
          <Icons.Google size={18} />
          <span>{isSubmitting ? 'Verificando con Google...' : 'Continuar con Google'}</span>
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="font-mono text-[11px] text-[#94A3B8] uppercase tracking-wider">
          O con tus credenciales
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-medium">
          {errorMessage}
        </div>
      )}

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isRegisterMode && (
          <div>
            <label className="block text-xs font-semibold text-[#06B6D4] mb-1.5 uppercase font-mono tracking-wider">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Lola Romero"
              className="input-field text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        {isRegisterMode && (
          <div>
            <label className="block text-xs font-semibold text-[#06B6D4] mb-1.5 uppercase font-mono tracking-wider">
              Nombre de Usuario *
            </label>
            <input
              type="text"
              required
              placeholder="lolaromero"
              className="input-field text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#06B6D4] mb-1.5 uppercase font-mono tracking-wider">
            {isRegisterMode ? 'Correo Electrónico *' : 'Correo Electrónico o Usuario *'}
          </label>
          <input
            type={isRegisterMode ? 'email' : 'text'}
            required
            placeholder={isRegisterMode ? 'tu-email@ejemplo.com' : 'admin@lolaworkia.com o usuario'}
            className="input-field text-sm"
            value={isRegisterMode ? email : email || username}
            onChange={(e) => {
              if (isRegisterMode) {
                setEmail(e.target.value);
              } else {
                setEmail(e.target.value);
                setUsername(e.target.value);
              }
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#06B6D4] mb-1.5 uppercase font-mono tracking-wider">
            Contraseña *
          </label>
          <input
            type="password"
            required
            placeholder="••••••••••••"
            className="input-field text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn-cyan mt-3 py-3 w-full justify-center text-sm font-bold shadow-[0_4px_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Iniciando sesión...'
          ) : isRegisterMode ? (
            <>Crear Cuenta de Miembro <ArrowRight size={16} /></>
          ) : (
            <>Iniciar Sesión <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      {/* Toggle login vs register mode */}
      <div className="border-t border-white/10 mt-6 pt-5 text-center">
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(!isRegisterMode);
            setErrorMessage('');
          }}
          className="text-xs sm:text-sm text-[#06B6D4] hover:text-[#38BDF8] font-medium transition-colors"
        >
          {isRegisterMode
            ? '¿Ya tienes una cuenta registrada? Inicia Sesión'
            : '¿No tienes cuenta todavía? Regístrate como miembro aquí'}
        </button>
      </div>

      {/* Quick Test / Development Access */}
      <div className="border-t border-white/10 mt-6 pt-5">
        <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider text-center mb-3 flex items-center justify-center gap-1.5">
          <Sparkles size={13} className="text-amber-400" />
          Accesos Rápidos de Prueba (Entorno Local)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={quickLoginAsAdmin}
            className="py-2 px-3 rounded-lg border border-[#06B6D4]/30 bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20 text-[#06B6D4] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShieldCheck size={14} /> Entrar como Admin
          </button>
          <button
            type="button"
            onClick={quickLoginAsMember}
            className="py-2 px-3 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <UserCheck size={14} /> Entrar como Miembro VIP
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="container max-w-lg mx-auto px-4 py-12">
      <Suspense fallback={<div className="font-mono text-xs text-center py-12 text-[#06B6D4]">Cargando módulo de autenticación...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
