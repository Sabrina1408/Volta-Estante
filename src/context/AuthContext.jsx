import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { app } from "../firebase/config"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Este listener único gerencia o estado de autenticação.
    // Ele é acionado na inicialização e sempre que o estado de auth muda.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  
  const getToken = async () => {
    // A lógica de loading agora garante que `auth.currentUser` estará disponível.
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return await currentUser.getIdToken(true); // Força a atualização do token.
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, resetPassword, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);