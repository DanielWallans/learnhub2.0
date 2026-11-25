import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { onPasswordRecovery } from '@/lib/auth';
import { chegouPorRecuperacao } from '@/lib/supabase';
import Home from '@/features/landing/HomePage';
import Loading from '@/components/layout/Loading';
import PrivateRoute from '@/app/PrivateRoute';
import { AppShell } from '@/components/layout/AppShell';
import { AuthProvider } from '@/context/AuthContext';
import { StudentProvider } from '@/context/StudentContext';
import { FeedbackProvider } from '@/components/ui/feedback';

// Cada tela baixa o próprio código só quando é aberta
const Login = lazy(() => import('@/features/auth/LoginPage'));
const Cadastros = lazy(() => import('@/features/auth/AdminSignupPage'));
const CadastroAluno = lazy(() => import('@/features/auth/SignupPage'));
const ForgotPassword = lazy(() => import('@/features/auth/ForgotPasswordPage'));
const ResetPassword = lazy(() => import('@/features/auth/ResetPasswordPage'));
const BoasVindas = lazy(() => import('@/features/auth/WelcomePage'));
const Dashboard = lazy(() => import('@/features/painel/PainelPage'));
const Leitura = lazy(() => import('@/features/leitura/LeituraPage'));
const ModuloFinancas = lazy(() => import('@/features/financas/FinancasPage'));
const Habilidades = lazy(() => import('@/features/habilidades/HabilidadesPage'));
const ModuloCarreira = lazy(() => import('@/features/carreira/CarreiraPage'));
const Tarefas = lazy(() => import('@/features/tarefas/TarefasPage'));
const Projetos = lazy(() => import('@/features/projetos/ProjetosPage'));

// Quem abre o link de "esqueci a senha" vai para a tela de nova senha, em qualquer página que caia
function RecuperacaoDeSenha() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (chegouPorRecuperacao && pathname !== '/redefinir-senha') navigate('/redefinir-senha', { replace: true });
    return onPasswordRecovery(() => navigate('/redefinir-senha', { replace: true }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function App() {
  return (
    <AuthProvider>
      <StudentProvider>
        <FeedbackProvider>
          <Router>
            <RecuperacaoDeSenha />
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/esqueci-senha" element={<ForgotPassword />} />
                <Route path="/recuperar-senha" element={<ForgotPassword />} />
                <Route path="/redefinir-senha" element={<ResetPassword />} />
                <Route path="/cadastros" element={<Cadastros />} />
                <Route path="/cadastro-aluno" element={<CadastroAluno />} />
                <Route path="/login-aluno" element={<Navigate to="/login" replace />} />

                {/* Rotas do estudante (exigem login) */}
                <Route
                  path="/boas-vindas"
                  element={
                    <PrivateRoute>
                      <BoasVindas />
                    </PrivateRoute>
                  }
                />
                <Route
                  element={
                    <PrivateRoute>
                      <AppShell />
                    </PrivateRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/leitura" element={<Leitura />} />
                  <Route path="/financas" element={<ModuloFinancas />} />
                  <Route path="/habilidades" element={<Habilidades />} />
                  <Route path="/carreira" element={<ModuloCarreira />} />
                  <Route path="/tarefas" element={<Tarefas />} />
                  <Route path="/projetos" element={<Projetos />} />
                </Route>

                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </FeedbackProvider>
      </StudentProvider>
    </AuthProvider>
  );
}

export default App;
