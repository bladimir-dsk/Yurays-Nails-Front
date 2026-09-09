import { Button, Flex, Typography } from "antd";
import React from "react";
const { Title } = Typography;
export default function ProductsPage() {
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
          PRODUCTOS
        </Title>
        {/* <Button type="primary" onClick={handleOpenCreate}>
          Nuevo salón
        </Button> */}
      </Flex>
    </div>
  );
}
