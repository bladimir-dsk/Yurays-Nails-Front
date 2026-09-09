import { ProTable } from "@ant-design/pro-components";
import { Button, Space, Tag } from "antd";

export default function StudentsTable({
  dataSource = [],
  loading = false,
  total = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onEdit,
}) {
  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },

    {
      title: "Correo",
      dataIndex: "email",
      key: "email",
    },

    {
      title: "Teléfono",
      dataIndex: "phone",
      key: "phone",
    },

    {
      title: "Pago",
      dataIndex: "payment",
      key: "payment",
      render: (value) => `$${value}`,
    },

    {
      title: "Empresa",
      dataIndex: ["empresa", "name"],
      key: "empresa",
      render: (_, record) => <Tag color="blue">{record.empresa?.name}</Tag>,
    },

    {
      title: "Creado por",
      dataIndex: "creatorName",
      key: "creatorName",
    },

    {
      title: "Fecha de registro",
      dataIndex: "created_at",
      key: "created_at",
      render: (value) => new Date(value).toLocaleDateString("es-MX"),
    },

    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onEdit(record)}>
            Editar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <ProTable
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey="id_student"
      search={false}
      options={false}
      scroll={{ x: 900 }} // 👈 fuerza scroll horizontal en vez de aplastar columnas
      pagination={{
        current: currentPage,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} estudiantes`,
        responsive: true, // 👈 simplifica el paginador en pantallas chicas
      }}
      onChange={(pagination) => {
        onPageChange(pagination.current, pagination.pageSize);
      }}
    />
  );
}
