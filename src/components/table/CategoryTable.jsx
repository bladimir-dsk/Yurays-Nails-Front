import { ProTable } from "@ant-design/pro-components";
import { Button, Input, Popconfirm, Space, Table, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import React, { useRef } from "react";

export default function CategoryTable({
  dataSource = [],
  loading = false,
  total = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onSearch,
  onEdit,
  onDelete,
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
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      width: 260,
      fixed: "left",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            ref={searchInputRef}
            placeholder="Buscar nombre..."
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => handleSearch(selectedKeys[0], confirm)}
            style={{ marginBottom: 8, display: "block", width: 200 }}
          />
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<SearchOutlined />}
              onClick={() => handleSearch(selectedKeys[0], confirm)}
              style={{ width: 90 }}
            >
              Buscar
            </Button>
            <Button
              size="small"
              onClick={() => handleReset(clearFilters, confirm)}
              style={{ width: 90 }}
            >
              Limpiar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#4f46e5" : undefined }} />
      ),
      onFilter: () => true,
      filterDropdownProps: {
        onOpenChange: (open) => {
          if (open) setTimeout(() => searchInputRef.current?.focus(), 100);
        },
      },
      render: (name) => (
        <span className="font-medium text-gray-800">{name}</span>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 100,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar categoría">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Eliminar categoría"
            description={`¿Seguro que deseas eliminar "${record.name}"?`}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete?.(record)}
          >
            <Tooltip title="Eliminar categoría">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="category-table-wrapper">
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id_category"
        search={false}
        toolBarRender={false}
        options={{
          reload: false,
          density: false,
          setting: false,
          fullScreen: false,
        }}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: (total) => `Total ${total} categorías`,
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
