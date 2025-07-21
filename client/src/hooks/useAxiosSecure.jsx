import axios from "axios";
import { use } from "react";
import { AuthContext } from "../contexts/AuthContext";

const useAxiosSecure = () => {
  const { user, logOut } = use(AuthContext);
  // token for local storage
  // const token= localStorage.getItem('token')

  // token for firebase jwt
  const token = user?.accessToken;
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // intercept or send cookie data to serer
    withCredentials: true,
  });

  // intercept requests for firebase jwt
  axiosInstance.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  //   intercept requests for localstorage
  // const token = localStorage.getItem("token");
  // axiosInstance.interceptors.request.use((config) => {
  //   config.headers.Authorization = `Bearer ${token}`;
  //   return config;
  // });

  //   intercept response for localstorage and firebase
  axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.status === 401 || err.status === 403) {
        logOut()
          .then(() => {
            console.log(
              `You are logged out because of an error with ${err.status} code.`
            );
          })
          .catch((err) => {
            console.log(err);
          });
      }
      return Promise.reject(err);
    }
  );

  return axiosInstance;
};

export default useAxiosSecure;
