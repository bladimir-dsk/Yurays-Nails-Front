import { useNotification } from "@/components/NotificationProvider";
import { Flex, Button, Typography } from "antd";
import React, { useCallback, useState, useEffect } from "react";
import { SaleApi } from "@/api/endpoints/saleApi";
import HistorySaleTable from "@/components/table/HistorySaleTable";
import ModalSaleDetails from "@/components/modals/ModalSaleDetails";

const { Title, Text } = Typography;

export default function HistorySalePage() {
  const [historySale, setHistorySale] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotification();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    sale_number: "",
  });

  // --- Estado del modal de detalle ---
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadHistorySale = useCallback(
    async (page, limit, currentFilters) => {
      try {
        setLoading(true);
        const response = await SaleApi.getAll({
          page,
          limit,
          sale_number: currentFilters.sale_number || undefined,
        });
        setHistorySale(response.data || []);
        setPagination({
          page: response.meta?.page ?? pagination.page,
          limit: response.meta?.limit ?? pagination.limit,
          total: response.meta?.total ?? 0,
        });
      } catch (error) {
        console.error(error);
        notify.error("Error al cargar el historial de ventas");
      } finally {
        setLoading(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    loadHistorySale(1, 10, { sale_number: "" });
  }, []);

  const handlePageChange = (page, limit) => {
    loadHistorySale(page, limit, filters);
  };

  // --- Manejo de "Ver detalle" ---
  const handleViewDetail = async (record) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const response = await SaleApi.getById(record.id_sale);
      setSelectedSale(response.data || response); // según cómo venga tu respuesta
    } catch (error) {
      console.error(error);
      notify.error("Error al cargar el detalle de la venta");
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedSale(null);
  };

  return (
    <div className="space-y-6">
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap="middle"
        className="space-y-6"
      >
        <div className="space-y-6">
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            HISTORIAL DE VENTAS
          </Title>
          <Text type="secondary">Consulta el historial de ventas</Text>
        </div>
      </Flex>
      <div className="mt-6">
        <HistorySaleTable
          dataSource={historySale}
          loading={loading}
          currentPage={pagination.page}
          pageSize={pagination.limit}
          total={pagination.total}
          onPageChange={handlePageChange}
          onViewDetail={handleViewDetail}
        />
      </div>
      <ModalSaleDetails
        open={detailModalOpen}
        onClose={handleCloseModal}
        sale={selectedSale}
        loading={detailLoading}
      />
    </div>
  );
}
