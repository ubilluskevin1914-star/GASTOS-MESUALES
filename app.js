let db = JSON.parse(localStorage.getItem("gastos") || "[]");

function guardarDatos() {
  localStorage.setItem("gastos", JSON.stringify(db));
}

function agregar(tipo, categoria, descripcion, monto) {
  db.push({
    fecha: new Date().toISOString(),
    tipo,
    categoria,
    descripcion,
    monto: Number(monto)
  });
  guardarDatos();
  actualizar();
}

function actualizar() {
  let ingresos = 0, gastos = 0;

  db.forEach(x => {
    if (x.tipo === "Ingreso") ingresos += x.monto;
    else gastos += x.monto;
  });

  document.getElementById("ing").textContent = "S/ " + ingresos.toFixed(2);
  document.getElementById("gas").textContent = "S/ " + gastos.toFixed(2);
  document.getElementById("sav").textContent = "S/ " + (ingresos - gastos).toFixed(2);
  document.getElementById("dis").textContent = "S/ " + (ingresos - gastos).toFixed(2);

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  [...db].reverse().slice(0,10).forEach(x=>{
    lista.innerHTML += `
      <div class="row">
        <div>
          <b>${x.descripcion}</b><br>
          <small>${x.categoria}</small>
        </div>
        <div>${x.tipo==="Gasto"?"-":"+"}S/ ${x.monto.toFixed(2)}</div>
      </div>`;
  });
}

actualizar();
