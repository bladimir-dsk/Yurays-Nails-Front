import { Form, Input, Button, Modal } from "antd";
import React, { useEffect } from "react";

export default function ModalCategoryAdd({
  open,
  onClose,
  onSubmit,
  category,
  loading = false,
}) {
  const [form] = Form.useForm();
  const isEditing = Boolean(category);

  useEffect(() => {
    if (open) {
      if (category) {
        form.setFieldsValue({
          name: category.name,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, category, form]);

  const handleFinish = async (values) => {
    const success = await onSubmit(values);

    if (success) {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEditing ? "Editar categoría" : "Nueva categoría"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
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
          <Input placeholder="Nombre de la categoría" />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Cancelar</Button>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              backgroundColor: "var(--color-coffee-400)",
              borderColor: "var(--color-coffee-400)",
            }}
          >
            {isEditing ? "Guardar cambios" : "Registrar categoría"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
