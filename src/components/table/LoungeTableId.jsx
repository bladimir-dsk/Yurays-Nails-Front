import { ProTable } from "@ant-design/pro-components";
import { Button, Space } from "antd";
import React from "react";

export default function LoungeTableId({
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
      title: "ID",
      dataIndex: "id_salon",
      key: "id_salon",
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },

    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onEdit(record)}>
            Agregar accesos
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
      rowKey="id_salon"
      search={false}
      options={false}
      scroll={{ x: 900 }} // 👈 fuerza scroll horizontal en vez de aplastar columnas
      pagination={{
        current: currentPage,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} salones`,
        responsive: true, // 👈 simplifica el paginador en pantallas chicas
      }}
      onChange={(pagination) => {
        onPageChange(pagination.current, pagination.pageSize);
      }}
    />
  );
}
