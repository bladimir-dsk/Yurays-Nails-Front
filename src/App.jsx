import { ConfigProvider, theme } from "antd";
import { antdTheme } from "@/theme/antdTheme";
import { AppRouter } from "@/routes/AppRouter";
import { NotificationProvider } from "@/components/NotificationProvider";
import esES from "antd/locale/es_ES";
import { ProConfigProvider } from "@ant-design/pro-components";
import { ThemeProvider, useThemeMode } from "@/context/ThemeContext";

function AppContent() {
  const { isDark } = useThemeMode();

  const themeConfig = {
    ...antdTheme,
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
  };

  return (
    <ConfigProvider theme={themeConfig} locale={esES}>
      <ProConfigProvider>
        <NotificationProvider>
          <AppRouter />
        </NotificationProvider>
      </ProConfigProvider>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
