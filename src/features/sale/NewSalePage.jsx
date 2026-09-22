import { useNotification } from "@/components/NotificationProvider";
import {
  Flex,
  Button,
  Typography,
  Input,
  Table,
  InputNumber,
  Popconfirm,
  Card,
  AutoComplete,
  Modal,
  Descriptions,
} from "antd";
import {
  DeleteOutlined,
  ScanOutlined,
  SearchOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import React, { useRef, useState, useCallback } from "react";
import { SaleApi } from "@/api/endpoints/saleApi";
import { ProductApi } from "@/api/endpoints/productApi";
import { getErrorMessage } from "@/utils/getErrorMessage";

const { Title, Text } = Typography;

export default function NewSalePage() {
  const notify = useNotification();
  const scanInputRef = useRef(null);
  const amountPaidRef = useRef(null);

  const [scanValue, setScanValue] = useState("");
  const [cart, setCart] = useState([]);
  const [loadingScan, setLoadingScan] = useState(false);
  const [savingSale, setSavingSale] = useState(false);

  const [nameQuery, setNameQuery] = useState("");
  const [nameOptions, setNameOptions] = useState([]);
  const [searchingName, setSearchingName] = useState(false);
  const debounceRef = useRef(null);

  // --- Modal de pago ---
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState(null);

  const focusScanner = () => {
    setTimeout(() => scanInputRef.current?.focus(), 0);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const change =
    amountPaid !== null && amountPaid !== undefined
      ? Number(amountPaid) - total
      : null;

  const addProductToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.id_product === product.id_product,
      );

      const currentQty = existing ? existing.quantity : 0;
      if (currentQty + 1 > product.stock) {
        notify.error(
          "Sin stock suficiente",
          `"${product.name}" solo tiene ${product.stock} en existencia.`,
        );
        return prevCart;
      }

      if (existing) {
        return prevCart.map((item) =>
          item.id_product === product.id_product
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...prevCart,
        {
          id_product: product.id_product,
          code: product.code,
          name: product.name,
          price: Number(product.price),
          stock: product.stock,
          quantity: 1,
        },
      ];
    });
  };

  const handleScan = async (code) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    setLoadingScan(true);
    try {
      const product = await ProductApi.getByCode(trimmedCode);
      addProductToCart(product);
    } catch (error) {
      notify.error(
        "Producto no encontrado",
        getErrorMessage(
          error,
          `No se encontró ningún producto con el código "${trimmedCode}"`,
        ),
      );
    } finally {
      setLoadingScan(false);
      setScanValue("");
      focusScanner();
    }
  };

  const handleNameSearch = useCallback(
    (value) => {
      setNameQuery(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value || value.trim().length < 2) {
        setNameOptions([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setSearchingName(true);
        try {
          const res = await ProductApi.getAll({
            page: 1,
            limit: 10,
            name: value,
          });
          const products = res.data ?? res.items ?? res;

          setNameOptions(
            products.map((p) => ({
              value: `${p.name} - $${Number(p.price).toFixed(2)}`,
              product: p,
            })),
          );
        } catch (error) {
          notify.error("Error al buscar productos", getErrorMessage(error));
        } finally {
          setSearchingName(false);
        }
      }, 350);
    },
    [notify],
  );

  const handleSelectByName = (_, option) => {
    addProductToCart(option.product);
    setNameQuery("");
    setNameOptions([]);
    focusScanner();
  };

  const handleQuantityChange = (id_product, value) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id_product !== id_product) return item;

        if (value > item.stock) {
          notify.warning(
            "Stock excedido",
            `Solo hay ${item.stock} unidades de "${item.name}"`,
          );
          return { ...item, quantity: item.stock };
        }

        return { ...item, quantity: value || 1 };
      }),
    );
  };

  const handleRemove = (id_product) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.id_product !== id_product),
    );
  };

  // Abre el modal de cobro (ya NO guarda directo)
  const handleOpenPaymentModal = () => {
    if (cart.length === 0) {
      notify.warning("Agrega al menos un producto a la venta");
      return;
    }
    setAmountPaid(null);
    setPaymentModalOpen(true);
    setTimeout(() => amountPaidRef.current?.focus(), 100);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setAmountPaid(null);
    focusScanner();
  };

  // Este es el que realmente manda el POST, solo tras confirmar en el modal
  const handleConfirmSale = async () => {
    if (amountPaid === null || amountPaid === undefined) {
      notify.warning("Ingresa el monto con el que paga el cliente");
      return;
    }

    if (Number(amountPaid) < total) {
      notify.warning(
        "Monto insuficiente",
        `El cliente debe pagar al menos $${total.toFixed(2)}`,
      );
      return;
    }

    setSavingSale(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          id_product: item.id_product,
          quantity: item.quantity,
        })),
      };

      const sale = await SaleApi.create(payload);

      notify.success(
        "Venta registrada",
        `Folio: ${sale.sale_number} — Cambio: $${(Number(amountPaid) - total).toFixed(2)}`,
      );

      setCart([]);
      setPaymentModalOpen(false);
      setAmountPaid(null);
    } catch (error) {
      notify.error("Error al guardar la venta", getErrorMessage(error));
    } finally {
      setSavingSale(false);
      focusScanner();
    }
  };

  const columns = [
    { title: "Código", dataIndex: "code", key: "code" },
    { title: "Producto", dataIndex: "name", key: "name" },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${Number(price).toFixed(2)}`,
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty, record) => (
        <InputNumber
          min={1}
          max={record.stock}
          value={qty}
          onChange={(value) => handleQuantityChange(record.id_product, value)}
        />
      ),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (_, record) => `$${(record.price * record.quantity).toFixed(2)}`,
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="¿Quitar producto de la venta?"
          onConfirm={() => handleRemove(record.id_product)}
        >
          <Button danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            NUEVA VENTA
          </Title>
          <Text type="secondary">Registra una nueva venta</Text>
        </div>
      </Flex>

      <Card style={{ marginTop: 24 }}>
        <Flex gap="middle" wrap="wrap">
          <Input
            ref={scanInputRef}
            size="large"
            style={{ flex: 1, minWidth: 280 }}
            placeholder="Escanea el código de barras..."
            prefix={<ScanOutlined />}
            value={scanValue}
            disabled={loadingScan}
            onChange={(e) => setScanValue(e.target.value)}
            onPressEnter={() => handleScan(scanValue)}
            autoFocus
          />

          <AutoComplete
            style={{ flex: 1, minWidth: 280 }}
            options={nameOptions}
            value={nameQuery}
            onSearch={handleNameSearch}
            onSelect={handleSelectByName}
            notFoundContent={searchingName ? "Buscando..." : "Sin resultados"}
          >
            <Input
              size="large"
              placeholder="O busca por nombre si el código no se lee..."
              prefix={<SearchOutlined />}
            />
          </AutoComplete>
        </Flex>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Table
          rowKey="id_product"
          columns={columns}
          dataSource={cart}
          pagination={false}
          locale={{ emptyText: "Escanea un producto o búscalo por nombre" }}
        />

        <Flex justify="space-between" align="center" style={{ marginTop: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            Total: ${total.toFixed(2)}
          </Title>
          <Button
            type="primary"
            size="large"
            disabled={cart.length === 0}
            onClick={handleOpenPaymentModal}
          >
            Guardar venta
          </Button>
        </Flex>
      </Card>

      <Modal
        title="Cobro de venta"
        open={paymentModalOpen}
        onCancel={handleClosePaymentModal}
        footer={[
          <Button key="cancel" onClick={handleClosePaymentModal}>
            Cancelar
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={savingSale}
            disabled={
              amountPaid === null ||
              amountPaid === undefined ||
              Number(amountPaid) < total
            }
            onClick={handleConfirmSale}
          >
            Finalizar venta
          </Button>,
        ]}
      >
        <Descriptions
          column={1}
          bordered
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label="Total a pagar">
            <Text strong style={{ fontSize: 18 }}>
              ${total.toFixed(2)}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        <Text>¿Con cuánto paga el cliente?</Text>
        <InputNumber
          ref={amountPaidRef}
          size="large"
          style={{ width: "100%", marginTop: 8 }}
          min={0}
          step={0.01}
          precision={2}
          prefix={<DollarOutlined />}
          value={amountPaid}
          onChange={setAmountPaid}
          onPressEnter={handleConfirmSale}
          placeholder="0.00"
        />

        {amountPaid !== null && amountPaid !== undefined && (
          <div style={{ marginTop: 16 }}>
            {Number(amountPaid) < total ? (
              <Text type="danger" strong>
                Falta: ${(total - Number(amountPaid)).toFixed(2)}
              </Text>
            ) : (
              <Text type="success" strong style={{ fontSize: 20 }}>
                Cambio: ${change.toFixed(2)}
              </Text>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
