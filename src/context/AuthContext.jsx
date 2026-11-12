import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { COL } from '@/lib/collections';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({ currentUser: null, userType: null, checkedUid: null });
  const [initialLoading, setInitialLoading] = useState(true);
  const seq = useRef(0);

  // Descobre o tipo da conta. Estudante tem prioridade: uma conta com perfil em "alunos"
  // é sempre tratada como aluno, mesmo que também exista em "usuarios".
  const resolveUser = useCallback(async (user) => {
    const id = ++seq.current;
    let type = null;

    if (user) {
      try {
        const aluno = await getDoc(doc(db, COL.alunos, user.uid));
        if (aluno.exists()) {
          type = 'aluno';
        } else {
          const admin = await getDoc(doc(db, COL.usuarios, user.uid));
          if (admin.exists()) type = 'admin';
        }
      } catch (error) {
        console.error('AuthContext: erro ao verificar o perfil no Firestore:', error);
      }
    }

    // Só a verificação mais recente vale (evita que uma resposta antiga sobrescreva a nova)
    if (id === seq.current) {
      setState({ currentUser: type ? user : null, userType: type, checkedUid: user ? user.uid : null });
    }
    return type;
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      await resolveUser(user);
      setInitialLoading(false);
    });
  }, [resolveUser]);

  // Logado no Firebase, mas o perfil ainda não foi conferido: as rotas privadas esperam
  const pending = !!auth.currentUser && auth.currentUser.uid !== state.checkedUid;

  const refreshUser = useCallback(() => resolveUser(auth.currentUser), [resolveUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser: state.currentUser,
        userType: state.userType,
        loading: initialLoading || pending,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
