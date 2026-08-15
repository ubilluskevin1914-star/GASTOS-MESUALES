
const API = "https://script.google.com/macros/s/AKfycbxS_K0pPvc3U63d1p-DOUTogbbdhRvzyQTr4y2avyuoZzmgAZ9dlzlUfrW8G_U2B0BI/exec";

// ======================
// BASE DE DATOS LOCAL
// ======================
let db = JSON.parse(localStorage.getItem("gastos") || "[]");

let presupuesto = JSON.parse(
  localStorage.getItem("presupuesto") ||
  '{"Alimentación":600,"Transporte":250,"Vivienda":1200,"Salud":150}'
);

let meta = Number(localStorage.getItem("meta") || 1000);

// ======================
// NAVEGACIÓN
// ======================
function cambiar(id){
  document.querySelectorAll(".page").forEach(p=>{
    p.style.display="none";
  });

  const pagina=document.getElementById(id);
  if(pagina) pagina.style.display="block";
}

// ======================
// SINCRONIZAR GOOGLE SHEETS
// ======================
async function sincronizar(){
  try{

    const r = await fetch(API);
    const datos = await r.json();

    db = datos.map(x=>({
      t:x.tipo,
      c:x.categoria,
      d:x.descripcion,
      m:Number(x.monto)
    }));

    localStorage.setItem("gastos",JSON.stringify(db));

  }catch(e){
    db = JSON.parse(localStorage.getItem("gastos") || "[]");
  }

  actualizar();
  actualizarMeta();
}

// ======================
// AGREGAR MOVIMIENTO
// ======================
async function agregarMovimiento(){

  const tipo = document.getElementById("tipo").value;
  const categoria = document.getElementById("cat").value;
  const descripcion = document.getElementById("desc").value || "Sin descripción";
  const monto = Number(document.getElementById("monto").value);

  if(monto<=0){
    alert("Ingresa un monto válido");
    return;
  }

  const movimiento={
    tipo,
    categoria,
    descripcion,
    monto,
    metodo:"Yape"
  };

  try{
    await fetch(API,{
      method:"POST",
      headers:{
        "Content-Type":"text/plain;charset=utf-8"
      },
      body:JSON.stringify(movimiento)
    });
  }catch(e){
    console.log("Sin conexión");
  }

  db.push({
    t:tipo,
    c:categoria,
    d:descripcion,
    m:monto
  });

  localStorage.setItem("gastos",JSON.stringify(db));

  document.getElementById("desc").value="";
  document.getElementById("monto").value="";

  actualizar();
  actualizarMeta();

  cambiar("home");
}

// ======================
// PRESUPUESTO
// ======================
function guardarPresupuesto(){

  presupuesto={
    "Alimentación":Number(document.getElementById("p_alim").value),
    "Transporte":Number(document.getElementById("p_trans").value),
    "Vivienda":Number(document.getElementById("p_viv").value),
    "Salud":Number(document.getElementById("p_salud").value)
  };

  localStorage.setItem("presupuesto",JSON.stringify(presupuesto));

  actualizar();

  alert("Presupuesto guardado");
}

// ======================
// META
// ======================
function guardarMeta(){

  meta=Number(document.getElementById("metaMonto").value);

  localStorage.setItem("meta",meta);

  actualizarMeta();
}

function actualizarMeta(){

  let ingresos=0;
  let gastos=0;

  db.forEach(x=>{
    if(x.t==="Ingreso") ingresos+=x.m;
    else gastos+=x.m;
  });

  const ahorro=Math.max(0,ingresos-gastos);

  const p=Math.min(100,(ahorro/meta)*100);

  const barra=document.getElementById("barraMeta");
  const texto=document.getElementById("textoMeta");

  if(barra) barra.style.width=p+"%";

  if(texto){
    texto.innerHTML=`${p.toFixed(0)}% • S/${ahorro.toFixed(2)} de S/${meta}`;
  }

  const input=document.getElementById("metaMonto");
  if(input) input.value=meta;
}

// ======================
// COLOR
// ======================
function cambiarColor(){

  const c=document.getElementById("colorApp").value;

  document.documentElement.style.setProperty("--primary",c);

  const header=document.querySelector(".header");
  if(header) header.style.background=c;

  localStorage.setItem("color",c);
}

// ======================
// GRÁFICO
// ======================
function dibujarGrafico(alim,trans,viv,salud){

  const c=document.getElementById("grafico");
  if(!c) return;

  const ctx=c.getContext("2d");

  ctx.clearRect(0,0,300,220);

  const datos=[alim,trans,viv,salud];
  const colores=["#16A34A","#0EA5E9","#F59E0B","#EF4444"];

  const total=datos.reduce((a,b)=>a+b,0);

  if(total===0){
    ctx.fillStyle="#64748B";
    ctx.font="16px Arial";
    ctx.textAlign="center";
    ctx.fillText("Sin gastos",150,110);
    return;
  }

  let inicio=0;

  datos.forEach((v,i)=>{
    const ang=(v/total)*Math.PI*2;

    ctx.beginPath();
    ctx.moveTo(150,100);
    ctx.arc(150,100,70,inicio,inicio+ang);
    ctx.closePath();

    ctx.fillStyle=colores[i];
    ctx.fill();

    inicio+=ang;
  });

  ctx.beginPath();
  ctx.arc(150,100,35,0,Math.PI*2);
  ctx.fillStyle="#FFFFFF";
  ctx.fill();

  ctx.fillStyle="#123B63";
  ctx.font="bold 12px Arial";
  ctx.textAlign="center";
  ctx.fillText("S/"+total,150,98);
  ctx.font="10px Arial";
  ctx.fillText("Total",150,112);
}

// ======================
// DASHBOARD
// ======================
function actualizar(){

  let ingresos=0;
  let gastos=0;

  let alim=0;
  let trans=0;
  let viv=0;
  let salud=0;

  const lista=document.getElementById("lista");
  if(lista) lista.innerHTML="";

  [...db].reverse().forEach(x=>{

    if(x.t==="Ingreso"){
      ingresos+=x.m;
    }else{
      gastos+=x.m;

      if(x.c==="Alimentación") alim+=x.m;
      if(x.c==="Transporte") trans+=x.m;
      if(x.c==="Vivienda") viv+=x.m;
      if(x.c==="Salud") salud+=x.m;
    }

    if(lista){
      lista.innerHTML += `
      <div class="row">
        <div>
          <b>${x.d}</b><br>
          <small>${x.c}</small>
        </div>
        <div>${x.t==="Gasto"?"-":"+"} S/${x.m.toFixed(2)}</div>
      </div>`;
    }

  });

  document.getElementById("ing").textContent="S/"+ingresos.toFixed(2);
  document.getElementById("gas").textContent="S/"+gastos.toFixed(2);
  document.getElementById("sav").textContent="S/"+(ingresos-gastos).toFixed(2);
  document.getElementById("dis").textContent="S/"+(ingresos-gastos).toFixed(2);

  document.getElementById("g_alim").textContent="S/"+alim;
  document.getElementById("g_trans").textContent="S/"+trans;
  document.getElementById("g_viv").textContent="S/"+viv;
  document.getElementById("g_salud").textContent="S/"+salud;

  document.getElementById("r_alim").textContent=`S/${alim} / ${presupuesto["Alimentación"]}`;
  document.getElementById("r_trans").textContent=`S/${trans} / ${presupuesto["Transporte"]}`;
  document.getElementById("r_viv").textContent=`S/${viv} / ${presupuesto["Vivienda"]}`;
  document.getElementById("r_salud").textContent=`S/${salud} / ${presupuesto["Salud"]}`;

  document.getElementById("p_alim").value=presupuesto["Alimentación"];
  document.getElementById("p_trans").value=presupuesto["Transporte"];
  document.getElementById("p_viv").value=presupuesto["Vivienda"];
  document.getElementById("p_salud").value=presupuesto["Salud"];

  dibujarGrafico(alim,trans,viv,salud);
}

// ======================
// INICIO
// ======================
const color=localStorage.getItem("color");
if(color){
  document.documentElement.style.setProperty("--primary",color);
}

sincronizar();
cambiar("home");
