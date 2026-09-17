import { SearchOutlined, ClearOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space } from "antd";
import React, { useEffect, useState } from "react";
import { CategoryApi } from "@/api/endpoints/categoryApi";

export default function ProductFilters({ onFilter }) {
  const [code, setCode] = useState("");
  const [idCategory, setIdCategory] = useState(undefined);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await CategoryApi.getAllName();
        // Ajusta esto según la forma real de tu respuesta:
        // por ejemplo [{ id_category: 1, name: "Pinceles" }, ...]
        const options = data.map((c) => ({
          value: c.id_category,
          label: c.name,
        }));
        setCategories(options);
      } catch (error) {
        console.error("Error cargando categorías", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = () => {
    onFilter?.({ code, id_category: idCategory });
  };

  const handleClear = () => {
    setCode("");
    setIdCategory(undefined);
    onFilter?.({ code: "", id_category: undefined });
  };

  return (
    <Space wrap style={{ marginBottom: 16 }}>
      <Input
        placeholder="Buscar por código..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onPressEnter={handleSearch}
        allowClear
        style={{ width: 200 }}
      />

      <Select
        placeholder="Filtrar por categoría"
        value={idCategory}
        onChange={(value) => setIdCategory(value)}
        options={categories}
        loading={loadingCategories}
        showSearch
        allowClear
        optionFilterProp="label"
        style={{ width: 220 }}
      />

      <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
        Buscar
      </Button>
      <Button icon={<ClearOutlined />} onClick={handleClear}>
        Limpiar
      </Button>
    </Space>
  );
}
