import React from "react";
import { Form, Input, Button, Checkbox } from "antd";
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
      className="coffee-form flex flex-col"
    >
      <Form.Item
        label={
          <span className="text-coffee-700 dark:text-coffee-200">
            Correo electrónico
          </span>
        }
        name="email"
        rules={[
          { required: true, message: "El correo es obligatorio." },
          { type: "email", message: "Ingresa un correo válido." },
        ]}
      >
        <Input
          prefix={<MailOutlined className="text-coffee-400" />}
          placeholder="tucorreo@ejemplo.com"
          autoFocus
          size="large"
        />
      </Form.Item>

      <Form.Item
        label={
          <span className="text-coffee-700 dark:text-coffee-200">
            Contraseña
          </span>
        }
        name="password"
        rules={[
          { required: true, message: "La contraseña es obligatoria." },
          { min: 6, message: "Debe tener al menos 6 caracteres." },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="text-coffee-400" />}
          placeholder="••••••••"
          size="large"
        />
      </Form.Item>

      <Form.Item className="mb-0">
        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={isLoading}
          style={{
            backgroundColor: "var(--color-coffee-400)",
            borderColor: "var(--color-coffee-400)",
          }}
        >
          {isLoading ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </Form.Item>
    </Form>
  );
}
