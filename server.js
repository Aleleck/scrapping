const express = require("express");
const { extraerDatosConPuppeteer, guardarCuponesEnArchivo } = require("./scraper");
const xlsx = require("xlsx");
const multer = require("multer");

const app = express();
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });
app.use(upload.single("cedulas"));

app.post("/scrape", async (req, res) => {
  try {
    const file = req.file; // Obtén el archivo de Excel desde la solicitud

    if (!file) {
      throw new Error("No se ha proporcionado ningún archivo de Excel");
    }

    const workbook = xlsx.read(file.buffer, { type: "buffer" }); // Lee el archivo de Excel desde los datos en memoria
    const sheetNames = workbook.SheetNames;

    if (sheetNames.length === 0) {
      throw new Error("El archivo de Excel no contiene ninguna hoja");
    }

    const cedulasSheet = workbook.Sheets[sheetNames[0]]; // Obtén la primera hoja

    const cedulas = xlsx.utils.sheet_to_json(cedulasSheet, { header: "A" }); // Convierte la hoja de cédulas a un array de objetos

    const resultados = [];
    for (const cedula of cedulas) {
      const cupones = await extraerDatosConPuppeteer(cedula);
      guardarCuponesEnArchivo(cupones);
      resultados.push({ cedula, cupones });
    }

    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al extraer datos");
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
