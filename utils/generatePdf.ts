import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Entry } from "../types/types.ts";
import { pdfFontSize } from "../constants/numbers.ts";

export async function generatePdf(): Promise<Uint8Array<ArrayBufferLike>> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const page = pdfDoc.addPage();
    page.drawText(`Titties!!!!!`, {
        x: 50,
        y: 200,
        size: pdfFontSize,
        font: font,
        color: rgb(0, 0.53, 0.71)
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}