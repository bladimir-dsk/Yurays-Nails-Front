// src/utils/getErrorMessage.js
export function getErrorMessage(
  error,
  fallback = "Ocurrió un error inesperado",
) {
  const data = error?.response?.data;

  if (!data) return fallback;

  const { message } = data;

  if (Array.isArray(message)) {
    return message.join(", "); // errores de validación vienen como array
  }

  if (typeof message === "string") {
    return message;
  }

  if (typeof message === "object" && message !== null) {
    return JSON.stringify(message);
  }

  return fallback;
}
