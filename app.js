// ===== GASTOS MENSUALES v3 =====

let db = JSON.parse(localStorage.getItem("gastos") || "[]");

let presupuesto = JSON.parse(localStorage.getItem("presupuesto") || `{
  "Alimentación":600,
  "Transporte":250,
  "Vivienda":1200,
  "Salud":150
}`);

function guardarBD(){
  localStorage.setItem("gastos", JSON.stringify(db));
}

function guardarPresupuesto(){

  presupuesto["Alimentación"] = Number(document.getElementById("p_alim").value);
  presupuesto["Transporte"]   = Number(document.getElementById("p_trans").value);
  presupuesto["Vivienda"]     = Number(document.getElementById("p_viv").value);
  presupuesto["Salud"]        = Number(document.getElementById("p_salud").value);

  localStorage.setItem("presupuesto", JSON.stringify(presupuesto));

  actualizar();

  alert("Presupuesto guardado");
}

function agregarMovimiento(){

  const tipo = document.getElementById("tipo").value;
  const cat  = document.getElementById("cat").value;
  const desc = document.getElementById("desc").value || "Sin descripción";
  const monto= Number(document.getElementById("monto").value);

  if(monto<=0){
    alert("Ingresa un monto válido");
    return;
  }

  db.push({
    fecha:new Date().toISOString(),
    tipo:tipo,
    categoria:cat,
    descripcion:desc,
    monto:monto
  });

  guardarBD();

  document.getElementById("desc").value="";
  document.getElementById("monto").value="";

  actualizar();

  cambiar("home");
}

function actualizar(){

  let ingresos=0;
  let gastos=0;

  let alim=0;
  let trans=0;
  let viv=0;
  let salud=0;

  const lista=document.getElementById("lista");
  lista.innerHTML="";

  [...db].reverse().forEach(x=>{

    if(x.tipo==="Ingreso"){
      ingresos+=x.monto;
    }else{
      gastos+=x.monto;

      if(x.categoria==="Alimentación") alim+=x.monto;
      if(x.categoria==="Transporte") trans+=x.monto;
      if(x.categoria==="Vivienda") viv+=x.monto;
      if(x.categoria==="Salud") salud+=x.monto;
    }

    lista.innerHTML+=`
    <div class="row">
      <div>
        <b>${x.descripcion}</b><br>
        <small>${x.categoria}</small>
      </div>
      <div>${x.tipo==="Gasto"?"-":"+"} S/${x.monto.toFixed(2)}</div>
    </div>`;
  });

  document.getElementById("ing").textContent="S/"+ingresos.toFixed(2);
  document.getElementById("gas").textContent="S/"+gastos.toFixed(2);
  document.getElementById("sav").textContent="S/"+(ingresos-gastos).toFixed(2);
  document.getElementById("dis").textContent="S/"+(ingresos-gastos).toFixed(2);

  document.getElementById("r_alim").textContent=`S/${alim} / ${presupuesto["Alimentación"]}`;
  document.getElementById("r_trans").textContent=`S/${trans} / ${presupuesto["Transporte"]}`;
  document.getElementById("r_viv").textContent=`S/${viv} / ${presupuesto["Vivienda"]}`;
  document.getElementById("r_salud").textContent=`S/${salud} / ${presupuesto["Salud"]}`;
document.getElementById("g_alim").textContent="S/"+alim;
document.getElementById("g_trans").textContent="S/"+trans;
document.getElementById("g_viv").textContent="S/"+viv;
document.getElementById("g_salud").textContent="S/"+salud;

dibujarGrafico(alim,trans,viv,salud);
  document.getElementById("p_alim").value=presupuesto["Alimentación"];
  document.getElementById("p_trans").value=presupuesto["Transporte"];
  document.getElementById("p_viv").value=presupuesto["Vivienda"];
  document.getElementById("p_salud").value=presupuesto["Salud"];
}

function cambiar(id){

  document.querySelectorAll(".page").forEach(p=>p.classList.remove("on"));

  document.getElementById(id).classList.add("on");
}

actualizar();
let meta = Number(localStorage.getItem("meta") || 1000);

function guardarMeta(){

 meta = Number(document.getElementById("metaMonto").value);

 localStorage.setItem("meta",meta);

 actualizarMeta();

}

function actualizarMeta(){

 let ingresos=0;
 let gastos=0;

 db.forEach(x=>{

   if(x.tipo==="Ingreso")
     ingresos+=x.monto;
   else
     gastos+=x.monto;

 });

 const ahorro=Math.max(0,ingresos-gastos);

 const p=Math.min(100,(ahorro/meta)*100);

 document.getElementById("barraMeta").style.width=p+"%";

 document.getElementById("textoMeta").innerHTML=
 `${p.toFixed(0)}% • S/${ahorro} de S/${meta}`;

 document.getElementById("metaMonto").value=meta;

}

function cambiarColor(){

 const c=document.getElementById("colorApp").value;

 document.documentElement.style.setProperty("--primary",c);

 localStorage.setItem("color",c);

}

const colorGuardado=localStorage.getItem("color");

if(colorGuardado){

 document.documentElement.style.setProperty("--primary",colorGuardado);

}

actualizarMeta();
