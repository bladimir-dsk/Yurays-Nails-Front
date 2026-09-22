import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  TableOutlined,
  ScheduleOutlined,
  BulbOutlined,
  BulbFilled,
} from "@ant-design/icons";
import { Menu, Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useThemeMode } from "@/context/ThemeContext";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeMode();

  const items = [
    { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/category", icon: <TableOutlined />, label: "Categorías" },
    { key: "/product", icon: <UserOutlined />, label: "Productos" },
    {
      icon: <ScheduleOutlined />,
      label: "Ventas",
      children: [
        { key: "/new-sale", label: "Nueva venta" },
        { key: "/sale-history", label: "Historial de ventas" },
      ],
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Configuración",
      children: [
        { key: "/profile", label: "Perfil" },
        { key: "10", label: "Option 10" },
        { key: "11", label: "Option 11" },
        { key: "12", label: "Option 12" },
      ],
    },
  ];

  return (
    <div>
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
        className="border-none bg-transparent"
        style={{ background: "transparent" }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", padding: 8 }}>
        <Button
          type="text"
          icon={isDark ? <BulbFilled /> : <BulbOutlined />}
          onClick={toggleTheme}
          style={{ color: "#fff" }}
        />
      </div>
    </div>
  );
}
