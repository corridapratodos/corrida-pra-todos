import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToaster } from '../components/Toaster';

const logoBase64 = "data:image/png;base64,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";

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" xmlns="http://www.w.g.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
        <path fill="#FF3D00" d="M6.306 14.691c-1.645 3.356-2.67 7.21-2.67 11.31s1.025 7.954 2.67 11.31l-5.657 5.657C-1.045 38.031-2 31.885-2 26s.955-12.031 3.451-16.968l5.512 5.659z" transform="translate(2, 2)"/>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-5.657-5.657C30.072 34.667 27.222 36 24 36c-5.223 0-9.657-3.343-11.303-7.917l-5.657 5.657C9.333 39.526 15.986 44 24 44z"/>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.657 5.657C39.999 35.841 44 30.865 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
);


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithPassword, signUp, signInWithGoogle } = useAuth();
  const { addToast } = useToaster();

  const handleGoogleLogin = async () => {
    setLoading(true);
    await signInWithGoogle();
    // The user will be redirected by Supabase, so no need to setLoading(false)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let error = null;

    if (isRegister) {
        const { error: signUpError } = await signUp({
            email,
            password,
            name,
            dob,
            sex,
            height: parseInt(height, 10),
            initialWeight: parseFloat(weight),
        });
        error = signUpError;
    } else {
        const { error: signInError } = await signInWithPassword({ email, password });
        error = signInError;
    }

    if (error) {
        addToast({ message: error.message || 'Ocorreu um erro.', type: 'error'});
    }
    // On success, the AuthProvider's onAuthStateChange will handle navigation automatically.
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/1600/900?blur=5&grayscale')"}}>
       <div className="absolute inset-0 bg-black/60"></div>
      <div className="w-full max-w-md p-8 space-y-6 bg-dark-card rounded-xl shadow-2xl z-10">
        <div className="text-center">
          <img src={logoBase64} alt="Corrida Pra Todos Logo" className="w-24 h-24 mx-auto rounded-full mb-4 object-cover" />
          <h1 className="text-3xl font-extrabold text-light-text tracking-tight">
            Bem-vindo(a)
          </h1>
          <p className="mt-2 text-medium-text">{isRegister ? "Crie sua conta para começar" : "Faça login para continuar sua jornada"}</p>
        </div>

        <div className="space-y-4">
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-dark-border rounded-md shadow-sm text-sm font-medium text-dark-text bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-dark-card transition-colors disabled:opacity-50"
            >
                <GoogleIcon />
                Entrar com o Google
            </button>

            <div className="flex items-center">
                <hr className="flex-grow border-dark-border" />
                <span className="px-2 text-xs text-medium-text">OU</span>
                <hr className="flex-grow border-dark-border" />
            </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {isRegister && (
              <>
                <div>
                  <label htmlFor="name" className="sr-only">Nome</label>
                  <input id="name" name="name" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-dark-border bg-gray-700 text-light-text placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 text-sm rounded-t-md" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="dob" className="sr-only">Data de Nascimento</label>
                    <input id="dob" name="dob" type="date" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-dark-border bg-gray-700 text-light-text placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 text-sm" placeholder="Data de Nascimento" value={dob} onChange={(e) => setDob(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="sex" className="sr-only">Sexo</label>
                    <select id="sex" name="sex" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-dark-border bg-gray-700 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 text-sm" value={sex} onChange={(e) => setSex(e.target.value as 'male' | 'female' | 'other')}>
                        <option value="male">Masculino</option>
                        <option value="female">Feminino</option>
                        <option value="other">Outro</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="height" className="sr-only">Altura (cm)</label>
                    <input id="height" name="height" type="number" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-dark-border bg-gray-700 text-light-text placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 text-sm" placeholder="Altura (cm)" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="weight" className="sr-only">Peso (kg)</label>
                    <input id="weight" name="weight" type="number" step="0.1" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-dark-border bg-gray-700 text-light-text placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 text-sm" placeholder="Peso (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
              </>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-dark-border bg-gray-700 text-light-text placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 text-sm ${isRegister ? '' : 'rounded-t-md'}`} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
             <div>
                <label htmlFor="password-address" className="sr-only">Password</label>
                <input id="password-address" name="password" type="password" required className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-dark-border bg-gray-700 text-light-text placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 text-sm rounded-b-md`} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-dark-card transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Processando...' : (isRegister ? 'Registrar' : 'Entrar')}
            </button>
          </div>
        </form>
         <div className="text-sm text-center">
            <button onClick={() => setIsRegister(!isRegister)} className="font-medium text-brand-secondary hover:text-brand-primary">
                {isRegister ? "Já tem uma conta? Faça login" : "Não tem uma conta? Registre-se"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
