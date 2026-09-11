import { ConfigProvider } from "antd";

import { antdTheme } from "@/theme/antdTheme";
import { AppRouter } from "@/routes/AppRouter";
import { NotificationProvider } from "@/components/NotificationProvider";
import esES from "antd/locale/es_ES";
import { ProConfigProvider } from "@ant-design/pro-components";

function App() {
  return (
    <ConfigProvider theme={antdTheme} locale={esES}>
      <ProConfigProvider>
        <NotificationProvider>
          <AppRouter />
        </NotificationProvider>
      </ProConfigProvider>
    </ConfigProvider>
  );
}

export default App;
