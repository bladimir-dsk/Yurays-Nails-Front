import { Card, Typography } from "antd";
import { LoginForm } from "@/features/auth/LoginForm";

const { Title, Text } = Typography;

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm shadow-sm" styles={{ body: { padding: 32 } }}>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            A
          </div>
          <Title level={4} className="!mb-1">
            Bienvenido de nuevo
          </Title>
          <Text type="secondary">Inicia sesión para continuar</Text>
        </div>

        <LoginForm />
      </Card>
    </div>
  );
}
