import { ProductApi } from "@/api/endpoints/productApi";
import ModalProductAdd from "@/components/modals/ModalProductAdd";
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

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    loadProducts(1, 10, { name: "", code: "", id_category: undefined });
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

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (product) => {
    try {
      await ProductApi.delete(product.id_product);
      notify.success("Producto eliminado correctamente");

      const isLastItemOnPage = products.length === 1 && pagination.page > 1;
      const targetPage = isLastItemOnPage
        ? pagination.page - 1
        : pagination.page;

      await loadProducts(targetPage, pagination.limit, filters);
    } catch (error) {
      notify.error(error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      if (selectedProduct) {
        await ProductApi.update(selectedProduct.id_product, values);
        notify.success("Producto actualizado correctamente");
      } else {
        await ProductApi.create(values);
        notify.success("Producto creado correctamente");
      }
      setModalOpen(false);
      setSelectedProduct(null);
      await loadProducts(pagination.page, pagination.limit, filters);
      return true;
    } catch (error) {
      notify.error(error.message);
      return false;
    } finally {
      setSaving(false);
    }
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
        <Button type="primary" size="large" onClick={handleOpenCreate}>
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
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ModalProductAdd
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleSubmit}
        loading={saving}
        product={selectedProduct}
      />
    </div>
  );
}
