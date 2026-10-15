import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Empty,
  Flex,
  Radio,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
  message,
} from "antd";
import { DownloadOutlined, FileSearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import * as XLSX from "xlsx";
import { ProductApi } from "@/api/endpoints/productApi";
import { BoxApi } from "@/api/endpoints/boxApi";

const { Title, Text } = Typography;

/* ----------------------------- helpers ----------------------------- */

// Acepta [], { data: [] }, { items: [] } o un objeto suelto y siempre regresa un arreglo
const toArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.items)) return res.items;
  return res ? [res] : [];
};

const prettify = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (c) => c.toUpperCase());

const formatCell = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return value;
};

// Genera columnas a partir de las llaves de la primera fila (omite objetos/arreglos anidados).
// Si ya conoces la forma de tu respuesta, reemplaza esto por columnas fijas.
const buildColumns = (rows) => {
  if (!rows || !rows.length) return [];
  return Object.keys(rows[0])
    .filter((key) => typeof rows[0][key] !== "object" || rows[0][key] === null)
    .map((key) => ({
      title: prettify(key),
      dataIndex: key,
      key,
      render: formatCell,
    }));
};

const downloadExcel = (rows, filename, sheetName = "Reporte", columns) => {
  if (!rows || !rows.length) return;

  // Si no se pasan columnas, se infieren de la primera fila
  const cols =
    columns ??
    Object.keys(rows[0])
      .filter((k) => typeof rows[0][k] !== "object" || rows[0][k] === null)
      .map((k) => ({ title: prettify(k), dataIndex: k }));

  const data = rows.map((r) =>
    Object.fromEntries(cols.map((c) => [c.title, r[c.dataIndex] ?? ""])),
  );

  const sheet = XLSX.utils.json_to_sheet(data);

  // Ancho de columna según el contenido
  sheet["!cols"] = cols.map((c) => {
    const longest = Math.max(
      c.title.length,
      ...rows.map((r) => String(r[c.dataIndex] ?? "").length),
    );
    return { wch: Math.min(longest + 2, 40) };
  });

  const book = XLSX.utils.book_new();
  // Excel no permite / \ ? * [ ] : en el nombre de la hoja y limita a 31 caracteres
  const safeName = sheetName.replace(/[\\/?*[\]:]/g, "-").slice(0, 31);
  XLSX.utils.book_append_sheet(book, sheet, safeName);
  XLSX.writeFile(book, filename);
};

/* -------------------------- resultado genérico ------------------------- */

function ReportResult({
  title,
  rows,
  loading,
  error,
  filename,
  columns: customColumns,
}) {
  const columns = useMemo(
    () => customColumns ?? buildColumns(rows),
    [customColumns, rows],
  );

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="No se pudo generar el reporte"
        description={error}
      />
    );
  }

  if (!loading && rows === null) {
    return (
      <Empty
        image={<FileSearchOutlined style={{ fontSize: 40 }} />}
        description="Elige las opciones y presiona “Generar reporte”."
      />
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap="small">
        <Text strong>{title}</Text>
        <Button
          icon={<DownloadOutlined />}
          disabled={!rows?.length}
          onClick={() => downloadExcel(rows, filename, title, customColumns)}
        >
          Descargar Excel
        </Button>
      </Flex>

      <Table
        rowKey={(row, i) => row.id_product ?? row.id ?? i}
        loading={loading}
        columns={columns}
        dataSource={rows ?? []}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No hay datos para este reporte" }}
      />
    </Space>
  );
}

/* --------------------------- reporte: productos -------------------------- */

// El backend devuelve un objeto { [id_category]: { name, products: [...] } }.
// Se aplana a una fila por producto, con su categoría.
const flattenByCategory = (res) =>
  Object.values(res ?? {}).flatMap((cat) =>
    (cat.products ?? []).map((p) => ({
      id_product: p.id_product,
      category: cat.name,
      code: p.code,
      name: p.name,
      price: Number(p.price),
      stock: p.stock,
    })),
  );

const money = (v) =>
  Number(v).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

const PRODUCT_COLUMNS = [
  {
    title: "Categoría",
    dataIndex: "category",
    sorter: (a, b) => a.category.localeCompare(b.category),
  },
  { title: "Código", dataIndex: "code" },
  {
    title: "Producto",
    dataIndex: "name",
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: "Precio",
    dataIndex: "price",
    align: "right",
    sorter: (a, b) => a.price - b.price,
    render: money,
  },
  {
    title: "Stock",
    dataIndex: "stock",
    align: "right",
    sorter: (a, b) => a.stock - b.stock,
    render: (v) => (v === 0 ? <Text type="danger">0</Text> : v),
  },
];

function ProductReport() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ProductApi.getReport();
      setRows(flattenByCategory(res));
    } catch (e) {
      setError(
        e?.response?.data?.message || "Intenta de nuevo en unos momentos.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap="small">
        <Text type="secondary">Productos agrupados por categoría.</Text>
        <Button
          type="primary"
          onClick={generate}
          loading={loading}
          style={{
            backgroundColor: "var(--color-coffee-400)",
            borderColor: "var(--color-coffee-400)",
          }}
        >
          Generar reporte
        </Button>
      </Flex>

      <ReportResult
        title="Productos por categoría"
        columns={PRODUCT_COLUMNS}
        rows={rows}
        loading={loading}
        error={error}
        filename={`reporte-productos-${dayjs().format("YYYY-MM-DD")}.xlsx`}
      />
    </Space>
  );
}

/* ------------------------ reporte: corte de caja ------------------------ */

const MODES = {
  today: "today",
  date: "date",
  box: "box",
};

function BoxReport() {
  const [mode, setMode] = useState(MODES.today);
  const [date, setDate] = useState(dayjs());
  const [boxId, setBoxId] = useState(null);

  const [boxes, setBoxes] = useState([]);
  const [loadingBoxes, setLoadingBoxes] = useState(false);

  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar cajas solo cuando se necesita el selector
  useEffect(() => {
    if (mode !== MODES.box || boxes.length) return;
    setLoadingBoxes(true);
    BoxApi.getAll({ page: 1, limit: 100 })
      .then((res) => setBoxes(toArray(res)))
      .catch(() => message.error("No se pudieron cargar las cajas"))
      .finally(() => setLoadingBoxes(false));
  }, [mode, boxes.length]);

  // Al cambiar de modo, se limpia el resultado anterior
  useEffect(() => {
    setRows(null);
    setError(null);
  }, [mode]);

  const canGenerate =
    mode === MODES.today ||
    (mode === MODES.date && date) ||
    (mode === MODES.box && boxId);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (mode === MODES.today) res = await BoxApi.getAllToday();
      if (mode === MODES.date)
        res = await BoxApi.getByDate(date.format("YYYY-MM-DD"));
      if (mode === MODES.box) res = await BoxApi.getById(boxId);
      setRows(toArray(res));
    } catch (e) {
      setError(
        e?.response?.data?.message || "Intenta de nuevo en unos momentos.",
      );
    } finally {
      setLoading(false);
    }
  };

  const title = {
    [MODES.today]: "Corte de caja de hoy",
    [MODES.date]: `Corte de caja del ${date?.format("DD/MM/YYYY")}`,
    [MODES.box]: "Corte de la caja seleccionada",
  }[mode];

  const filename = {
    [MODES.today]: `corte-hoy-${dayjs().format("YYYY-MM-DD")}.xlsx`,
    [MODES.date]: `corte-${date?.format("YYYY-MM-DD")}.xlsx`,
    [MODES.box]: `corte-caja-${boxId}.xlsx`,
  }[mode];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Flex gap="middle" align="center" wrap="wrap">
        <Radio.Group
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          options={[
            { label: "Hoy", value: MODES.today },
            { label: "Por fecha", value: MODES.date },
            { label: "Por caja", value: MODES.box },
          ]}
        />

        {mode === MODES.date && (
          <DatePicker
            value={date}
            onChange={setDate}
            format="YYYY/MM/DD"
            allowClear={false}
            disabledDate={(d) => d && d.isAfter(dayjs(), "day")}
          />
        )}

        {mode === MODES.box && (
          <Select
            showSearch
            placeholder="Selecciona una caja"
            style={{ minWidth: 240 }}
            loading={loadingBoxes}
            value={boxId}
            onChange={setBoxId}
            optionFilterProp="label"
            options={boxes.map((b) => ({
              value: b.id_caja,
              label: b.name || b.nombre || `Caja #${b.id_caja}`,
            }))}
          />
        )}

        <Button
          type="primary"
          onClick={generate}
          loading={loading}
          disabled={!canGenerate}
          style={{
            backgroundColor: "var(--color-coffee-400)",
            borderColor: "var(--color-coffee-400)",
          }}
        >
          Generar reporte
        </Button>
      </Flex>

      <ReportResult
        title={title}
        rows={rows}
        loading={loading}
        error={error}
        filename={filename}
      />
    </Space>
  );
}

/* -------------------------------- página -------------------------------- */

export default function ReportPage() {
  return (
    <div className="space-y-6">
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <div className="space-y-2">
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            REPORTES
          </Title>
          <Text type="secondary">Genera reportes de ventas y operaciones</Text>
        </div>
      </Flex>

      <Card>
        <Tabs
          defaultActiveKey="products"
          destroyInactiveTabPane={false}
          items={[
            {
              key: "products",
              label: "Productos",
              children: <ProductReport />,
            },
            { key: "boxes", label: "Cortes de caja", children: <BoxReport /> },
          ]}
        />
      </Card>
    </div>
  );
}
