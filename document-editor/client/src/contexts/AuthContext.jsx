// authContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Finished loading the user state
    });

    return () => unsubscribe();
  }, []);

  // Function to handle sign-up
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Function to handle login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Function to handle logout
  function logout() {
    return signOut(auth);
  }

  // Function to handle password reset
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Value provided to children components
  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword
  };

  // Only render children once authentication state is loaded
  if (loading) {
    return <div>Loading...</div>; // Optionally show a loading spinner here
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
