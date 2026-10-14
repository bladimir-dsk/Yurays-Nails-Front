import { Form, Button, Modal, DatePicker, InputNumber } from "antd";
import React from "react";
import dayjs from "dayjs";

export default function ModalBoxAdd({
  open,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open) {
      form.resetFields();
      // Se vuelve a poner la fecha de hoy cada vez que se abre el modal
      form.setFieldsValue({ fecha: dayjs() });
    }
  }, [open, form]);

  const handleFinish = async (values) => {
    const payload = {
      fecha: values.fecha.format("YYYY-MM-DD"),
      saldo_inicial: Number(values.saldo_inicial),
    };

    const success = await onSubmit(payload);

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
      title="Nueva caja"
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Fecha"
          name="fecha"
          rules={[{ required: true, message: "La fecha es obligatoria" }]}
        >
          <DatePicker
            placeholder="Fecha"
            disabled
            format="YYYY-MM-DD"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label="Saldo inicial"
          name="saldo_inicial"
          rules={[
            { required: true, message: "El saldo inicial es obligatorio" },
          ]}
        >
          <InputNumber
            placeholder="Saldo inicial"
            min={0}
            precision={2}
            style={{ width: "100%" }}
          />
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
            Registrar caja
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
