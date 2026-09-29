import { useEffect, useState } from "react";
import {
  Card,
  Col,
  DatePicker,
  Empty,
  Flex,
  Row,
  Spin,
  Statistic,
  Typography,
  message,
} from "antd";
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
// ajusta la ruta

const { Title } = Typography;
const { RangePicker } = DatePicker;

const money = (n) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n ?? 0);

const FMT = "YYYY-MM-DD";

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
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap="small"
        className="mb-6"
      >
        <Title level={2} className="mb-0 text-xl sm:text-2xl">
          PANEL
        </Title>
        <RangePicker
          value={range}
          onChange={(v) => v && setRange(v)}
          allowClear={false}
          format="DD/MM/YYYY"
          className="w-full sm:w-auto"
        />
      </Flex>

      {/* Tarjetas resumen */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={8}>
          <Card loading={loadingDaily}>
            <Statistic title="Ventas realizadas" value={total_sales} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loadingDaily}>
            <Statistic
              title="Dinero ganado"
              value={total_amount}
              formatter={(v) => money(v)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loadingDaily}>
            <Statistic
              title="Ticket promedio"
              value={average}
              formatter={(v) => money(v)}
            />
          </Card>
        </Col>
      </Row>

      {/* Ventas y dinero por día */}
      <Card title="Ventas por día" className="mb-4">
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

      {/* Cada venta de la semana */}
      <Card
        title="Ventas de la semana"
        extra={
          <DatePicker
            picker="week"
            value={week}
            onChange={(v) => v && setWeek(v)}
            allowClear={false}
          />
        }
      >
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
    </>
  );
}
