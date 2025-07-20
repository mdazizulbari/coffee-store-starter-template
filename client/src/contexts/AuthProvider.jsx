import { auth } from "../firebase/firebase.init";
import { AuthContext } from "./AuthContext";
import { useEffect, useState } from "react";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import axios from "axios";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log(loading, user);

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const updateUser = (updatedData) => {
    return updateProfile(auth.currentUser, updatedData);
  };

  const logOut = () => {
    localStorage.removeItem("token");
    // incase the useEffect is slow while logging out
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // post request for jwt using email
      // api end-point: /jwt (post method)
      if (currentUser?.email) {
        axios
          .post(
            `${import.meta.env.VITE_API_URL}/jwt`,
            {
              email: currentUser.email,
            },
            // mandatory to store token in browser cookie
            { withCredentials: true }
          )
          .then((res) => {
            console.log(res.data);
            // to store in localStorage
            // localStorage.setItem("token", res.data.token);
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        localStorage.removeItem("token");
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const authData = {
    user,
    setUser,
    createUser,
    logOut,
    signIn,
    loading,
    setLoading,
    updateUser,
  };
  return <AuthContext value={authData}>{children}</AuthContext>;
};

export default AuthProvider;
