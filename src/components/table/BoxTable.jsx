import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Space, Table, Tooltip } from "antd";
import React from "react";

export default function BoxTable({
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
      title: "Id",
      dataIndex: "id_caja",
      key: "id_caja",
      width: 90,
      fixed: "left",
    },
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      width: 150,
      render: (value) => {
        if (!value) return "—";

        return new Date(value).toLocaleDateString("es-MX", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "UTC",
        });
      },
    },
    {
      title: "Saldo inicial",
      dataIndex: "saldo_inicial",
      key: "saldo_inicial",
      width: 150,
      align: "right",
      render: (value) =>
        `$${Number(value ?? 0).toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      title: "Saldo final",
      dataIndex: "saldo_final",
      key: "saldo_final",
      width: 150,
      align: "right",
      render: (value) =>
        `$${Number(value ?? 0).toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      title: "Total entradas",
      dataIndex: "total_entradas",
      key: "total_entradas",
      width: 160,
      align: "right",
      render: (value) =>
        `$${Number(value ?? 0).toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      title: "Total salidas",
      dataIndex: "total_salidas",
      key: "total_salidas",
      width: 160,
      align: "right",
      render: (value) =>
        `$${Number(value ?? 0).toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 130,
      align: "center",
    },
    {
      title: "Cerrado",
      dataIndex: "closedAt",
      key: "closedAt",
      width: 170,
      render: (value) => {
        if (!value) return "—";

        return new Date(value).toLocaleString("es-MX", {
          dateStyle: "short",
          timeStyle: "short",
        });
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 100,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar caja">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit?.(record)}
            />
          </Tooltip>
          <Tooltip title="Cerrar caja">
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => onEdit?.(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={Array.isArray(dataSource) ? dataSource : []}
      loading={loading}
      rowKey="id_caja"
      pagination={{
        current: currentPage,
        pageSize,
        total,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50, 100],
        showTotal: (total) => `Total ${total} cajas`,
        responsive: true,
        showQuickJumper: true,
      }}
      onChange={(pagination) => {
        onPageChange?.(pagination.current, pagination.pageSize);
      }}
      scroll={{
        x: 1260,
      }}
      bordered={false}
      size="middle"
    />
  );
}
