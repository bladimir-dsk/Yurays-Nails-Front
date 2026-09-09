import { ProTable } from "@ant-design/pro-components";
import React from "react";

export default function AccessTable({
  dataSource = [],
  loading = false,
  total = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onEdit,
}) {
  const columns = [
    { title: "ID", dataIndex: "id_access", key: "id_access" },
    { title: "Hora de ingreso", dataIndex: "scanned_at", key: "scanned_at" },
    {
      title: "Nombre",
      dataIndex: ["student", "name"],
      key: "student.name",
    },
    {
      title: "Salon",
      dataIndex: ["salon", "name"],
      key: "salon.name",
    },
    {
      title: "Tema",
      dataIndex: ["salon", "issue"],
      key: "salon.issue",
    },
  ];

  return (
    <ProTable
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey="id_access"
      search={false}
      options={false}
      scroll={{ x: 900 }} // 👈 fuerza scroll horizontal en vez de aplastar columnas
      pagination={{
        current: currentPage,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} accesos`,
        responsive: true, // 👈 simplifica el paginador en pantallas chicas
      }}
      onChange={(pagination) => {
        onPageChange(pagination.current, pagination.pageSize);
      }}
    />
  );
}
