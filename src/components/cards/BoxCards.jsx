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
  Flex,
  Pagination,
  Popconfirm,
  Row,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import React from "react";

const { Text, Title } = Typography;

const money = (value) =>
  `$${Number(value ?? 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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

const toYmd = (fecha) => {
  if (!fecha) return null;
  let s;
  if (typeof fecha === "string") {
    s = fecha.slice(0, 10);
  } else {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return null;
    s = d.toISOString().slice(0, 10);
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

const isToday = (fecha) => toYmd(fecha) === getTodayString();

const ymdToDate = (ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const fmt = (date, options) =>
  date.toLocaleDateString("es-MX", { ...options, timeZone: "UTC" });

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const groupByMonth = (boxes) => {
  const groups = [];
  const index = new Map();

  boxes.forEach((box) => {
    const ymd = toYmd(box.fecha);
    const key = ymd ? ymd.slice(0, 7) : "sin-fecha";
    if (!index.has(key)) {
      const label = ymd
        ? capitalize(fmt(ymdToDate(ymd), { month: "long", year: "numeric" }))
        : "Sin fecha";
      const group = { key, label, items: [] };
      index.set(key, group);
      groups.push(group);
    }
    index.get(key).items.push(box);
  });

  return groups;
};

function DateBadge({ ymd, open, today }) {
  const { token } = theme.useToken();

  const background = today
    ? token.colorPrimary
    : open
      ? token.colorSuccessBg
      : token.colorFillTertiary;
  const color = today
    ? token.colorTextLightSolid
    : open
      ? token.colorSuccess
      : token.colorTextSecondary;

  const date = ymd ? ymdToDate(ymd) : null;

  return (
    <div
      style={{
        width: 68,
        height: 68,
        borderRadius: 14,
        background,
        color,
      }}
      className="flex shrink-0 flex-col items-center justify-center leading-none"
    >
      {date ? (
        <>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>
            {fmt(date, { month: "short" }).replace(".", "").toUpperCase()}
          </span>
          <span style={{ fontSize: 28, fontWeight: 700, margin: "3px 0" }}>
            {fmt(date, { day: "numeric" })}
          </span>
          <span style={{ fontSize: 11 }}>
            {fmt(date, { weekday: "short" }).replace(".", "")}
          </span>
        </>
      ) : (
        <span style={{ fontSize: 22 }}>—</span>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="flex min-w-0 flex-col">
      <Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Text>
      <Text strong style={{ fontSize: 14, color }}>
        {value}
      </Text>
    </div>
  );
}

function BoxCard({ box, loading, closingId, onMovement, onClose }) {
  const { token } = theme.useToken();

  const open = isOpen(box.estado);
  const today = isToday(box.fecha);
  const canMove = open && today;
  const ymd = toYmd(box.fecha);

  const movementTooltip = !open
    ? "La caja está cerrada"
    : !today
      ? "Solo se pueden registrar movimientos en la caja de hoy"
      : "";

  const computed =
    Number(box.saldo_inicial ?? 0) +
    Number(box.total_entradas ?? 0) -
    Number(box.total_salidas ?? 0);
  const balance = open ? computed : (box.saldo_final ?? computed);

  return (
    <Card
      hoverable
      loading={loading}
      style={today ? { borderColor: token.colorPrimary } : undefined}
      styles={{ body: { padding: 20 } }}
    >
      <Flex gap={16} align="center">
        <DateBadge ymd={ymd} open={open} today={today} />

        <div className="min-w-0 flex-1">
          <Text strong style={{ fontSize: 16, display: "block" }}>
            {ymd
              ? capitalize(
                  fmt(ymdToDate(ymd), {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                )
              : "Sin fecha"}
          </Text>

          <Flex gap={4} align="center" wrap="wrap" className="mt-1">
            {today && (
              <Tag color="blue" style={{ margin: 0 }}>
                HOY
              </Tag>
            )}
            <Tag
              color={open ? "green" : "default"}
              icon={open ? <CheckCircleOutlined /> : <LockOutlined />}
              style={{ margin: 0 }}
            >
              {box.estado}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Caja #{box.id_caja}
            </Text>
          </Flex>
        </div>
      </Flex>

      <div className="mt-5">
        <Text type="secondary" style={{ fontSize: 12 }}>
          {open ? "Saldo actual" : "Saldo final"}
        </Text>
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
          {money(balance)}
        </div>
      </div>

      <div
        className="mt-4 grid grid-cols-3 gap-3 rounded-lg p-3"
        style={{ background: token.colorFillQuaternary }}
      >
        <Stat label="Inicial" value={money(box.saldo_inicial)} />
        <Stat
          label="Entradas"
          value={`+ ${money(box.total_entradas)}`}
          color={token.colorSuccess}
        />
        <Stat
          label="Salidas"
          value={`- ${money(box.total_salidas)}`}
          color={token.colorError}
        />
      </div>

      <Text
        type="secondary"
        style={{ fontSize: 12, display: "block" }}
        className="mt-3"
      >
        {open ? "Caja abierta" : `Cerrada el ${formatDateTime(box.closedAt)}`}
      </Text>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Tooltip title={movementTooltip}>
          <span className="block">
            <Button
              block
              icon={<SwapOutlined />}
              disabled={!canMove}
              onClick={() => onMovement?.(box)}
            >
              Movimiento
            </Button>
          </span>
        </Tooltip>

        <Popconfirm
          title="¿Cerrar caja?"
          description="Esta acción no se puede deshacer."
          okText="Sí, cerrar"
          cancelText="Cancelar"
          disabled={!open}
          onConfirm={() => onClose?.(box)}
        >
          <Button
            block
            danger
            icon={<LockOutlined />}
            disabled={!open}
            loading={closingId === box.id_caja}
          >
            Cerrar
          </Button>
        </Popconfirm>
      </div>
    </Card>
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
  const { token } = theme.useToken();

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

  const groups = groupByMonth(dataSource);

  return (
    <div className="space-y-6 mt-10">
      {groups.map((group) => (
        <section key={group.key}>
          <Flex align="center" gap="small" className="mb-3">
            <Title level={5} style={{ margin: 0 }}>
              {group.label}
            </Title>
            <Tag style={{ margin: 0 }}>
              {group.items.length} {group.items.length === 1 ? "caja" : "cajas"}
            </Tag>
            <div
              style={{
                flex: 1,
                height: 1,
                background: token.colorBorderSecondary,
              }}
            />
          </Flex>

          <Row gutter={[16, 16]}>
            {group.items.map((box) => (
              <Col key={box.id_caja} xs={24} md={12} xl={8}>
                <BoxCard
                  box={box}
                  loading={loading}
                  closingId={closingId}
                  onMovement={onMovement}
                  onClose={onClose}
                />
              </Col>
            ))}
          </Row>
        </section>
      ))}

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
