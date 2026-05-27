import React from "react";
import { ToastContainer } from "react-toastify";

const Toast = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      className="custom-toast-container"
      toastClassName="custom-toast"
      progressClassName="custom-progress-bar"
    />
  );
};

export default Toast;
