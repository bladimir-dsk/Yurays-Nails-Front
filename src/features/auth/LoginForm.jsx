import React from "react";
import { Form, Input, Button } from "antd";

import { MailOutlined, LockOutlined } from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/components/NotificationProvider";

export function LoginForm() {
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const { login, isLoading, error } = useAuth();

  const notify = useNotification();

  async function handleFinish(values) {
    const ok = await login({
      email: values.email,
      password: values.password,
    });

    if (ok) {
      notify.success("Inicio de sesión exitoso", "Bienvenido de nuevo.");

      navigate("/dashboard");
    }
  }

  React.useEffect(() => {
    if (error) {
      notify.error("Error al iniciar sesión", error.message);
    }
  }, [error, notify]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      requiredMark={false}
      className="flex flex-col"
    >
      <Form.Item
        label="Correo electrónico"
        name="email"
        rules={[
          {
            required: true,
            message: "El correo es obligatorio.",
          },
          {
            type: "email",
            message: "Ingresa un correo válido.",
          },
        ]}
      >
        <Input
          prefix={<MailOutlined className="text-slate-400" />}
          placeholder="tucorreo@ejemplo.com"
          autoFocus
        />
      </Form.Item>

      <Form.Item
        label="Contraseña"
        name="password"
        rules={[
          {
            required: true,
            message: "La contraseña es obligatoria.",
          },
          {
            min: 6,
            message: "Debe tener al menos 6 caracteres.",
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="text-slate-400" />}
          placeholder="••••••••"
        />
      </Form.Item>

      <Form.Item className="mb-0">
        <Button type="primary" htmlType="submit" block loading={isLoading}>
          {isLoading ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </Form.Item>
    </Form>
  );
}
