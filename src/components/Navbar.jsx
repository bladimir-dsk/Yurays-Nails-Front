import {
  DashboardOutlined,
  TableOutlined,
  ScheduleOutlined,
  BulbOutlined,
  BulbFilled,
  LogoutOutlined,
} from "@ant-design/icons";

import {
  ChartColumnBig,
  Grid2X2Check,
  PackagePlus,
  PlusCircle,
  ShoppingCartPlus,
  Wallet,
} from "lucide-react";
import { Menu, Button, Popconfirm } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useThemeMode } from "@/context/ThemeContext";

export function Navbar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeMode();

  const items = [
    { key: "/dashboard", icon: <ChartColumnBig />, label: "Dashboard" },
    { key: "/category", icon: <Grid2X2Check />, label: "Categorías" },
    { key: "/product", icon: <PackagePlus />, label: "Productos" },
    {
      icon: <ShoppingCartPlus />,
      label: "Ventas",
      children: [
        {
          key: "/new-sale",
          label: "Nueva venta",
          icon: <PlusCircle size={15} />,
        },
        {
          key: "/sale-history",
          label: "Historial de ventas",
          icon: <Wallet size={15} />,
        },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          items={items}
          onClick={({ key }) => {
            navigate(key);
            onNavigate?.();
          }}
          className="coffee-menu border-none bg-transparent"
          style={{ background: "transparent" }}
        />
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-coffee-200/20 px-3 py-3">
        <Button
          type="text"
          icon={isDark ? <BulbFilled /> : <BulbOutlined />}
          onClick={toggleTheme}
          style={{ color: "var(--color-coffee-100)" }}
        />

        <Popconfirm
          title="¿Cerrar sesión?"
          okText="Sí"
          cancelText="Cancelar"
          onConfirm={handleLogout}
        >
          <Button
            type="text"
            icon={<LogoutOutlined />}
            style={{ color: "var(--color-coffee-100)" }}
          >
            Salir
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
}
