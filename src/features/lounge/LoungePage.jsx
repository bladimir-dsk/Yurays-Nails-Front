import { LoungeApi } from "@/api/endpoints/loungeApi";
import ModalLoungeAdd from "@/components/modals/ModalLoungeAdd";
import { useNotification } from "@/components/NotificationProvider";
import LoungeTable from "@/components/table/LoungeTable";
import { Button, Flex, Typography } from "antd";
import React, { useEffect, useState } from "react";

const { Title } = Typography;

export default function LoungePage() {
  const [lounges, setLounges] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotification();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLounge, setSelectedLounge] = useState(null);
  const [saving, setSaving] = useState(false);

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

  //add nuevo salon
  const handleOpenCreate = () => {
    setSelectedLounge(null);
    setModalOpen(true);
  };
  //edit salon
  const handleEdit = (lounge) => {
    setSelectedLounge(lounge);
    setModalOpen(true);
  };
  //crear y editar el salon
  const handleSumit = async (values) => {
    try {
      setSaving(true);
      if (selectedLounge) {
        //editar
        await LoungeApi.update(selectedLounge.id_salon, values);
        notify.success("Salón actualizado");
      } else {
        //crear
        await LoungeApi.create(values);
        notify.success("Salón creado");
      }
      setModalOpen(false);
      setSelectedLounge(null);

      await loadLounge(pagination.page, pagination.limit);
      return true;
    } catch (error) {
      notify.error("Error al guardar el salón");
      console.error("Error al guardar el salón:", error);
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
          SALONES
        </Title>
        <Button type="primary" onClick={handleOpenCreate}>
          Nuevo salón
        </Button>
      </Flex>
      <LoungeTable
        dataSource={lounges}
        loading={loading}
        currentPage={pagination.page}
        pageSize={pagination.limit}
        total={pagination.total}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
      />

      <ModalLoungeAdd
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedLounge(null);
        }}
        onSubmit={handleSumit}
        lounge={selectedLounge}
        loading={saving}
      />
    </div>
  );
}
