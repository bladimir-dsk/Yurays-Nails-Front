import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, Popconfirm, Space, Table, Tooltip } from "antd";
import React, { useRef } from "react";

export default function ProductTable({
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
      title: "Codigo",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Categoria",
      dataIndex: ["category", "name"],
      key: "category.name",
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
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
              onClick={() => handleSearch(selectedKeys[0], confirm)}
              style={{ width: 90 }}
            >
              Buscar
            </Button>
            <Button
              size="small"
              onClick={() => {
                handleReset(clearFilters, confirm);
              }}
              style={{ width: 90 }}
            >
              Limpiar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) =>
        record.name
          ? record.name.toString().toLowerCase().includes(value.toLowerCase())
          : "",
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInputRef.current?.select(), 100);
        }
      },
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
    },

    {
      title: "Acciones",
      key: "actions",
      width: 100,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar producto">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Eliminar producto"
            description={`¿Seguro que deseas eliminar "${record.name}"?`}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete?.(record)}
          >
            <Tooltip title="Eliminar producto">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
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
        rowKey="id_product"
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
          showTotal: (total) => `Total ${total} productos`,
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
