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
  const isMobile = !screens.md; // < 768px

  const [collapsed, setCollapsed] = useState(false);

  // auto-colapsar cuando entra a móvil
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
        collapsedWidth={isMobile ? 0 : SIDER_WIDTH_COLLAPSED} // 👈 en móvil se oculta del todo
        breakpoint="md"
        className="bg-gray-900"
        style={{
          height: "100vh",
          position: isMobile ? "fixed" : "sticky", // 👈 overlay en móvil, no empuja contenido
          top: 0,
          left: 0,
          zIndex: 100,
        }}
      >
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-white/10">
          <span className="text-lg font-semibold tracking-tight text-white">
            {collapsed ? "YN" : "YURAY'S NAILS"}
          </span>
        </div>
        <Navbar onNavigate={() => isMobile && setCollapsed(true)} />
      </Sider>

      {/* Overlay oscuro cuando el sider está abierto en móvil */}
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
        }}
        className="z-110 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition-colors hover:text-gray-900"
      >
        {collapsed ? (
          <MenuUnfoldOutlined style={{ fontSize: 12 }} />
        ) : (
          <MenuFoldOutlined style={{ fontSize: 12 }} />
        )}
      </button>

      <Layout style={{ marginLeft: isMobile ? 0 : undefined }}>
        <Content className="bg-gray-50 p-3 sm:p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
