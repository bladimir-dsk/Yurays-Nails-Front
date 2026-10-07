import { Typography } from "antd";
import { LoginForm } from "@/features/auth/LoginForm";

const { Title, Text } = Typography;

export function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-coffee-50 px-4 dark:bg-coffee-950">
      {/* Blobs decorativos suaves */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-coffee-200/60 blur-3xl dark:bg-coffee-700/20" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-coffee-300/50 blur-3xl dark:bg-coffee-800/30" />

      <div className="relative w-full max-w-sm rounded-2xl border border-coffee-200/60 bg-white/90 p-8 shadow-xl shadow-coffee-900/5 backdrop-blur-sm dark:border-coffee-700/40 dark:bg-coffee-900/80 dark:shadow-black/30">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-coffee-100 p-2 dark:bg-coffee-800">
            <img
              src="/YNS.png"
              alt="Yuray's Nails"
              className="h-full w-full object-contain"
            />
          </div>
          <Title
            level={4}
            className="!mb-1 !text-coffee-900 dark:!text-coffee-50"
          >
            Bienvenido de nuevo
          </Title>
          <Text className="text-coffee-500 dark:text-coffee-300">
            Inicia sesión para continuar
          </Text>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-coffee-400 dark:text-coffee-500">
          © {new Date().getFullYear()} Yuray's Nails
        </p>
      </div>
    </div>
  );
}
