import { Button, Form, Input, InputNumber, Modal, Select } from "antd";
import React, { useEffect, useState } from "react";
import { CategoryApi } from "@/api/endpoints/categoryApi";

export default function ModalProductAdd({
  open,
  onClose,
  onSubmit,
  product,
  loading = false,
}) {
  const [form] = Form.useForm();
  const isEditing = Boolean(product);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!open) return;

    const init = async () => {
      const cats = await getCategorie();
      setCategories(cats);

      if (product) {
        form.setFieldsValue({
          code: product.code,
          name: product.name,
          id_category: product.category?.id_category,
          price: Number(product.price), // ✅ convierte "199.00" -> 199
          stock: Number(product.stock),
        });
      } else {
        form.resetFields();
      }
    };

    init();
  }, [open, product, form]);

  const handleFinish = async (values) => {
    const payload = {
      ...values,
      price: Number(values.price),
      stock: Number(values.stock),
    };

    const success = await onSubmit(payload);
    if (success) {
      form.resetFields();
      onClose();
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  //get para traer las categorias
  const getCategorie = async () => {
    const response = await CategoryApi.getAllName();

    return response.map((category) => ({
      value: category.id_category,
      label: category.name,
    }));
  };

  return (
    <Modal
      title={isEditing ? "Editar producto" : "Nueva producto"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Código"
          name="code"
          rules={[
            {
              required: true,
              message: "El código es obligatorio",
            },
          ]}
        >
          <Input placeholder="Código del producto" />
        </Form.Item>
        <Form.Item
          label="Nombre"
          name="name"
          rules={[
            {
              required: true,
              message: "El nombre es obligatorio",
            },
          ]}
        >
          <Input placeholder="Nombre del producto" />
        </Form.Item>

        <Form.Item
          label="Categoría"
          name="id_category"
          rules={[
            {
              required: true,
              message: "La categoría es obligatoria",
            },
          ]}
        >
          <Select
            placeholder="Selecciona una categoría"
            options={categories}
            loading={loading}
          />
        </Form.Item>

        <Form.Item
          label="Precio"
          name="price"
          rules={[
            {
              required: true,
              message: "El precio es obligatorio",
            },
          ]}
        >
          <InputNumber
            placeholder="Precio del producto"
            min={0}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label="Stock"
          name="stock"
          rules={[
            {
              required: true,
              message: "El stock es obligatorio",
            },
          ]}
        >
          <InputNumber
            placeholder="Stock del producto"
            min={0}
            precision={0}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Cancelar</Button>

          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? "Guardar cambios" : "Registrar producto"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
