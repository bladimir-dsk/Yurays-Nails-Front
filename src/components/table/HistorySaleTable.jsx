import { EyeOutlined } from "@ant-design/icons";
import { Button, Space, Table, Tooltip } from "antd";
import React, { useRef } from "react";

export default function HistorySaleTable({
  dataSource = [],
  loading = false,
  total = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onSearch,
  onEdit,
  onDelete,
  onViewDetail,
}) {
  const searchInputRef = useRef(null);
  const handleSearch = (value, confirm) => {
    onSearch?.(value || "");
    confirm();
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    onSearch?.("");
    confirm();
  };

  const columns = [
    {
      title: "Folio",
      dataIndex: "sale_number",
      key: "sale_number",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Acciones",
      key: "actions",
      width: 100,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalle">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id_sale"
        pagination={{
          current: currentPage,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: (total) => `Total ${total} ventas`,
          responsive: true,
        }}
        onChange={(pagination) => {
          onPageChange(pagination.current, pagination.pageSize);
        }}
        scroll={{ x: 500 }}
        variant="outlined"
        cardBordered={false}
        dateFormatter="string"
      />
    </div>
  );
}
