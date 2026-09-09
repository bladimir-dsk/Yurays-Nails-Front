import { useEffect, useState } from "react";
import { Button, Form, Input, Modal } from "antd";

export default function ModalStudentAdd({
  open,
  onClose,
  onSubmit,
  student,
  loading = false,
}) {
  const [form] = Form.useForm();

  const isEditing = Boolean(student);

  useEffect(() => {
    if (open) {
      if (student) {
        form.setFieldsValue({
          name: student.name,
          email: student.email,
          phone: student.phone,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, student, form]);

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
      title={isEditing ? "Editar estudiante" : "Registrar estudiante"}
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
          <Input placeholder="Nombre del estudiante" />
        </Form.Item>

        <Form.Item
          label="Correo electrónico"
          name="email"
          rules={[
            {
              required: true,
              message: "El correo es obligatorio",
            },
            {
              type: "email",
              message: "Ingresa un correo válido",
            },
          ]}
        >
          <Input placeholder="correo@ejemplo.com" />
        </Form.Item>

        <Form.Item
          label="Teléfono"
          name="phone"
          rules={[
            {
              required: true,
              message: "El teléfono es obligatorio",
            },
          ]}
        >
          <Input placeholder="9999999999" />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Cancelar</Button>

          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? "Guardar cambios" : "Registrar estudiante"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
