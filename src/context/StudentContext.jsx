import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { COL } from '@/lib/collections';

// Dados do perfil do aluno (coleção "alunos"), compartilhados pelo layout e pelas páginas
const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const { currentUser } = useAuth();
  const [aluno, setAluno] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setAluno(null);
      return undefined;
    }
    return onSnapshot(doc(db, COL.alunos, currentUser.uid), (snap) => {
      setAluno(snap.exists() ? snap.data() : {});
    });
  }, [currentUser]);

  const nome = aluno?.nomeCompleto || aluno?.nome || '';
  const primeiroNome = nome.split(' ')[0] || 'estudante';

  return (
    <StudentContext.Provider
      value={{ user: currentUser, aluno, nome, primeiroNome, foto: aluno?.foto || '' }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  return useContext(StudentContext);
}
