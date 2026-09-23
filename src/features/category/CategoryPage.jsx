import { CategoryApi } from "@/api/endpoints/categoryApi";
import ModalCategoryAdd from "@/components/modals/ModalCategoryAdd";
import { useNotification } from "@/components/NotificationProvider";
import CategoryTable from "@/components/table/CategoryTable";
import { Button, Flex, Typography } from "antd";
import React, { useEffect, useState } from "react";

const { Title, Text } = Typography;

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const notify = useNotification();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [filters, setFilters] = useState({
    name: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadCategories = async (
    page = pagination.page,
    limit = pagination.limit,
    name = filters.name,
  ) => {
    try {
      setLoading(true);

      const response = await CategoryApi.getAll({
        page,
        limit,
        name,
      });

      setCategories(response.data);

      setPagination({
        page: response.meta.page ?? page,
        limit: response.meta.limit ?? limit,
        total: response.meta.total,
      });
    } catch (error) {
      notify.error("Error al obtener categorías");

      console.error("Error al obtener categorías:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(1, 10, "");
  }, []);

  const handlePageChange = (page, limit) => {
    loadCategories(page, limit, filters.name);
  };

  const handleSearch = (name) => {
    setFilters({
      name,
    });

    loadCategories(1, pagination.limit, name);
  };

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async (category) => {
    try {
      await CategoryApi.delete(category.id_category);

      notify.success("Categoría eliminada correctamente");

      // Si eliminas el último registro de la página actual, retrocede una página
      const isLastItemOnPage = categories.length === 1 && pagination.page > 1;
      const targetPage = isLastItemOnPage
        ? pagination.page - 1
        : pagination.page;

      await loadCategories(targetPage, pagination.limit, filters.name);
    } catch (error) {
      notify.error("Error al eliminar categoría");

      console.error("Error al eliminar categoría:", error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);

      if (selectedCategory) {
        await CategoryApi.update(selectedCategory.id_category, values);

        notify.success("Categoría actualizada correctamente");
      } else {
        await CategoryApi.create(values);

        notify.success("Categoría creada correctamente");
      }

      setModalOpen(false);
      setSelectedCategory(null);

      await loadCategories(pagination.page, pagination.limit, filters.name);

      return true;
    } catch (error) {
      notify.error("Error al guardar categoría");

      console.error("Error al guardar categoría:", error);

      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap="middle"
        className="space-y-6"
      >
        <div className="space-y-6">
          <Title
            level={2}
            style={{
              margin: 0,
              fontWeight: 700,
            }}
          >
            CATEGORÍAS
          </Title>

          <Text type="secondary">
            Administra las categorías de tus servicios
          </Text>
        </div>

        <Button
          style={{
            backgroundColor: "var(--color-coffee-400)",
            borderColor: "var(--color-coffee-400)",
          }}
          type="primary"
          size="large"
          onClick={handleOpenCreate}
        >
          + Nueva categoría
        </Button>
      </Flex>

      <CategoryTable
        dataSource={categories}
        loading={loading}
        currentPage={pagination.page}
        pageSize={pagination.limit}
        total={pagination.total}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ModalCategoryAdd
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleSubmit}
        category={selectedCategory}
        loading={saving}
      />
    </div>
  );
}
