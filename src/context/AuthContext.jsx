import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { app } from "../firebase/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = getAuth(app);
  window.firebaseAuth = auth;
  window.testAPI = async (url, method = 'GET', body = null) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No user is logged in. Please log in first.');
        return null;
      }
      const token = await currentUser.getIdToken();
      console.log('Using token for user:', currentUser.email);
      const options = {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }
      console.log(`Making ${method} request to:`, url);
      const response = await fetch(url, options);
      const data = await response.json();
      console.log('Status:', response.status, response.statusText);
      console.log('Response data:', data);
      return { status: response.status, data };
    } catch (error) {
      console.error('Error testing API:', error.message);
      throw error;
    }
  };
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const signup = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (userCredential.user && name) {
      await updateProfile(userCredential.user, {
        displayName: name
      });
    }
    return userCredential;
  };
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const getToken = async (force = false) => {

    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return await currentUser.getIdToken(force);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, resetPassword, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);