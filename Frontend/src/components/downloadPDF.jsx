import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const downloadPDF = async (elementId) => {
  const element = document.getElementById(elementId);
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, width, height);
  pdf.save("Financial_Advice_Report.pdf");
};
