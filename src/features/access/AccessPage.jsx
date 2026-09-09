import { AccessLogApi } from "@/api/endpoints/access-logApi";
import { useNotification } from "@/components/NotificationProvider";
import AccessTable from "@/components/table/AccessTable";
import { Flex, Typography } from "antd";
import React, { useEffect, useState } from "react";

const { Title } = Typography;

export default function AccessPage() {
  const [access, setAccess] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotification();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    salonId: null,
  });
  const loadAccess = async (
    page = pagination.page,
    limit = pagination.limit,
  ) => {
    try {
      setLoading(true);

      const response = await AccessLogApi.getAll({
        page,
        limit,
        salonId: pagination.salonId,
      });

      setAccess(response.data);

      setPagination({
        page: response.meta.page,
        limit: response.meta.limit,
        total: response.meta.total,
      });
    } catch (error) {
      notify.error("Error al obtener accesos");
      console.error("Error al obtener accesos:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAccess();
  }, []);

  const handlePageChange = (page, limit) => {
    loadAccess(page, limit);
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
          REGISTROS
        </Title>
      </Flex>
      <AccessTable
        dataSource={access}
        loading={loading}
        currentPage={pagination.page}
        pageSize={pagination.limit}
        total={pagination.total}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
