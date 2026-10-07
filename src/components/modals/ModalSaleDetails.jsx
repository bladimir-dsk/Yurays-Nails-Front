import {
  Modal,
  Descriptions,
  Table,
  Typography,
  Divider,
  Spin,
  Button,
  Space,
} from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import React from "react";
import { printSaleTicket } from "@/utils/generateSaleTicket";

const { Text } = Typography;

export default function SaleDetailModal({ open, onClose, sale, loading }) {
  const detailColumns = [
    { title: "Producto", dataIndex: ["product", "name"], key: "name" },
    { title: "Código", dataIndex: ["product", "code"], key: "code" },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Precio unitario",
      dataIndex: "unit_price",
      key: "unit_price",
      align: "right",
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      align: "right",
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
  ];

  const [printing, setPrinting] = React.useState(false);

  const handlePrint = async () => {
    try {
      setPrinting(true);
      await printSaleTicket(sale);
    } catch (err) {
      console.error(err);
    } finally {
      setPrinting(false);
    }
  };
  return (
    <Modal
      title={sale ? `Detalle de venta ${sale.sale_number}` : "Detalle de venta"}
      open={open}
      onCancel={onClose}
      footer={
        sale && (
          <Space>
            <Button onClick={onClose}>Cerrar</Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              loading={printing}
              onClick={handlePrint}
              style={{
                backgroundColor: "var(--color-coffee-400)",
                borderColor: "var(--color-coffee-400)",
              }}
            >
              Imprimir ticket
            </Button>
          </Space>
        )
      }
      width={700}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : (
        sale && (
          <>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Folio">
                {sale.sale_number}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha">
                {new Date(sale.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Vendedor">
                {sale.creatorName}
              </Descriptions.Item>
              <Descriptions.Item label="Correo">
                {sale.creatorUser}
              </Descriptions.Item>
              <Descriptions.Item label="Empresa" span={2}>
                {sale.empresa?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Total" span={2}>
                <Text strong>${Number(sale.total).toFixed(2)}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Productos</Divider>

            <Table
              columns={detailColumns}
              dataSource={sale.details}
              rowKey="id_sale_detail"
              pagination={false}
              size="small"
            />
          </>
        )
      )}
    </Modal>
  );
}
