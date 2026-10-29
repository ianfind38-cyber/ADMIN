const API="https://script.google.com/macros/s/AKfycbwnq2ODIsn6Ad-OFHA6aNU4WH0uwRETFRouhSIH6Ji7XpexedWl9MVomTkgU3zpA0nWVw/exec";
let clave="",datos=[],sel=new Set(),timer=null;
const $=i=>document.getElementById(i);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const fmt=s=>{if(!isFinite(s))return"?";const m=Math.floor(s/60);let r=(s-m*60).toFixed(2);if(r.length<5)r="0"+r;return m+":"+r};
const pedir=p=>fetch(API+"?"+Object.keys(p).map(k=>encodeURIComponent(k)+"="+encodeURIComponent(p[k])).join("&")).then(r=>r.json());
const color=n=>{let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))%360;return`hsl(${h},55%,42%)`};
const key=f=>(f||"").split("/").reverse().join("-");
function toast(t,mal){const e=$("toast");e.textContent=t;e.className="show"+(mal?" mal":"");clearTimeout(toast.t);toast.t=setTimeout(()=>e.className="",3200)}
function confirmar(txt,btn){return new Promise(ok=>{$("mtxt").textContent=txt;$("msi").textContent=btn||"Borrar";$("modal").className="abierto";const f=v=>{$("modal").className="";ok(v)};$("msi").onclick=()=>f(true);$("mno").onclick=()=>f(false)})}
function anim(id,to,f){const e=$(id),from=+e.dataset.v||0;e.dataset.v=to;const t0=performance.now();(function s(t){const k=Math.min(1,(t-t0)/600),v=from+(to-from)*(1-Math.pow(1-k,3));e.textContent=f(v);if(k<1)requestAnimationFrame(s)})(t0)}
function barras(id,items){const c=$(id);c.textContent="";if(!items.length){c.textContent="Sin datos";return}const mx=Math.max(...items.map(i=>i.v));
items.forEach((it,i)=>{const d=el("div"),b=el("i");b.style.height=Math.max(3,it.v/mx*100)+"%";b.style.animationDelay=i*40+"ms";b.title=it.t;d.append(el("em","",it.v),b,el("span","",it.l));c.append(d)})}
function cargar(){return pedir({accion:"listar",clave}).then(d=>{if(d.status!=="success")throw new Error(d.message||"no se pudo cargar");datos=d.puntajes;
const vivos=new Set(datos.map(p=>p.fila));sel=new Set([...sel].filter(f=>vivos.has(f)));$("upd").textContent="Actualizado "+new Date().toLocaleTimeString();render()})}
function render(){
const v=datos.filter(p=>isFinite(p.tiempo)&&p.tiempo>0).sort((a,b)=>a.tiempo-b.tiempo);
const n=v.length,best=n?v[0].tiempo:0,worst=n?v[n-1].tiempo:0,prom=n?v.reduce((a,p)=>a+p.tiempo,0)/n:0,med=n?(n%2?v[(n-1)/2].tiempo:(v[n/2-1].tiempo+v[n/2].tiempo)/2):0;
anim("sTotal",datos.length,x=>Math.round(x));anim("sJug",new Set(datos.map(p=>p.nombre.toLowerCase())).size,x=>Math.round(x));
[["sMejor",best],["sProm",prom],["sMed",med],["sPeor",worst]].forEach(([i,x])=>n?anim(i,x,fmt):($(i).textContent="–"));
$("sMejorN").textContent=n?v[0].nombre:"";
const rank={};v.forEach((p,i)=>rank[p.fila]=i+1);
const po=$("podio");po.textContent="";[1,0,2].forEach(i=>{if(!v[i])return;const d=el("div","pod p"+(i+1));d.style.animationDelay=(i?i*.12:.3)+"s";d.append(el("div","m",["🥇","🥈","🥉"][i]),el("b","",v[i].nombre),el("span","",fmt(v[i].tiempo)));po.append(d)});
const w=5,bk={};v.forEach(p=>{const k=Math.floor(p.tiempo/w)*w;bk[k]=(bk[k]||0)+1});
barras("hist",Object.keys(bk).map(Number).sort((a,b)=>a-b).map(k=>({l:k+"s",v:bk[k],t:`${k}-${k+w}s: ${bk[k]} puntajes`})));
const dc={};datos.forEach(p=>{if(p.fecha)dc[p.fecha]=(dc[p.fecha]||0)+1});
barras("dias",Object.keys(dc).sort((a,b)=>key(a)<key(b)?-1:1).slice(-10).map(f=>({l:f.slice(0,5),v:dc[f],t:`${f}: ${dc[f]} puntajes`})));
const sd=$("dia"),cur=sd.value;sd.textContent="";sd.append(new Option("Todas las fechas",""));Object.keys(dc).sort((a,b)=>key(a)<key(b)?1:-1).forEach(f=>sd.append(new Option(f,f)));sd.value=dc[cur]?cur:"";
const q=$("buscar").value.trim().toLowerCase(),o=$("orden").value;
const L=datos.filter(p=>p.nombre.toLowerCase().includes(q)&&(!sd.value||p.fecha===sd.value));
const big=1e9,T=p=>isFinite(p.tiempo)?p.tiempo:big;
L.sort({t:(a,b)=>T(a)-T(b),tp:(a,b)=>T(b)-T(a),r:(a,b)=>b.fila-a.fila,a:(a,b)=>a.fila-b.fila,n:(a,b)=>a.nombre.localeCompare(b.nombre)}[o]);
const tb=$("filas");tb.textContent="";
L.forEach((p,i)=>{const tr=tb.insertRow(),r=rank[p.fila];tr.style.animationDelay=Math.min(i,12)*35+"ms";if(r&&r<4)tr.className="r"+r;if(sel.has(p.fila))tr.classList.add("sel");
let c=tr.insertCell();const ck=el("input");ck.type="checkbox";ck.checked=sel.has(p.fila);ck.onchange=()=>{ck.checked?sel.add(p.fila):sel.delete(p.fila);tr.classList.toggle("sel",ck.checked);acts()};c.append(ck);
c=tr.insertCell();c.className="pos";c.textContent=r===1?"🥇":r===2?"🥈":r===3?"🥉":(r||"–");
c=tr.insertCell();const j=el("div","jug"),a=el("span","av",p.nombre.charAt(0).toUpperCase());a.style.background=color(p.nombre);j.append(a,el("span","",p.nombre));c.append(j);
tr.insertCell().textContent=p.fecha||"—";tr.insertCell().textContent=p.hora||"—";
c=tr.insertCell();c.className="t";const bar=el("div","bar"),f=el("i");f.style.width=(r?Math.max(6,best/p.tiempo*100):0)+"%";bar.append(f);c.append(el("div","",fmt(p.tiempo)),bar);
c=tr.insertCell();const b=el("button","rojo chico","Borrar");b.onclick=()=>borrarUno(p,tr,b);c.append(b)});
$("vacio").hidden=L.length>0;$("btnTodos").hidden=!datos.length;$("todos").checked=false;acts()}
function acts(){const b=$("btnSel");b.hidden=!sel.size;b.textContent="Borrar seleccionados ("+sel.size+")"}
function borrarUno(p,tr,b){confirmar(`¿Borrar el puntaje de ${p.nombre} (${fmt(p.tiempo)})?`).then(si=>{if(!si)return;b.disabled=true;
pedir({accion:"borrar_uno",clave,fila:p.fila,nombre:p.nombre,tiempo:p.tiempo}).then(d=>{if(d.status!=="success")throw new Error(d.message||"no se pudo borrar");tr.classList.add("sale");toast("Puntaje borrado");setTimeout(cargar,320)}).catch(e=>{toast(e.message,1);b.disabled=false})})}
$("btnSel").onclick=()=>{const L=datos.filter(p=>sel.has(p.fila)).sort((a,b)=>b.fila-a.fila);
confirmar(`¿Borrar ${L.length} puntajes seleccionados?`).then(async si=>{if(!si)return;let ok=0;
try{for(const p of L){const d=await pedir({accion:"borrar_uno",clave,fila:p.fila,nombre:p.nombre,tiempo:p.tiempo});if(d.status!=="success")throw new Error(d.message||"error");ok++}}catch(e){toast(e.message,1)}
sel.clear();if(ok)toast(ok+" puntajes borrados");cargar()})};
$("btnTodos").onclick=()=>confirmar("¿Borrar TODOS los puntajes? No se puede deshacer.").then(si=>{if(!si)return;pedir({accion:"borrar",clave}).then(d=>{if(d.status!=="success")throw new Error(d.message||"no se pudo borrar");sel.clear();toast("Se borraron "+d.borrados+" puntajes");return cargar()}).catch(e=>toast(e.message,1))});
$("todos").onchange=e=>{[...$("filas").rows].forEach(r=>{const c=r.cells[0].firstChild;c.checked=e.target.checked;c.onchange()})};
$("btnCsv").onclick=()=>{const q=s=>'"'+(/^[=+\-@]/.test(s)?"'":"")+String(s).replace(/"/g,'""')+'"';
const csv="\ufeffnombre,fecha,hora,tiempo_segundos\n"+datos.map(p=>[q(p.nombre),q(p.fecha||""),q(p.hora||""),p.tiempo].join(",")).join("\n");
const a=el("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="puntajes.csv";a.click();toast("CSV descargado")};
function entrar(){const c=$("clave").value;if(!c){$("errLogin").textContent="Escribí la clave.";return}clave=c;$("errLogin").textContent="Verificando…";
cargar().then(()=>{$("login").hidden=true;$("panel").hidden=false;$("errLogin").textContent=""}).catch(e=>{clave="";$("errLogin").textContent="Error: "+e.message;const t=$("login");t.classList.remove("tiembla");void t.offsetWidth;t.classList.add("tiembla")})}
$("btnEntrar").onclick=entrar;$("clave").onkeydown=e=>{if(e.key==="Enter")entrar()};
$("ojo").onclick=()=>{const i=$("clave");i.type=i.type==="password"?"text":"password"};
$("btnAct").onclick=()=>cargar().then(()=>toast("Actualizado")).catch(e=>toast(e.message,1));
$("auto").onchange=e=>{clearInterval(timer);if(e.target.checked)timer=setInterval(()=>{if(!$("modal").className)cargar().catch(()=>{})},15000)};
$("btnSalir").onclick=()=>{clave="";clearInterval(timer);$("auto").checked=false;sel.clear();$("clave").value="";$("filas").textContent="";$("panel").hidden=true;$("login").hidden=false};
$("buscar").oninput=render;$("orden").onchange=render;$("dia").onchange=render;
document.onkeydown=e=>{if(e.key==="Escape"&&$("modal").className)$("mno").click();if(e.key==="/"&&!$("panel").hidden&&document.activeElement.tagName!=="INPUT"){e.preventDefault();$("buscar").focus()}};
