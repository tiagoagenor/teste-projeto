import React, { useState } from 'react';
import axios from 'axios';
import { X, LogIn, UserPlus, Film } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    login: '',
    password: '',
    name: '',
    username: '',
    email: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const res = await axios.post('/api/auth/register', {
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
          bio: form.bio
        });
        localStorage.setItem('filmow_token', res.data.token);
        onLoginSuccess(res.data.user);
        onClose();
      } else {
        const res = await axios.post('/api/auth/login', {
          login: form.login,
          password: form.password
        });
        localStorage.setItem('filmow_token', res.data.token);
        onLoginSuccess(res.data.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl glass-modal border border-slate-800 shadow-2xl p-6 sm:p-8">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 mx-auto mb-3 shadow-lg shadow-amber-500/20">
            <Film className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {isRegister ? 'Criar Conta no Filmow' : 'Entrar na sua Conta'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister ? 'Junte-se à comunidade de amantes de cinema' : 'Acesse seu perfil, filmes assistidos e listas'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo</label>
                <input 
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="ex: Tiago Silva"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome de Usuário (Username)</label>
                <input 
                  type="text"
                  name="username"
                  required
                  value={form.username}
                  onChange={handleChange}
                  placeholder="ex: tiagocinema"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
                <input 
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Biografia (Bio)</label>
                <input 
                  type="text"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Qual o seu gênero de filme favorito?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail ou Username</label>
              <input 
                type="text"
                name="login"
                required
                value={form.login}
                onChange={handleChange}
                placeholder="digite seu email ou username"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Senha</label>
            <input 
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {loading ? 'Aguarde...' : isRegister ? 'Criar Minha Conta' : 'Entrar na Conta'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {isRegister ? 'Já tem uma conta?' : 'Ainda não possui conta?'}{' '}
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-amber-400 font-bold underline hover:text-amber-300 ml-1 cursor-pointer"
          >
            {isRegister ? 'Fazer Login' : 'Cadastre-se grátis'}
          </button>
        </div>

      </div>
    </div>
  );
}
