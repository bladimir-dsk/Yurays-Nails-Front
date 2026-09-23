import jsPDF from "jspdf";

// --- Datos fijos de la tienda ---
const STORE_INFO = {
  name: "YURAY'S NAILS STORE",
  address: "C. 26 x 43 y 45, Yocchenkax, Tekax",
  phone: "Tel: 997 124 2390",
  // Opción A (carpeta public): "/logo.png"
  // Opción B (src/assets):     usa el import y pásalo aquí (ver ejemplo abajo)
  logoUrl: "/YNS.png", // <-- ajusta esta ruta según donde pongas el archivo
};

const PAGE_WIDTH_MM = 100;
const MARGIN_MM = 4;
const CONTENT_WIDTH = PAGE_WIDTH_MM - MARGIN_MM * 2;

// --- Carga la imagen y la convierte a dataURL para jsPDF ---
function loadImageAsDataURL(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        console.warn("No se pudo procesar el logo:", err);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn("No se encontró el logo en:", url);
      resolve(null);
    };
    img.src = url;
  });
}

export async function generateSaleTicketPDF(sale) {
  // --- 1. Cargar el logo (si existe) ---
  const logoDataUrl = await loadImageAsDataURL(STORE_INFO.logoUrl);

  // --- 2. Calcular alto dinámico ---
  const LOGO_SPACE = logoDataUrl ? 22 : 6;
  const HEADER_HEIGHT = 34;
  const LINE_HEIGHT = 5;
  const FOOTER_HEIGHT = 22;

  const itemsCount = sale?.details?.length || 0;
  const estimatedItemsHeight = itemsCount * LINE_HEIGHT * 2;

  const totalHeight =
    LOGO_SPACE +
    HEADER_HEIGHT +
    estimatedItemsHeight +
    FOOTER_HEIGHT +
    MARGIN_MM * 2;

  // --- 3. Crear documento ---
  const doc = new jsPDF({
    unit: "mm",
    format: [PAGE_WIDTH_MM, Math.max(totalHeight, 80)],
  });

  let y = MARGIN_MM;
  const centerX = PAGE_WIDTH_MM / 2;

  doc.setFont("helvetica", "normal");

  // --- 4. Logo ---
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", centerX - 10, y, 20, 20);
    y += 22;
  } else {
    y += 6;
  }

  // --- 5. Datos de la tienda ---
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(STORE_INFO.name, centerX, y, { align: "center" });
  y += 4.5;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(STORE_INFO.address, centerX, y, {
    align: "center",
    maxWidth: CONTENT_WIDTH,
  });
  y += 4;
  doc.text(STORE_INFO.phone, centerX, y, { align: "center" });
  y += 5;

  drawDashedLine(doc, y);
  y += 4;

  // --- 6. Datos de la venta ---
  doc.setFontSize(8);
  doc.text(`Folio: ${sale.sale_number}`, MARGIN_MM, y);
  y += 4;
  doc.text(`Fecha: ${formatDate(sale.createdAt)}`, MARGIN_MM, y);
  y += 4;
  if (sale.creatorName) {
    doc.text(`Atendio: ${sale.creatorName}`, MARGIN_MM, y);
    y += 4;
  }

  drawDashedLine(doc, y);
  y += 4;

  // --- 7. Encabezado de productos ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Producto", MARGIN_MM, y);
  doc.text("Cant", MARGIN_MM + 38, y);
  doc.text("P.Unit", MARGIN_MM + 50, y);
  doc.text("Subtotal", PAGE_WIDTH_MM - MARGIN_MM, y, { align: "right" });
  y += 3.5;
  doc.setFont("helvetica", "normal");

  drawDashedLine(doc, y);
  y += 4;

  // --- 8. Productos ---
  (sale.details || []).forEach((item) => {
    const name = item.product?.name || "Producto";
    const qty = item.quantity;
    const unitPrice = Number(item.unit_price).toFixed(2);
    const subtotal = Number(item.subtotal).toFixed(2);

    const nameLines = doc.splitTextToSize(name, 36);
    doc.setFontSize(7.5);
    doc.text(nameLines, MARGIN_MM, y);

    doc.text(String(qty), MARGIN_MM + 38, y);
    doc.text(`$${unitPrice}`, MARGIN_MM + 50, y);
    doc.text(`$${subtotal}`, PAGE_WIDTH_MM - MARGIN_MM, y, { align: "right" });

    y += nameLines.length * 3.5 + 1.5;
  });

  drawDashedLine(doc, y);
  y += 5;

  // --- 9. Total ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", MARGIN_MM, y);
  doc.text(`$${Number(sale.total).toFixed(2)}`, PAGE_WIDTH_MM - MARGIN_MM, y, {
    align: "right",
  });
  y += 7;

  // --- 10. Footer ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("¡Gracias por su compra!", centerX, y, { align: "center" });
  y += 4;
  doc.setFontSize(7);
  doc.text("Vuelva pronto", centerX, y, { align: "center" });

  return doc;
}

function drawDashedLine(doc, y) {
  doc.setLineDashPattern([0.5, 0.5], 0);
  doc.setLineWidth(0.1);
  doc.line(MARGIN_MM, y, PAGE_WIDTH_MM - MARGIN_MM, y);
  doc.setLineDashPattern([], 0);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Función principal: ahora es async porque espera la carga del logo ---
export async function printSaleTicket(sale) {
  const doc = await generateSaleTicketPDF(sale);
  doc.autoPrint();
  doc.output("dataurlnewwindow");
}
