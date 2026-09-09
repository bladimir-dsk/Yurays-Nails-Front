import { Button, Flex, Input, Modal, Tag, Typography } from "antd";
import React, { useEffect, useRef, useState } from "react";

const { Text, Title } = Typography;

export default function ModalViewLounge({
  open,
  onClose,
  lounge,
  onScan,
  loading = false,
  result,
}) {
  const [qrCode, setQrCode] = useState("");

  const inputRef = useRef(null);

  const salonId = lounge?.id_salon;

  /**
   * Mantener el input del lector enfocado
   */
  const focusInput = () => {
    setTimeout(() => {
      if (open && !loading) {
        inputRef.current?.focus();
      }
    }, 100);
  };

  /**
   * Al abrir el terminal
   */
  useEffect(() => {
    if (open) {
      setQrCode("");
      focusInput();
    }
  }, [open]);

  /**
   * Volver a enfocar cuando termina
   * el proceso de lectura
   */
  useEffect(() => {
    if (open && !loading) {
      focusInput();
    }
  }, [loading, open, result]);

  /**
   * Si el usuario hace click en cualquier
   * parte de la pantalla, regresar el focus
   * al input invisible.
   */
  useEffect(() => {
    if (!open) return;

    const handleGlobalClick = (event) => {
      /**
       * Si hizo click en el botón cerrar,
       * no necesitamos regresar el focus.
       */
      if (event.target.closest("button")) {
        return;
      }

      if (!loading) {
        focusInput();
      }
    };

    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, [open, loading]);

  /**
   * Procesar Enter enviado por el lector QR
   */
  const handleKeyDown = async (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    /**
     * Evitar dobles lecturas
     */
    if (loading) {
      return;
    }

    const code = qrCode.trim().toLowerCase();

    /**
     * No enviar códigos vacíos
     */
    if (!code) {
      focusInput();
      return;
    }

    /**
     * Validar salón
     */
    if (!salonId) {
      console.error("No hay un salón seleccionado.");
      return;
    }

    /**
     * Limpiar inmediatamente el campo.
     * Así nunca queda el QR anterior.
     */
    setQrCode("");

    try {
      /**
       * Enviar QR al componente padre
       */
      await onScan({
        qrCode: code,
        salonId,
      });
    } catch (error) {
      console.error("Error procesando QR:", error);
    } finally {
      /**
       * Preparar lector para el siguiente estudiante
       */
      focusInput();
    }
  };

  /**
   * Cerrar terminal
   */
  const handleCancel = () => {
    setQrCode("");
    onClose();
  };

  /**
   * Click en la pantalla del lector
   */
  const handleScreenClick = (event) => {
    /**
     * Si se hizo click en el botón cerrar,
     * no hacer focus.
     */
    if (event.target.closest("button")) {
      return;
    }

    if (!loading) {
      focusInput();
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
      footer={null}
      maskClosable={false}
      closable={false}
      keyboard={false}
      width={700}
      centered
      styles={{
        body: {
          padding: 0,
        },
        mask: {
          backdropFilter: "blur(5px)",
        },
      }}
    >
      <div
        className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center cursor-pointer"
        onClick={handleScreenClick}
      >
        {/* =========================
            SALÓN
        ========================== */}
        <div className="mb-8">
          <Tag color="blue" className="text-base px-4 py-1">
            SALÓN {salonId}
          </Tag>

          <Title level={2} className="!mt-3 !mb-0">
            {lounge?.name}
          </Title>
        </div>

        {/* =========================
            ESTADO DEL LECTOR
        ========================== */}
        <div className="mb-8 min-h-[230px] flex flex-col justify-center">
          {/* =====================
              ESPERANDO QR
          ====================== */}
          {!loading &&
            result?.type !== "success" &&
            result?.type !== "error" && (
              <>
                <div className="text-7xl mb-6">📷</div>

                <Title level={2} className="!mb-2">
                  LECTOR LISTO
                </Title>

                <Text type="secondary" className="text-lg">
                  Esperando código QR...
                </Text>

                <Text type="secondary">Pasa tu código frente al lector</Text>
              </>
            )}

          {/* =====================
              LOADING
          ====================== */}
          {loading && (
            <>
              <div className="text-7xl mb-6">⏳</div>

              <Title level={2} className="!mb-2">
                VERIFICANDO...
              </Title>

              <Text type="secondary" className="text-lg">
                Registrando acceso
              </Text>
            </>
          )}

          {/* =====================
              SUCCESS
          ====================== */}
          {!loading && result?.type === "success" && (
            <>
              <div className="text-7xl mb-6">✅</div>

              <Title level={1} className="!text-green-600 !mb-3">
                ¡ACCESO CORRECTO!
              </Title>

              <Text strong className="text-lg">
                {result.message}
              </Text>
            </>
          )}

          {/* =====================
              ERROR
          ====================== */}
          {!loading && result?.type === "error" && (
            <>
              <div className="text-7xl mb-6">❌</div>

              <Title level={1} className="!text-red-600 !mb-3">
                ACCESO DENEGADO
              </Title>

              <Text strong className="text-lg">
                {result.message}
              </Text>
            </>
          )}
        </div>

        {/* =========================
            INPUT INVISIBLE
            El lector QR escribe aquí
        ========================== */}
        <Input
          ref={inputRef}
          value={qrCode}
          onChange={(event) => {
            setQrCode(event.target.value.toLowerCase());
          }}
          onKeyDown={handleKeyDown}
          disabled={loading}
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: "fixed",
            left: "-9999px",
            top: "-9999px",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
          }}
        />

        {/* =========================
            BOTÓN CERRAR
        ========================== */}
        <Button onClick={handleCancel} disabled={loading} size="large">
          Cerrar terminal
        </Button>
      </div>
    </Modal>
  );
}
