import { Form, Input, InputNumber, Modal, Radio } from "antd";
import React, { useEffect } from "react";

export default function MovementModal({
  open,
  box,
  loading = false,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ tipo: "entrada" });
    }
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit?.({
      monto: Number(values.monto),
      tipo: values.tipo,
      descripcion: values.descripcion?.trim(),
      referencia: values.referencia?.trim(),
    });
  };

  return (
    <Modal
      title={`Registrar movimiento${box ? ` · Caja #${box.id_caja}` : ""}`}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Guardar"
      okButtonProps={{
        style: {
          backgroundColor: "var(--color-coffee-400)",
          borderColor: "var(--color-coffee-400)",
        },
      }}
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="pt-2">
        <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
          <Radio.Group optionType="button" buttonStyle="solid" style={{}}>
            <Radio.Button value="entrada">Entrada</Radio.Button>
            <Radio.Button value="salida">Salida</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="monto"
          label="Monto"
          rules={[
            { required: true, message: "Ingresa el monto" },
            {
              type: "number",
              min: 0.01,
              message: "El monto debe ser mayor a 0",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            prefix="$"
            min={0}
            precision={2}
          />
        </Form.Item>

        <Form.Item
          name="descripcion"
          label="Descripción"
          rules={[{ required: true, message: "Ingresa una descripción" }]}
        >
          <Input placeholder="Ej. Compra de bolsas" />
        </Form.Item>

        <Form.Item name="referencia" label="Referencia">
          <Input placeholder="Ej. FAC-001" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
