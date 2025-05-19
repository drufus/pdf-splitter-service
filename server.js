import express from 'express';
import { PDFDocument } from 'pdf-lib';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));

app.post('/split', async (req, res) => {
  try {
    const { pdfBase64 } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: 'Missing pdfBase64' });
    }

    const inputBuffer = Buffer.from(pdfBase64, 'base64');
    const originalPdf = await PDFDocument.load(inputBuffer);
    const totalPages = originalPdf.getPageCount();

    const pages = [];

    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save();
      const base64 = Buffer.from(pdfBytes).toString('base64');
      pages.push({ page: i + 1, base64 });
    }

    res.json({ pages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to split PDF' });
  }
});

app.listen(3000, () => {
  console.log('PDF Splitter running on port 3000');
});
