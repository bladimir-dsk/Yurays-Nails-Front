import { ProductApi } from "@/api/endpoints/productApi";
import { useNotification } from "@/components/NotificationProvider";
import ProductTable from "@/components/table/ProductTable";
import ProductFilters from "@/components/table/ProductFilters";
import { Button, Flex, Typography } from "antd";
import React, { useCallback, useEffect, useState } from "react";

const { Title, Text } = Typography;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotification();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    name: "",
    code: "",
    id_category: undefined,
  });

  const loadProducts = useCallback(
    async (page, limit, currentFilters) => {
      try {
        setLoading(true);
        const response = await ProductApi.getAll({
          page,
          limit,
          name: currentFilters.name || undefined,
          code: currentFilters.code || undefined,
          id_category: currentFilters.id_category || undefined,
        });
        setProducts(response.data || []);
        setPagination({
          page: response.meta?.page ?? page,
          limit: response.meta?.limit ?? limit,
          total: response.meta?.total ?? 0,
        });
      } catch (error) {
        console.error(error);
        notify.error("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    },
    [notify],
  );

  // ⚠️ CLAVE: array de dependencias vacío, se ejecuta UNA sola vez al montar
  useEffect(() => {
    loadProducts(1, 10, { name: "", code: "", id_category: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page, limit) => {
    loadProducts(page, limit, filters);
  };

  const handleSearchName = (name) => {
    const newFilters = { ...filters, name };
    setFilters(newFilters);
    loadProducts(1, pagination.limit, newFilters);
  };

  const handleFilterTop = ({ code, id_category }) => {
    const newFilters = { ...filters, code, id_category };
    setFilters(newFilters);
    loadProducts(1, pagination.limit, newFilters);
  };

  return (
    <div>
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            PRODUCTOS
          </Title>
          <Text type="secondary">Administra los productos de tu negocio</Text>
        </div>
        <Button type="primary" size="large">
          + Nuevo producto
        </Button>
      </Flex>

      <ProductFilters onFilter={handleFilterTop} />

      <ProductTable
        dataSource={products}
        loading={loading}
        currentPage={pagination.page}
        pageSize={pagination.limit}
        total={pagination.total}
        onPageChange={handlePageChange}
        onSearch={handleSearchName}
      />
    </div>
  );
}
