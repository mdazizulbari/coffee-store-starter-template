import axios from "axios";

const useAxiosSecure = () => {
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });
  //   intercept requests
  const token = localStorage.getItem("token");
  axiosInstance.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  //   intercept response
  axiosInstance.interceptors.response.use((res) => {
    return res.data;
  });

  return axiosInstance;
};

export default useAxiosSecure;
