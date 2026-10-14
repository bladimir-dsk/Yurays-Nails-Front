import {
  CheckCircleOutlined,
  LockOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Pagination,
  Popconfirm,
  Row,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React from "react";

const { Text, Title } = Typography;

const money = (value) =>
  `$${Number(value ?? 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
      })
    : "—";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("es-MX", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";

const isOpen = (estado) =>
  String(estado ?? "")
    .toLowerCase()
    .includes("abiert");

const getTodayString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Compara solo YYYY-MM-DD. Usa la misma base (UTC) con la que
// ya muestras la fecha en formatDate, para que no se desfase un día.
const isToday = (fecha) => {
  if (!fecha) return false;
  const boxDate =
    typeof fecha === "string"
      ? fecha.slice(0, 10)
      : new Date(fecha).toISOString().slice(0, 10);
  return boxDate === getTodayString();
};

function Stat({ label, value, color }) {
  return (
    <div className="flex flex-col">
      <Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Text>
      <Text strong style={{ fontSize: 16, color }}>
        {value}
      </Text>
    </div>
  );
}

export default function BoxCards({
  dataSource = [],
  loading = false,
  total = 0,
  currentPage = 1,
  pageSize = 10,
  closingId = null,
  onPageChange,
  onMovement,
  onClose,
}) {
  if (loading && dataSource.length === 0) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Col key={i} xs={24} md={12} xl={8}>
            <Card>
              <Skeleton active />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (!loading && dataSource.length === 0) {
    return <Empty description="No hay cajas registradas" />;
  }

  return (
    <div className="space-y-6 mt-10">
      <Row gutter={[16, 16]}>
        {dataSource.map((box) => {
          const open = isOpen(box.estado);
          const today = isToday(box.fecha);
          const canMove = open && today;

          const movementTooltip = !open
            ? "La caja está cerrada"
            : !today
              ? "Solo se pueden registrar movimientos en la caja de hoy"
              : "";

          return (
            <Col key={box.id_caja} xs={24} md={12} xl={8}>
              <Card
                hoverable
                loading={loading}
                title={
                  <Space direction="vertical" size={0}>
                    <Title level={5} style={{ margin: 0 }}>
                      Caja #{box.id_caja}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(box.fecha)}
                    </Text>
                  </Space>
                }
                extra={
                  <Tag
                    color={open ? "green" : "default"}
                    icon={open ? <CheckCircleOutlined /> : <LockOutlined />}
                  >
                    {box.estado}
                  </Tag>
                }
                actions={[
                  <Tooltip key="mov" title={movementTooltip}>
                    {/* El span es necesario: un botón disabled no dispara el tooltip */}
                    <span>
                      <Button
                        type="text"
                        icon={<SwapOutlined />}
                        disabled={!canMove}
                        onClick={() => onMovement?.(box)}
                      >
                        Movimiento
                      </Button>
                    </span>
                  </Tooltip>,
                  <Popconfirm
                    key="close"
                    title="¿Cerrar caja?"
                    description="Esta acción no se puede deshacer."
                    okText="Sí, cerrar"
                    cancelText="Cancelar"
                    disabled={!open}
                    onConfirm={() => onClose?.(box)}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<LockOutlined />}
                      disabled={!open}
                      loading={closingId === box.id_caja}
                    >
                      Cerrar
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div className="grid grid-cols-2 gap-4">
                  <Stat
                    label="Saldo inicial"
                    value={money(box.saldo_inicial)}
                  />
                  <Stat label="Saldo final" value={money(box.saldo_final)} />
                  <Stat
                    label="Entradas"
                    value={`+ ${money(box.total_entradas)}`}
                    color="#389e0d"
                  />
                  <Stat
                    label="Salidas"
                    value={`- ${money(box.total_salidas)}`}
                    color="#cf1322"
                  />
                </div>

                <div className="mt-4">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Cerrada: {formatDateTime(box.closedAt)}
                  </Text>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <div className="flex justify-end">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={[10, 20, 50, 100]}
          showQuickJumper
          showTotal={(t) => `Total ${t} cajas`}
          onChange={(page, size) => onPageChange?.(page, size)}
        />
      </div>
    </div>
  );
}
