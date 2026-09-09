import { Button, Form, Input, Modal } from "antd";
import React, { useEffect } from "react";

export default function ModalLoungeAdd({
  open,
  onClose,
  onSubmit,
  lounge,
  loading = false,
}) {
  const [form] = Form.useForm();
  const isEditing = Boolean(lounge);

  useEffect(() => {
    if (open) {
      if (lounge) {
        form.setFieldsValue({
          name: lounge.name,
          issue: lounge.issue,
          timeIn: lounge.timeIn,
          timeOut: lounge.timeOut,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, lounge, form]);

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
      title={isEditing ? "Editar salón" : "Nuevo salón"}
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
          <Input placeholder="Nombre del salón" />
        </Form.Item>

        <Form.Item
          label="Materia"
          name="issue"
          rules={[
            {
              required: true,
              message: "La materia es obligatoria",
            },
          ]}
        >
          <Input placeholder="Materia del salón" />
        </Form.Item>

        <Form.Item
          label="Fecha inicio"
          name="timeIn"
          rules={[
            {
              required: true,
              message: "La fecha de inicio es obligatoria",
            },
          ]}
        >
          <Input type="date" />
        </Form.Item>

        <Form.Item
          label="Fecha fin"
          name="timeOut"
          rules={[
            {
              required: true,
              message: "La fecha de fin es obligatoria",
            },
          ]}
        >
          <Input type="date" />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Cancelar</Button>

          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? "Guardar cambios" : "Registrar salón"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
