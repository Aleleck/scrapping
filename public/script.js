document.getElementById("cedulaForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append("cedulas", document.getElementById("cedulas").files[0]);

  fetch("/scrape", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(resultados => {
      mostrarResultados(resultados);
    })
    .catch(error => {
      console.error(error);
      mostrarError("Error al extraer datos");
    });
});

function mostrarResultados(resultados) {
  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = "";

  resultados.forEach(result => {
    const cedula = result.cedula;
    const cupones = result.cupones;

    const cedulaHeading = document.createElement("h2");
    cedulaHeading.textContent = `Cédula: ${cedula}`;

    const lista = document.createElement("ul");
    cupones.forEach(cupon => {
      const li = document.createElement("li");
      li.textContent = cupon.name;
      lista.appendChild(li);
    });

    resultadoDiv.appendChild(cedulaHeading);
    resultadoDiv.appendChild(lista);
  });
}

function mostrarError(mensaje) {
  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = "";

  const errorMensaje = document.createElement("p");
  errorMensaje.textContent = mensaje;

  resultadoDiv.appendChild(errorMensaje);
}
