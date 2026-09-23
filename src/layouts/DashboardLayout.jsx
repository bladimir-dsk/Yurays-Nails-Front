import { Layout, Grid } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const SIDER_WIDTH = 230;
const SIDER_WIDTH_COLLAPSED = 80;

export function DashboardLayout() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  return (
    <Layout style={{ minHeight: "100vh", position: "relative" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={SIDER_WIDTH}
        collapsedWidth={isMobile ? 0 : SIDER_WIDTH_COLLAPSED}
        breakpoint="md"
        style={{
          height: "100vh",
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: 0,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          // capuchino suave, no negro-marrón intenso
          background:
            "linear-gradient(180deg, var(--color-coffee-400) 0%, var(--color-coffee-300) 100%)",
        }}
      >
        <div className="flex h-16 shrink-0 items-center justify-center gap-2 border-b border-coffee-200/20 px-2 bg-black">
          <img
            src="/YNS.png"
            alt="Yuray's Nails"
            className={
              collapsed ? "h-8 w-8 object-contain" : "h-9 w-9 object-contain"
            }
          />
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight text-white">
              YURAY'S NAILS
            </span>
          )}
        </div>

        {/* flex-1 + min-h-0 es clave para que el Navbar no se desborde y genere scroll en la página */}
        <div className="min-h-0 flex-1">
          <Navbar onNavigate={() => isMobile && setCollapsed(true)} />
        </div>
      </Sider>

      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 90,
          }}
        />
      )}

      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          left: isMobile
            ? collapsed
              ? 12
              : SIDER_WIDTH - 14
            : collapsed
              ? SIDER_WIDTH_COLLAPSED
              : SIDER_WIDTH,
          top: 32,
          position: isMobile ? "fixed" : "absolute",
          transition: "left 0.2s",
          background: "var(--color-coffee-50)",
          borderColor: "var(--color-coffee-300)",
        }}
        className="z-110 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-md text-coffee-700 hover:text-coffee-900"
      >
        {collapsed ? (
          <MenuUnfoldOutlined style={{ fontSize: 12 }} />
        ) : (
          <MenuFoldOutlined style={{ fontSize: 12 }} />
        )}
      </button>

      <Layout style={{ marginLeft: isMobile ? 0 : undefined }}>
        <Content className="bg-coffee-50 p-3 sm:p-6 dark:bg-black dark:text-white">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
