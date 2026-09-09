import { AccessLogApi } from "@/api/endpoints/access-logApi";
import { LoungeApi } from "@/api/endpoints/loungeApi";

import ModalViewLounge from "@/components/modals/ModalViewLounge";
import { useNotification } from "@/components/NotificationProvider";

import LoungeTableId from "@/components/table/LoungeTableId";

import { Flex, Typography } from "antd";
import React, { useEffect, useState } from "react";

const { Title } = Typography;

export default function AddAccessPage() {
  const [lounges, setLounges] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLounge, setSelectedLounge] = useState(null);

  const [saving, setSaving] = useState(false);

  const [result, setResult] = useState(null);

  const notify = useNotification();

  const loadLounge = async (
    page = pagination.page,
    limit = pagination.limit,
  ) => {
    try {
      setLoading(true);

      const response = await LoungeApi.getAll({
        page,
        limit,
      });

      setLounges(response.data);

      setPagination({
        page: response.meta.page,
        limit: response.meta.limit,
        total: response.meta.total,
      });
    } catch (error) {
      notify.error("Error al obtener salones");

      console.error("Error al obtener salones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLounge();
  }, []);

  const handlePageChange = (page, limit) => {
    loadLounge(page, limit);
  };

  // Seleccionar salón
  const handleEdit = (lounge) => {
    setSelectedLounge(lounge);
    setResult(null);
    setModalOpen(true);
  };
  const speak = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);

    utterance.lang = "es-MX";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(utterance);
  };
  // Registrar acceso
  const handleScan = async ({ qrCode, salonId }) => {
    try {
      setSaving(true);

      setResult({
        type: "info",
        message: "Registrando acceso...",
      });

      console.log("ENVIANDO:", {
        qrCode,
        salonId,
      });

      await AccessLogApi.create({
        qrCode,
        salonId,
      });

      setResult({
        type: "success",
        message: "Acceso registrado correctamente",
      });

      speak("Registro exitoso");

      // notify.success(
      //   "Acceso registrado",
      //   "El estudiante ingresó correctamente.",
      // );

      return true;
    } catch (error) {
      console.error("Error:", error);

      setResult({
        type: "error",
        message: error?.message || "No se pudo registrar el acceso",
      });
      speak(error?.message || "No se pudo registrar el acceso");

      // notify.error(
      //   "Error al registrar acceso",
      //   error?.message || "No se pudo registrar el acceso",
      // );

      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap="small"
        className="mb-6"
      >
        <Title level={2} className="mb-0 text-xl sm:text-2xl">
          AGREGAR INGRESO
        </Title>
      </Flex>

      <LoungeTableId
        dataSource={lounges}
        loading={loading}
        currentPage={pagination.page}
        pageSize={pagination.limit}
        total={pagination.total}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
      />

      <ModalViewLounge
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedLounge(null);
          setResult(null);
        }}
        lounge={selectedLounge}
        loading={saving}
        onScan={handleScan}
        result={result}
      />
    </div>
  );
}
