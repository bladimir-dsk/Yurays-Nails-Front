import { BoxApi } from "@/api/endpoints/boxApi";
import { useNotification } from "@/components/NotificationProvider";
import BoxCards from "@/components/cards/BoxCards";
import ModalBoxAdd from "@/components/modals/ModalBoxAdd";
import MovementModal from "@/components/modals/MovementModal";
import { Flex, Button, Typography } from "antd";
import React, { useEffect, useState } from "react";

const { Title, Text } = Typography;

export default function BoxPage() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotification();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Movimiento
  const [movementBox, setMovementBox] = useState(null);
  const [savingMovement, setSavingMovement] = useState(false);

  // Cierre
  const [closingId, setClosingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [savingBox, setSavingBox] = useState(false);

  const loadBoxes = async (
    page = pagination.page,
    limit = pagination.limit,
  ) => {
    try {
      setLoading(true);
      const response = await BoxApi.getAll({ page, limit });

      setBoxes(response.data);
      setPagination({
        page: response.meta.page ?? page,
        limit: response.meta.limit ?? limit,
        total: response.meta.total,
      });
    } catch (error) {
      notify.error("Error al obtener cajas");
      console.error("Error al obtener cajas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoxes(1, 10);
  }, []);

  const handlePageChange = (page, limit) => loadBoxes(page, limit);

  const handleCreateMovement = async (payload) => {
    try {
      setSavingMovement(true);
      await BoxApi.createMovement(payload);
      notify.success("Movimiento registrado");
      setMovementBox(null);
      loadBoxes();
    } catch (error) {
      notify.error("Error al registrar el movimiento");
      console.error("Error al registrar movimiento:", error);
    } finally {
      setSavingMovement(false);
    }
  };

  const handleCloseBox = async (box) => {
    try {
      setClosingId(box.id_caja);
      await BoxApi.closeToday(box.id_caja);
      notify.success("Caja cerrada correctamente");
      loadBoxes();
    } catch (error) {
      notify.error("Error al cerrar la caja");
      console.error("Error al cerrar caja:", error);
    } finally {
      setClosingId(null);
    }
  };

  const handleOpenCreate = () => {
    setSelectedBox(null);
    setModalOpen(true);
  };

  const handleSaveBox = async (values) => {
    try {
      setSavingBox(true);
      await BoxApi.create(values);
      notify.success("Caja registrada");
      setModalOpen(false);
      loadBoxes();
    } catch (error) {
      notify.error("Error al registrar la caja", error.message);
      console.error("Error al registrar caja:", error);
    } finally {
      setSavingBox(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            CAJA
          </Title>
          <Text type="secondary">Administra el estado de la caja</Text>
        </div>

        <Button
          style={{
            backgroundColor: "var(--color-coffee-400)",
            borderColor: "var(--color-coffee-400)",
          }}
          type="primary"
          size="large"
          onClick={handleOpenCreate}
        >
          + Nueva caja
        </Button>
      </Flex>

      <BoxCards
        dataSource={boxes}
        loading={loading}
        currentPage={pagination.page}
        pageSize={pagination.limit}
        total={pagination.total}
        closingId={closingId}
        onPageChange={handlePageChange}
        onMovement={setMovementBox}
        onClose={handleCloseBox}
      />

      <MovementModal
        open={!!movementBox}
        box={movementBox}
        loading={savingMovement}
        onCancel={() => setMovementBox(null)}
        onSubmit={handleCreateMovement}
      />

      <ModalBoxAdd
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBox(null);
        }}
        onSubmit={handleSaveBox}
        box={selectedBox}
        loading={savingBox}
      />
    </div>
  );
}
