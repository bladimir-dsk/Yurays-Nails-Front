import { ConfigProvider } from "antd";

import { antdTheme } from "@/theme/antdTheme";
import { AppRouter } from "@/routes/AppRouter";
import { NotificationProvider } from "@/components/NotificationProvider";

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <NotificationProvider>
        <AppRouter />
      </NotificationProvider>
    </ConfigProvider>
  );
}

export default App;
