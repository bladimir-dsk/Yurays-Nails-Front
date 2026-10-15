import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Empty,
  Flex,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SaleApi } from "@/api/endpoints/saleApi";
import { BoxApi } from "@/api/endpoints/boxApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const FMT = "YYYY-MM-DD";

const money = (n) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n ?? 0);

/* ------------------------------------------------------------------ */
/*  Adaptador de la respuesta de /caja/hoy                             */
/*  Si tus campos se llaman distinto, cámbialos SOLO aquí.             */
/* ------------------------------------------------------------------ */

const toArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.items)) return res.items;
  return res ? [res] : [];
};

const CAJA = {
  id: (c) => c.id ?? c.id_caja,
  name: (c) => c.nombre ?? c.name ?? `Caja #${c.id ?? c.id_caja ?? ""}`,
  isClosed: (c) =>
    c.cerrada === true ||
    /cerrad|closed/i.test(String(c.estado ?? c.status ?? "")) ||
    Boolean(c.fecha_cierre ?? c.closedAt),
  movements: (c) => c.movimientos ?? c.movements ?? [],
};

const MOV = {
  id: (m, i) => m.id ?? m.id_movimiento ?? i,
  amount: (m) => Number(m.monto ?? m.amount ?? 0),
  type: (m) => String(m.tipo ?? m.type ?? ""),
  concept: (m) =>
    m.concepto ?? m.descripcion ?? m.description ?? m.motivo ?? "—",
  date: (m) => m.createdAt ?? m.created_at ?? m.fecha ?? m.date,
};

const isExpense = (m) =>
  /egreso|salida|gasto|retiro|expense|out/i.test(MOV.type(m)) ||
  MOV.amount(m) < 0;

const summarizeBox = (c) => {
  const movs = CAJA.movements(c);
  const income = movs
    .filter((m) => !isExpense(m))
    .reduce((acc, m) => acc + Math.abs(MOV.amount(m)), 0);
  const expense = movs
    .filter(isExpense)
    .reduce((acc, m) => acc + Math.abs(MOV.amount(m)), 0);
  return { income, expense, balance: income - expense, count: movs.length };
};

/* ------------------------------------------------------------------ */
/*  Piezas reutilizables                                               */
/* ------------------------------------------------------------------ */

function Section({ title, subtitle, extra, children }) {
  return (
    <section className="mb-8">
      <Flex
        justify="space-between"
        align="end"
        wrap="wrap"
        gap="small"
        className="mb-3"
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && <Text type="secondary">{subtitle}</Text>}
        </div>
        {extra}
      </Flex>
      {children}
    </section>
  );
}

function StatCard({ title, value, icon, color, hint, loading, formatter }) {
  return (
    <Card loading={loading} styles={{ body: { padding: 20 } }}>
      <Flex align="center" gap="middle">
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${color}1a`,
            color,
            fontSize: 22,
          }}
          className="flex shrink-0 items-center justify-center"
        >
          {icon}
        </div>
        <div className="min-w-0">
          <Statistic
            title={title}
            value={value}
            formatter={formatter}
            valueStyle={{ fontSize: 22, fontWeight: 600 }}
          />
          {hint && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {hint}
            </Text>
          )}
        </div>
      </Flex>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Cajas de hoy                                                       */
/* ------------------------------------------------------------------ */

const MOVEMENT_COLUMNS = [
  {
    title: "Hora",
    key: "hora",
    width: 80,
    render: (_, m) => {
      const d = dayjs(MOV.date(m));
      return d.isValid() ? d.format("HH:mm") : "—";
    },
  },
  {
    title: "Tipo",
    key: "tipo",
    width: 100,
    render: (_, m) =>
      isExpense(m) ? (
        <Tag color="red">Salida</Tag>
      ) : (
        <Tag color="green">Entrada</Tag>
      ),
  },
  { title: "Concepto", key: "concepto", render: (_, m) => MOV.concept(m) },
  {
    title: "Monto",
    key: "monto",
    align: "right",
    render: (_, m) => {
      const out = isExpense(m);
      return (
        <Text type={out ? "danger" : "success"} strong>
          {out ? "−" : "+"}
          {money(Math.abs(MOV.amount(m)))}
        </Text>
      );
    },
  },
];

function TodayBoxes() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    BoxApi.getAllToday()
      .then((res) => setBoxes(toArray(res)))
      .catch((e) => {
        // Sin caja hoy no es un error: simplemente no hay datos
        if (e?.response?.status === 404) return setBoxes([]);
        message.error("No se pudieron cargar las cajas de hoy");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const totals = useMemo(() => {
    const all = boxes.map(summarizeBox);
    return {
      income: all.reduce((a, s) => a + s.income, 0),
      expense: all.reduce((a, s) => a + s.expense, 0),
      open: boxes.filter((c) => !CAJA.isClosed(c)).length,
    };
  }, [boxes]);

  return (
    <Section
      title="Hoy"
      subtitle={`Cajas del ${dayjs().format("DD/MM/YYYY")}`}
      extra={
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
          Actualizar
        </Button>
      }
    >
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Cajas abiertas"
            value={totals.open}
            hint={`${boxes.length} en total hoy`}
            icon={<ShopOutlined />}
            color="#722ed1"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Ingresos"
            value={totals.income}
            formatter={(v) => money(v)}
            icon={<ArrowUpOutlined />}
            color="#52c41a"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Egresos"
            value={totals.expense}
            formatter={(v) => money(v)}
            icon={<ArrowDownOutlined />}
            color="#ff4d4f"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Balance del día"
            value={totals.income - totals.expense}
            formatter={(v) => money(v)}
            icon={<WalletOutlined />}
            color="#1677ff"
            loading={loading}
          />
        </Col>
      </Row>

      <Spin spinning={loading}>
        {boxes.length === 0 && !loading ? (
          <Card>
            <Empty description="No hay cajas registradas hoy" />
          </Card>
        ) : (
          <Collapse
            defaultActiveKey={boxes
              .filter((c) => !CAJA.isClosed(c))
              .map((c) => String(CAJA.id(c)))}
            items={boxes.map((c) => {
              const s = summarizeBox(c);
              const closed = CAJA.isClosed(c);
              return {
                key: String(CAJA.id(c)),
                label: (
                  <Flex
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                    gap="small"
                  >
                    <Flex align="center" gap="small">
                      <Text strong>{CAJA.name(c)}</Text>
                      <Tag color={closed ? "default" : "green"}>
                        {closed ? "Cerrada" : "Abierta"}
                      </Tag>
                      <Text type="secondary">
                        {s.count} movimiento{s.count === 1 ? "" : "s"}
                      </Text>
                    </Flex>
                    <Text strong>{money(s.balance)}</Text>
                  </Flex>
                ),
                children: (
                  <Table
                    size="small"
                    rowKey={(m, i) => MOV.id(m, i)}
                    columns={MOVEMENT_COLUMNS}
                    dataSource={CAJA.movements(c)}
                    pagination={{ pageSize: 5, hideOnSinglePage: true }}
                    scroll={{ x: "max-content" }}
                    locale={{ emptyText: "Sin movimientos" }}
                  />
                ),
              };
            })}
          />
        )}
      </Spin>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Página                                                             */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  // ---------- Ventas por día ----------
  const [range, setRange] = useState([dayjs().subtract(29, "day"), dayjs()]);
  const [daily, setDaily] = useState({
    data: [],
    summary: { total_sales: 0, total_amount: 0 },
  });
  const [loadingDaily, setLoadingDaily] = useState(false);

  // ---------- Ventas de la semana ----------
  const [week, setWeek] = useState(dayjs());
  const [weekly, setWeekly] = useState({ week: null, data: [] });
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  useEffect(() => {
    if (!range?.[0] || !range?.[1]) return;
    setLoadingDaily(true);
    SaleApi.getDailyStats({
      from: range[0].format(FMT),
      to: range[1].format(FMT),
    })
      .then(setDaily)
      .catch(() => message.error("No se pudieron cargar las ventas por día"))
      .finally(() => setLoadingDaily(false));
  }, [range]);

  useEffect(() => {
    if (!week) return;
    setLoadingWeekly(true);
    SaleApi.getWeeklyStats({ date: week.format(FMT) })
      .then(setWeekly)
      .catch(() => message.error("No se pudieron cargar las ventas semanales"))
      .finally(() => setLoadingWeekly(false));
  }, [week]);

  const { total_sales, total_amount } = daily.summary;
  const average = total_sales ? total_amount / total_sales : 0;

  // Una barra por venta: "lun · 010" y el detalle completo en el tooltip
  const weeklyData = weekly.data.map((s) => ({
    ...s,
    label: `${s.day.slice(0, 3)} · ${s.sale_number.slice(-3)}`,
  }));

  return (
    <>
      <div className="mb-6">
        <Title level={2} className="mb-0 text-xl sm:text-2xl">
          PANEL
        </Title>
        <Text type="secondary">Resumen de tu negocio</Text>
      </div>

      {/* 1. Lo que pasa hoy */}
      <TodayBoxes />

      {/* 2. Resumen de un periodo */}
      <Section
        title="Resumen del periodo"
        subtitle="Ventas dentro del rango de fechas elegido"
        extra={
          <RangePicker
            value={range}
            onChange={(v) => v && setRange(v)}
            allowClear={false}
            format="DD/MM/YYYY"
            className="w-full sm:w-auto"
          />
        }
      >
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={8}>
            <StatCard
              title="Ventas realizadas"
              value={total_sales}
              icon={<ShoppingCartOutlined />}
              color="#52c41a"
              loading={loadingDaily}
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              title="Dinero ganado"
              value={total_amount}
              formatter={(v) => money(v)}
              icon={<DollarOutlined />}
              color="#1677ff"
              loading={loadingDaily}
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              title="Ticket promedio"
              value={average}
              formatter={(v) => money(v)}
              hint="Dinero ganado ÷ ventas"
              icon={<WalletOutlined />}
              color="#fa8c16"
              loading={loadingDaily}
            />
          </Col>
        </Row>

        <Card title="Evolución día por día">
          <Spin spinning={loadingDaily}>
            {daily.data.length === 0 ? (
              <Empty description="Sin ventas en este rango" />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <LineChart data={daily.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => dayjs(d).format("DD/MM")}
                    />
                    <YAxis yAxisId="left" tickFormatter={(v) => `$${v}`} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      allowDecimals={false}
                    />
                    <Tooltip
                      labelFormatter={(d) => dayjs(d).format("DD/MM/YYYY")}
                      formatter={(value, name) =>
                        name === "Dinero" ? money(value) : value
                      }
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="total_amount"
                      name="Dinero"
                      stroke="#1677ff"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="total_sales"
                      name="Ventas"
                      stroke="#52c41a"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Spin>
        </Card>
      </Section>

      {/* 3. Detalle de la semana */}
      <Section
        title="Ventas de la semana"
        subtitle="Cada barra es una venta"
        extra={
          <DatePicker
            picker="week"
            value={week}
            onChange={(v) => v && setWeek(v)}
            allowClear={false}
          />
        }
      >
        <Card>
          <Spin spinning={loadingWeekly}>
            {weeklyData.length === 0 ? (
              <Empty description="Sin ventas esta semana" />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(v) => [money(v), "Total"]}
                      labelFormatter={(_, payload) => {
                        const s = payload?.[0]?.payload;
                        return s
                          ? `${s.sale_number} · ${s.day} ${dayjs(s.createdAt).format("HH:mm")}`
                          : "";
                      }}
                    />
                    <Bar
                      dataKey="total"
                      name="Total"
                      fill="#1677ff"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Spin>
        </Card>
      </Section>
    </>
  );
}
