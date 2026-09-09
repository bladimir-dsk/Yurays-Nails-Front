import React, { createContext, useContext, useMemo } from "react";
import { notification } from "antd";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [api, contextHolder] = notification.useNotification();

  const notify = useMemo(
    () => ({
      success: (message, description) => {
        api.success({
          message,
          description,
          placement: "topRight",
        });
      },

      error: (message, description) => {
        api.error({
          message,
          description,
          placement: "topRight",
        });
      },

      warning: (message, description) => {
        api.warning({
          message,
          description,
          placement: "topRight",
        });
      },

      info: (message, description) => {
        api.info({
          message,
          description,
          placement: "topRight",
        });
      },
    }),
    [api],
  );

  return (
    <NotificationContext.Provider value={notify}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification debe utilizarse dentro de NotificationProvider",
    );
  }

  return context;
}
