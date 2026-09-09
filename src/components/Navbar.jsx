import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  TableOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/category", icon: <TableOutlined />, label: "Categorías" },
    { key: "/product", icon: <UserOutlined />, label: "Productos" },
    {
      icon: <ScheduleOutlined />,
      label: "Ventas",
      children: [
        { key: "/acces", label: "Lista de ingresos" },
        { key: "/add-access", label: "Agregar ingreso" },
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
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[location.pathname]}
      items={items}
      onClick={({ key }) => navigate(key)}
      className="border-none bg-transparent"
      style={{ background: "transparent" }}
    />
  );
}
