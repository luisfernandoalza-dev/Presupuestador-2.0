let tipo = 'prof';
let sectores = [
  { n: 'COCINA', items: [''] },
  { n: 'BAÑO', items: [''] },
  { n: 'TAREAS GENERALES', items: [''] }
];

const profIncluye = [
  { text: 'Visita al sitio y relevamiento', on: true },
  { text: 'Estudio normativo y factibilidad', on: true },
  { text: 'Definición del programa junto al cliente', on: true },
  { text: 'Propuesta conceptual del proyecto', on: true },
  { text: 'Anteproyecto con planos y vistas', on: true },
  { text: 'Modelado 3D y esquemas de diseño', on: true },
  { text: 'Selección preliminar de materiales', on: true },
  { text: 'Documentación lista para cuantificar y presupuestar etapa de ejecución de obra', on: true },
  { text: 'Supervisión técnica del proceso proyectual y Dirección de Obra', on: true },
  { text: 'Entrega digital completa en PDF', on: true },
  { text: 'Acompañamiento y asesoramiento continuo', on: true }
];

const profNoIncluye = [
  { text: 'Materiales de construcción', on: true },
  { text: 'Mano de obra (Se podrá presupuestar por separado una vez definido proyecto y tipo de construcción)', on: true },
  { text: 'Trámites con prestadoras de servicios', on: true },
  { text: 'Tasas municipales o deudas', on: true },
  { text: 'Timbrado de contrato', on: true },
  { text: 'Impresiones físicas de planos (De obra)', on: true },
  { text: 'Tareas no detalladas en este presupuesto', on: true }
];

window.addEventListener('DOMContentLoaded', () => {
  const d = new Date();
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  document.getElementById('fFecha').value = `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
  renderSectores();
  renderScopeEditor();
  calcProf();
  render();
});

function setTab(t) {
  ['edit', 'preview'].forEach(id => {
    document.getElementById(`panel-${id}`).classList.toggle('active', id === t);
    document.getElementById(`tab-${id}`).classList.toggle('active', id === t);
  });
  if (t === 'preview') render();
}

function setTipo(t) {
  tipo = t;
  document.getElementById('tb-prof').classList.toggle('active', t === 'prof');
  document.getElementById('tb-remo').classList.toggle('active', t === 'remo');
  document.getElementById('sec-prof').style.display = t === 'prof' ? '' : 'none';
  document.getElementById('sec-remo').style.display = t === 'remo' ? '' : 'none';
  render();
}

function g(id) { return (document.getElementById(id) || {}).value || ''; }
function num(id) { return parseFloat(g(id)) || 0; }
function int(id) { return parseInt(g(id), 10) || 0; }
function moneyLike(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return 0;
  if (/[^\d\s.,$-]/.test(raw)) return 0;
  const clean = raw.replace(/\$/g, '').replace(/\s+/g, '').replace(/\./g, '').replace(/,/g, '.');
  const n = parseFloat(clean);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
function fmt(n) { return n ? `$ ${Math.round(n).toLocaleString('es-AR')}` : '–'; }

function toWords(n) {
  n = Math.round(n);
  if (n === 0) return 'cero';
  const un = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const dec = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const cent = ['', 'cien', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  let r = '';
  if (n < 0) return `menos ${toWords(-n)}`;
  if (n >= 1000000) {
    const m = Math.floor(n / 1000000);
    r += `${m === 1 ? 'un millón' : `${toWords(m)} millones`} `;
    n %= 1000000;
  }
  if (n >= 1000) {
    const k = Math.floor(n / 1000);
    r += `${k === 1 ? 'mil' : `${toWords(k)} mil`} `;
    n %= 1000;
  }
  if (n >= 100) {
    if (n >= 100 && n < 200 && n !== 100) {
      r += 'ciento ';
      n -= 100;
    } else {
      r += `${cent[Math.floor(n / 100)]} `;
      n %= 100;
    }
  }
  if (n >= 20) {
    if (n < 30 && n !== 20) {
      r += `veinti${un[n % 10]}`;
    } else {
      r += dec[Math.floor(n / 10)];
      if (n % 10) r += ` y ${un[n % 10]}`;
    }
    r += ' ';
  } else if (n > 0) {
    r += `${un[n]} `;
  }
  return r.trim();
}

function calcProf() {
  const hon = num('fHon');
  const colegNum = moneyLike(g('fColeg'));
  const pct = num('fPct') || 40;
  const n = int('fCuotas') || 5;
  const box = document.getElementById('pagoBoxProf');
  if (!(hon || colegNum)) {
    box.innerHTML = 'Ingresá el monto para ver el desglose.';
    render();
    return;
  }
  const subtotal = hon + colegNum;
  const ant = subtotal * pct / 100;
  const rest = subtotal - ant;
  const cval = rest / n;
  box.innerHTML = `<strong>Anticipo (${pct}%):</strong> ${fmt(ant)}<br><strong>Resto:</strong> ${fmt(rest)} · ${n} cuotas ≈ ${fmt(cval)}/mes (+IPC INDEC)`;
  render();
}

function calcRemo() {
  const tot = num('fTotalRemo');
  const ant = num('fAntRemo');
  const n = int('fCuotasRemo') || 8;
  const box = document.getElementById('pagoBoxRemo');
  if (!tot) {
    box.innerHTML = 'Ingresá el total para ver el desglose.';
    render();
    return;
  }
  const saldo = tot - ant;
  const cval = Math.round(saldo / n);
  box.innerHTML = `<strong>Anticipo:</strong> ${fmt(ant)}<br><strong>Saldo:</strong> ${fmt(saldo)} · ${n} cuotas semanales de ${fmt(cval)} c/u`;
  render();
}

function renderSectores() {
  const wrap = document.getElementById('sectoresWrap');
  wrap.innerHTML = '';
  sectores.forEach((s, si) => {
    const div = document.createElement('div');
    div.className = 'sector-block';
    div.innerHTML = `
      <div class="sector-header">
        <input type="text" class="sector-name" value="${escapeHtml(s.n)}" oninput="sectores[${si}].n=this.value;render()" placeholder="SECTOR">
        ${si > 0 ? `<button class="btn-x" type="button" onclick="delSector(${si})">✕</button>` : ''}
      </div>
      <div id="items${si}">
        ${s.items.map((it, ii) => `
          <div class="task-row">
            <input type="text" value="${escapeHtml(it)}" oninput="sectores[${si}].items[${ii}]=this.value;render()" placeholder="Descripción de la tarea…">
            ${ii > 0 ? `<button class="btn-x" type="button" onclick="delItem(${si},${ii})">✕</button>` : ''}
          </div>`).join('')}
      </div>
      <button class="btn-ghost" type="button" onclick="addItem(${si})">+ Agregar tarea</button>`;
    wrap.appendChild(div);
  });
}

function renderScopeEditor() {
  const yesWrap = document.getElementById('scopeYesWrap');
  const noWrap = document.getElementById('scopeNoWrap');
  if (!yesWrap || !noWrap) return;
  yesWrap.innerHTML = profIncluye.map((item, i) => `
    <label class="scope-check"><input type="checkbox" ${item.on ? 'checked' : ''} onchange="profIncluye[${i}].on=this.checked;render()"><span>${escapeHtml(item.text)}</span></label>
  `).join('');
  noWrap.innerHTML = profNoIncluye.map((item, i) => `
    <label class="scope-check"><input type="checkbox" ${item.on ? 'checked' : ''} onchange="profNoIncluye[${i}].on=this.checked;render()"><span>${escapeHtml(item.text)}</span></label>
  `).join('');
}

function addSector() { sectores.push({ n: 'NUEVO SECTOR', items: [''] }); renderSectores(); render(); }
function delSector(i) { sectores.splice(i, 1); renderSectores(); render(); }
function addItem(si) { sectores[si].items.push(''); renderSectores(); render(); }
function delItem(si, ii) { sectores[si].items.splice(ii, 1); if (!sectores[si].items.length) sectores[si].items = ['']; renderSectores(); render(); }
function doPrint() { setTab('preview'); render(); setTimeout(() => window.print(), 350); }

function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildHeader(num_, fecha) {
  return `
    <header class="d-header">
      <div class="d-header-left">
        <div class="d-logo-wrap">
          <img class="d-logo-img" src="assets/img/brand/logo-principal-crop.png" alt="Estudio A & Asociados">
        </div>
      </div>
      <div class="d-header-right">
        <div class="d-num">Presupuesto N° ${escapeHtml(num_)}</div>
        <div class="d-date">${escapeHtml(fecha)}</div>
      </div>
    </header>`;
}

function buildFooter() {
  return `
    <footer class="d-footer">
      <div class="d-footer-brand">
        <img class="d-footer-logo" src="assets/img/brand/logo-secundario-crop.png" alt="Estudio A Arquitectura">
      </div>
      <div class="d-footer-info">
        <strong>Arq. Ignacio Abraham</strong> — Mat. CAPBA DIX 31.528<br>
        <strong>Arq. Luis Fernando Alza</strong> — Mat. CAPBA DIX 31.450<br>
        administracion@webestudioa.com.ar · @estudioA.arquitectos
      </div>
    </footer>`;
}

function buildPage(title, bodyHtml, num_, fecha) {
  return `
    <section class="doc-page">
      ${buildHeader(num_, fecha)}
      <div class="d-title-bar"><div class="d-title">${escapeHtml(title)}</div></div>
      <div class="d-body">${bodyHtml}</div>
      ${buildFooter()}
    </section>`;
}

function buildScopeItems(items, dim = false) {
  const valid = items.filter(item => item.on);
  if (!valid.length) return '<div class="d-item empty">Sin ítems seleccionados.</div>';
  return valid.map(item => `<div class="d-item${dim ? ' dim' : ''}">${escapeHtml(item.text)}</div>`).join('');
}

function render() {
  const out = document.getElementById('docOut');
  if (!out) return;

  const num_ = (g('fNum') || '0001').padStart(4, '0');
  const fecha = g('fFecha');
  const cli = g('fCliente') || 'Cliente';
  const con = g('fContacto');
  const ubi = g('fUbicacion');
  const desc = g('fDesc');
  const vig = g('fVig') || '15';
  const metPag = g('fMetPago');

  if (tipo === 'prof') {
    const hon = num('fHon');
    const colegRaw = g('fColeg');
    const colegNum = moneyLike(colegRaw);
    const coleg = colegRaw || 'N/C';
    const pct = num('fPct') || 40;
    const nCu = int('fCuotas') || 5;
    const totalProf = hon + colegNum;
    const ant = totalProf * pct / 100;
    const rest = totalProf - ant;
    const cval = nCu > 0 ? rest / nCu : 0;
    const totalStr = totalProf ? fmt(totalProf) : '$ –';
    const totalWords = totalProf ? `Pesos ${toWords(totalProf)}` : '';

    const page1Body = `
      <div class="d-client d-client-prof">
        ${cli ? `<div class="d-crow"><span class="d-clabel">Cliente:</span><span class="d-cval"><strong>${escapeHtml(cli)}</strong></span></div>` : ''}
        ${con ? `<div class="d-crow"><span class="d-clabel">Contacto:</span><span class="d-cval">${escapeHtml(con)}</span></div>` : ''}
        ${ubi ? `<div class="d-crow"><span class="d-clabel">Ubicación:</span><span class="d-cval">${escapeHtml(ubi)}</span></div>` : ''}
      </div>

      <div class="d-thanks">Gracias por confiar en <strong>Estudio A.</strong></div>

      <p class="d-copy-main">Cada proyecto es una oportunidad para transformar ideas en espacios que mejoran la vida. Diseñamos esta propuesta con compromiso, escucha activa y una mirada profesional para acompañarte en todo el proceso.</p>

      <div class="d-tagline"><em>Escuchamos, Interpretamos, Creamos</em></div>

      <p class="d-copy-main d-copy-after">Nuestra metodología pone el foco en estar presentes en cada etapa, entendiendo tus necesidades y proyectando soluciones direccionadas.</p>
      <div class="d-pre-scope">Esta propuesta contempla:</div>

      <div class="d-inc-grid prof-grid">
        <div class="d-inc-col yes">
          <div class="d-inc-title">Incluye</div>
          ${buildScopeItems(profIncluye, false)}
        </div>
        <div class="d-inc-col no">
          <div class="d-inc-title dim">No incluye</div>
          ${buildScopeItems(profNoIncluye, true)}
        </div>
      </div>`;

    const page2Body = `
      <div class="d-detail-title">Detalle de la Propuesta</div>
      <p class="d-desc-block">${escapeHtml(desc || 'Completá el alcance de la propuesta desde el formulario para visualizar aquí el detalle específico del trabajo.')}</p>

      <div class="d-hon-block-title">Honorarios Profesionales</div>
      <div class="d-hon d-hon-prof">
        <div class="d-hon-row">
          <span class="d-hon-label">Honorarios Profesionales</span>
          <span class="d-hon-val">${hon ? fmt(hon) : '–'}</span>
        </div>
        <div class="d-hon-row">
          <span class="d-hon-label">Gastos Colegiales</span>
          <span class="d-hon-val">${colegNum ? fmt(colegNum) : escapeHtml(coleg)}</span>
        </div>
      </div>

      <div class="d-total-row total-standalone">
        <span class="d-total-label">Total:</span>
        <div>
          <div class="d-total-amt">${totalStr}</div>
          ${totalWords ? `<div class="d-total-words">(${totalWords})</div>` : ''}
        </div>
      </div>

      <div class="d-sec-title">Forma de Pago</div>
      <div class="d-pago">
        <div class="d-pago-item">${pct}% al inicio — Cuota 0: <strong>${fmt(ant)}</strong></div>
        <div class="d-pago-item">${nCu} cuotas mensuales consecutivas ajustadas por IPC INDEC — ${fmt(cval)} c/u (base)
          <span class="d-pago-sub">A saldar entre el 1 y el 10 de cada mes</span>
        </div>
        <div class="d-pago-item">${escapeHtml(metPag)}
          <span class="d-pago-sub">Transferencia con emisión de factura correspondiente</span>
        </div>
      </div>

      <div class="d-vig-strip">
        <div class="d-vig-box">
          <div class="d-vig-lbl">Vigencia del presupuesto</div>
          <div class="d-vig-val">${escapeHtml(vig)} días</div>
        </div>
        <div class="d-vig-box" style="flex:2">
          <div class="d-vig-lbl">Próximo paso</div>
          <div class="d-vig-body">Confirmá tu aceptación y coordinamos la <strong>primera reunión</strong> para conocer a fondo tus ideas y <strong>empezar a diseñar juntos</strong> la casa que querés.</div>
        </div>
      </div>

      <div class="d-grat">
        <div class="d-grat-main">Gracias por permitirnos ser parte de este proyecto.</div>
        <div class="d-grat-sub">Estamos para acompañarte en cada paso.</div>
      </div>`;

    out.innerHTML = `${buildPage('Presupuesto de Tareas Profesionales', page1Body, num_, fecha)}${buildPage('Presupuesto de Tareas Profesionales', page2Body, num_, fecha)}`;
  } else {
    const total = num('fTotalRemo');
    const antR = num('fAntRemo');
    const nCuR = int('fCuotasRemo') || 8;
    const saldo = total - antR;
    const cvalR = nCuR > 0 ? Math.round(saldo / nCuR) : 0;
    const plazo = g('fPlazo');
    const hor = g('fHorario');
    const totalStr = total ? fmt(total) : '$ –';
    const totalWords = total ? `Pesos ${toWords(total)}` : '';

    let tn = 1;
    let tareasHTML = '';
    sectores.forEach(s => {
      const valid = s.items.filter(i => i.trim());
      if (!valid.length) return;
      tareasHTML += `<div class="d-sector"><div class="d-sector-title">${escapeHtml(s.n)}</div>${valid.map(it => `<div class="d-task"><span class="tn">${tn++}.</span>${escapeHtml(it)}</div>`).join('')}</div>`;
    });

    const page1Body = `
      <div class="d-client">
        ${cli ? `<div class="d-crow"><span class="d-clabel">Comitente:</span><span class="d-cval"><strong>${escapeHtml(cli)}</strong>${con ? ` · ${escapeHtml(con)}` : ''}</span></div>` : ''}
        ${ubi ? `<div class="d-crow"><span class="d-clabel">Dirección:</span><span class="d-cval">${escapeHtml(ubi)}</span></div>` : ''}
      </div>

      <p class="d-intro" style="margin-bottom:18px">Por medio de la presente, detallamos el presupuesto correspondiente a las tareas de refacción y acondicionamiento${desc ? `: ${escapeHtml(desc)}` : '.'} Las tareas comprenden las demoliciones, adecuaciones e instalaciones necesarias. La ejecución será realizada por el contratista, mientras que <strong>Estudio A tendrá a su cargo la coordinación, administración y supervisión general.</strong></p>

      <div class="d-sec-title">El presente presupuesto contempla:</div>
      <div class="d-tasks">${tareasHTML || '<p style="font-size:.78rem;color:#aaa;padding:12px 0">Agregá sectores y tareas en el panel de edición.</p>'}</div>
      ${hor ? `<div class="d-horario">Horario de trabajo: ${escapeHtml(hor)}</div>` : ''}
      <div class="d-clause">Cualquier tarea no contemplada que surja durante el proceso de obra será comunicada al comitente con carácter previo a su ejecución, acordándose su valorización y modalidad de pago antes de proceder. <strong>No se ejecutará ningún adicional sin conformidad expresa del cliente.</strong></div>`;

    const page2Body = `
      <div class="d-no-inc">
        <div class="d-no-inc-title">El presente presupuesto NO contempla:</div>
        <div class="d-no-item">Materiales de construcción</div>
        <div class="d-no-item">Provisión de servicios complementarios (baño químico, contenedores, etc.)</div>
        <div class="d-no-item">Gestiones en prestadores de servicios (EDEA, CAMUZZI, OSSE)</div>
        <div class="d-no-item">Instalación de Aires Acondicionados — se presupuesta por separado</div>
        <div class="d-no-item">Ejecución de muebles — se presupuesta por separado</div>
      </div>

      <div class="d-hon">
        <div class="d-hon-title">Resumen de Remodelación</div>
        <div class="d-hon-row">
          <span class="d-hon-label">Coordinación, administración y supervisión</span>
          <span class="d-hon-val" style="font-size:.78rem">Incluido</span>
        </div>
        <div class="d-hon-row">
          <span class="d-hon-label">Herramientas y materiales complementarios</span>
          <span class="d-hon-val" style="font-size:.78rem">Incluido</span>
        </div>
        <div class="d-hon-row">
          <span class="d-hon-label">Seguros del personal de obra</span>
          <span class="d-hon-val" style="font-size:.78rem">Incluido</span>
        </div>
        <div class="d-total-row">
          <span class="d-total-label">Total</span>
          <div>
            <div class="d-total-amt">${totalStr}</div>
            ${totalWords ? `<div class="d-total-words">(${totalWords})</div>` : ''}
          </div>
        </div>
      </div>

      <div class="d-sec-title">Forma de Pago</div>
      <div class="d-pago">
        <div class="d-pago-item">Anticipo para inicio de tareas (Cuota 0): <strong>${fmt(antR)}</strong></div>
        <div class="d-pago-item">Saldo en ${nCuR} cuotas semanales de <strong>${fmt(cvalR)}</strong> c/u<span class="d-pago-sub">A saldar los días viernes</span></div>
        <div class="d-pago-item">${escapeHtml(metPag)}</div>
      </div>

      <div class="d-vig-strip">
        ${plazo ? `<div class="d-vig-box"><div class="d-vig-lbl">Plazo de obra estimado</div><div class="d-vig-val" style="font-size:.88rem">${escapeHtml(plazo)}</div></div>` : ''}
        <div class="d-vig-box"><div class="d-vig-lbl">Vigencia del presupuesto</div><div class="d-vig-val">${escapeHtml(vig)} días</div></div>
      </div>

      <div class="d-note">El presente presupuesto se elabora en base a estimación de jornadas de trabajo, dado que la naturaleza de las tareas no permite una cuantificación por unidad de medida. El monto total refleja la estimación integral del equipo para el alcance descripto.</div>`;

    out.innerHTML = `${buildPage(`Presupuesto de Remodelación${ubi ? ` — ${escapeHtml(ubi)}` : ''}`, page1Body, num_, fecha)}${buildPage(`Presupuesto de Remodelación${ubi ? ` — ${escapeHtml(ubi)}` : ''}`, page2Body, num_, fecha)}`;
  }
}
