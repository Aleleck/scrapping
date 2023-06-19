const puppeteer = require("puppeteer");
const fs = require("fs");

async function extraerDatosConPuppeteer(cedula) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
    });
    const page = await browser.newPage();

    await page.goto("https://www.midescuento.co/");

    await page.waitForSelector('[placeholder="Número de documento"]');
    await page.type('[placeholder="Número de documento"]', cedula);

    const checkboxSelector = 'label[for="edit-conditions"]';
    await page.waitForSelector(checkboxSelector);
    await page.click(checkboxSelector);

    await page.click('[class="button js-form-submit form-submit"]');
    await page.waitForNavigation();

    await page.waitForSelector('[src="/sites/default/files/styles/235x235/public/2021-09/logo_exito_1.png?itok=jH6gDns1"]');
    await page.click('[src="/sites/default/files/styles/235x235/public/2021-09/logo_exito_1.png?itok=jH6gDns1"]');

    await page.waitForSelector('[data-status="0"]');
    
    const cupones = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-status="0"]');
      const arr = [];
      for (let item of items) {
        const cupon = {};
        cupon.puesto = item.querySelector('.relevance').innerText;
        cupon.name = item.querySelector('p.coupont-title').innerText;
        cupon.marca = item.querySelector('span.coupont-title').innerText;
        cupon.plu = item.querySelector('span.code-plu').innerText;
        cupon.desc = item.querySelector('span.coupont-percent').innerText;


        arr.push(cupon);
      }
      return arr;
    });

    fs.writeFile("cupones.json", JSON.stringify(cupones), (err) => {
      if (err) {
        console.error("Error al guardar el archivo JSON:", err);
      } else {
        console.log("Archivo JSON guardado exitosamente.");
      }
    });

    await browser.close();

    return cupones; // Devolver los datos extraídos
  } catch (error) {
    console.error(error);
    return null;
  }
}

function guardarCuponesEnArchivo(cupones) {
  fs.writeFile("cupones.json", JSON.stringify(cupones), (err) => {
    if (err) {
      console.error("Error al guardar el archivo JSON:", err);
    } else {
      console.log("Archivo JSON guardado exitosamente.");
    }
  });
}

module.exports = {
  extraerDatosConPuppeteer,
  guardarCuponesEnArchivo,
};