let materias = JSON.parse(localStorage.getItem("org-materias")) || [
    {
        id: 101,
        nombre: "Estructuras de Datos",
        profesor: "Dr. Roberto Gómez",
        unidades: ["Unidad 1: Apuntadores", "Unidad 2: Pilas y Colas"]
    }
];

let tareas = JSON.parse(localStorage.getItem("org-tareas")) || [
    {
        id: 201,
        materiaId: 101,
        materia: "Estructuras de Datos",
        unidad: "Unidad 2: Pilas y Colas",
        nombre: "Implementar Cola en C",
        detalle: "Usar punteros frente y fin",
        fecha: new Date().toISOString().split('T')[0],
        completada: false
    }
];

let historial = JSON.parse(localStorage.getItem("org-historial")) || [];
let acciones = [];


function guardar() {
    localStorage.setItem("org-materias", JSON.stringify(materias));
    localStorage.setItem("org-tareas", JSON.stringify(tareas));
    localStorage.setItem("org-historial", JSON.stringify(historial));
    actualizarEstadisticas();
}

function registrar(mensaje) {
    historial.push({ mensaje, fecha: new Date().toLocaleString() });
    guardar();
}

function actualizarEstadisticas() {
    document.getElementById("totalMaterias").textContent = materias.length;
    document.getElementById("totalPendientes").textContent = tareas.filter(t => !t.completada).length;
    document.getElementById("totalCompletadas").textContent = tareas.filter(t => t.completada).length;
}

function alternarModo() {
    const actual = document.documentElement.getAttribute("data-theme");
    const nuevo = actual === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nuevo);
    localStorage.setItem("org-theme", nuevo);
    document.querySelector(".btn-modo").textContent = nuevo === "dark" ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
}


if(localStorage.getItem("org-theme") === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
}

function ocultarFormularios() {
    document.querySelectorAll(".formulario").forEach(f => f.classList.remove("activo"));
    document.getElementById("contenedorBuscador").style.display = "none";
}

function mostrarFormulario(tipo) {
    ocultarFormularios();
    const formulario = document.getElementById("form" + tipo.charAt(0).toUpperCase() + tipo.slice(1));
    formulario.classList.add("activo");
    document.getElementById("tituloVista").textContent = "Registrar información";
    document.getElementById("descripcionVista").textContent = "Completa los campos correspondientes.";
    document.getElementById("vista").innerHTML = "";
    actualizarSelects();
}

function actualizarSelects() {
    let opciones = '<option value="">Selecciona una materia</option>';
    materias.forEach(m => { opciones += `<option value="${m.id}">${m.nombre}</option>`; });
    if(document.getElementById("materiaUnidad")) document.getElementById("materiaUnidad").innerHTML = opciones;
    if(document.getElementById("materiaTarea")) document.getElementById("materiaTarea").innerHTML = opciones;
    actualizarUnidades();
}

function actualizarUnidades() {
    let id = Number(document.getElementById("materiaTarea").value);
    let materia = materias.find(m => m.id === id);
    let select = document.getElementById("unidadTarea");
    if(!materia || !materia.unidades || materia.unidades.length === 0) {
        select.innerHTML = '<option value="">Sin unidades registradas</option>';
        return;
    }
    select.innerHTML = materia.unidades.map(u => `<option value="${u}">${u}</option>`).join("");
}

function agregarMateria() {
    let nombre = document.getElementById("nombreMateria").value.trim();
    let profesor = document.getElementById("profesor").value.trim();
    if (!nombre) { alert("Escribe el nombre de la materia."); return; }
    materias.push({ id: Date.now(), nombre, profesor, unidades: [] });
    registrar("Se agregó la materia: " + nombre);
    document.getElementById("nombreMateria").value = "";
    document.getElementById("profesor").value = "";
    alert("Materia agregada correctamente.");
    inicio();
}

function agregarUnidad() {
    let id = Number(document.getElementById("materiaUnidad").value);
    let nombre = document.getElementById("nombreUnidad").value.trim();
    let materia = materias.find(m => m.id === id);
    if (!materia || !nombre) { alert("Selecciona una materia y escribe la unidad."); return; }
    materia.unidades.push(nombre);
    registrar("Se agregó la unidad " + nombre + " a " + materia.nombre);
    document.getElementById("nombreUnidad").value = "";
    alert("Unidad agregada correctamente.");
    inicio();
}

function agregarTarea() {
    let idMateria = Number(document.getElementById("materiaTarea").value);
    let materia = materias.find(m => m.id === idMateria);
    let unidad = document.getElementById("unidadTarea").value;
    let nombre = document.getElementById("nombreTarea").value.trim();
    let detalle = document.getElementById("detalleTarea").value.trim();
    let fecha = document.getElementById("fechaTarea").value;

    if (!materia || !nombre || !fecha) { alert("Faltan datos obligatorios."); return; }

    let tarea = { id: Date.now(), materiaId: materia.id, materia: materia.nombre, unidad, nombre, detalle, fecha, completada: false };
    tareas.push(tarea);
    acciones.push({ tipo: "agregar", tarea });
    registrar("Se agregó la tarea: " + nombre);
    document.getElementById("nombreTarea").value = "";
    document.getElementById("detalleTarea").value = "";
    document.getElementById("fechaTarea").value = "";
    alert("Tarea registrada en la Cola.");
    mostrarTodo();
}

function inicio() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Progreso por Materias";
    document.getElementById("descripcionVista").textContent = "Resumen general de tus avances académicos.";
    let vista = document.getElementById("vista");

    if (materias.length === 0) {
        vista.innerHTML = '<div class="vacio">No hay materias registradas. Comienza agregando una en el menú.</div>';
        return;
    }

    let html = '<div class="tarjetas">';
    materias.forEach(m => {
        let tMateria = tareas.filter(t => t.materiaId === m.id);
        let completadas = tMateria.filter(t => t.completada).length;
        let total = tMateria.length;
        let porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

        html += `
            <div class="tarjeta">
                <h3>${escapar(m.nombre)}</h3>
                <p><strong>Profesor:</strong> ${escapar(m.profesor || "No asignado")}</p>
                <p>Tareas completadas: ${completadas} / ${total}</p>
                <div class="barra-progreso-contenedor">
                    <div class="barra-progreso-llenado" style="width: ${porcentaje}%"></div>
                </div>
                <span class="estado">${porcentaje}% Avanzado</span>
            </div>
        `;
    });
    html += '</div>';
    vista.innerHTML = html;
}

function mostrarTodo() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Todas las Tareas";
    document.getElementById("descripcionVista").textContent = "Gestión completa de actividades (Cola FIFO y estados).";
    document.getElementById("contenedorBuscador").style.display = "block";
    renderizarListaTareas(tareas);
}

function filtrarTareas(texto) {
    let filtradas = tareas.filter(t => t.nombre.toLowerCase().includes(texto.toLowerCase()) || t.materia.toLowerCase().includes(texto.toLowerCase()));
    renderizarListaTareas(filtradas);
}

function renderizarListaTareas(lista) {
    let vista = document.getElementById("vista");
    let contenedorResultados = document.getElementById("resultadosTareas");
    if(!contenedorResultados) {
        // Creamos contenedor dinámico si no existe
        vista.innerHTML = '<div id="resultadosTareas"></div>';
        contenedorResultados = document.getElementById("resultadosTareas");
    }

    if (lista.length === 0) {
        contenedorResultados.innerHTML = '<div class="vacio">No se encontraron tareas registradas.</div>';
        return;
    }

    let hoy = new Date().toISOString().split('T')[0];
    let ordenadas = [...lista].sort((a,b) => a.fecha.localeCompare(b.fecha));

    contenedorResultados.innerHTML = ordenadas.map(t => {
        let esUrgente = !t.completada && t.fecha <= hoy;
        return `
            <div class="tarea ${t.completada ? "completada" : ""} ${esUrgente ? "urgente" : ""}">
                <h3>${escapar(t.nombre)}</h3>
                <p><strong>Materia:</strong> ${escapar(t.materia)}</p>
                <p><strong>Unidad:</strong> ${escapar(t.unidad || "Sin unidad")}</p>
                <p><strong>Detalle:</strong> ${escapar(t.detalle || "Sin descripción")}</p>
                <p><strong>Entrega:</strong> ${t.fecha} ${esUrgente ? '⚠️ <strong>¡Urgente / Vence hoy!</strong>' : ''}</p>
                <span class="estado ${t.completada ? "ok" : (esUrgente ? "alerta" : "")}">
                    ${t.completada ? "Completada" : (esUrgente ? "Urgente" : "Pendiente en Cola")}
                </span>
                <br><br>
                ${!t.completada ? `<button class="btn btn-verde" onclick="completarTarea(${t.id})">✓ Completar</button>` : ""}
                <button class="btn btn-rojo" onclick="eliminarTarea(${t.id})">🗑️ Eliminar</button>
            </div>
        `;
    }).join("");
}

function siguienteTarea() {
    ocultarFormularios();
    let pendientes = tareas.filter(t => !t.completada).sort((a,b) => a.fecha.localeCompare(b.fecha));
    document.getElementById("tituloVista").textContent = "Siguiente Tarea en Cola (FIFO)";
    document.getElementById("descripcionVista").textContent = "La actividad al frente de la cola con fecha más próxima.";
    
    if (pendientes.length === 0) {
        document.getElementById("vista").innerHTML = '<div class="vacio">¡Excelente! No hay tareas pendientes en la cola.</div>';
        return;
    }
    
    let t = pendientes[0];
    document.getElementById("vista").innerHTML = `
        <div class="tarea" style="border-left-color: var(--acento);">
            <h3>🚀 [FRENTE DE COLA] ${escapar(t.nombre)}</h3>
            <p><strong>Materia:</strong> ${escapar(t.materia)}</p>
            <p><strong>Fecha límite:</strong> ${t.fecha}</p>
            <button class="btn btn-verde" onclick="completarTarea(${t.id})">Completar Siguiente</button>
        </div>
    `;
}

function completarTarea(id) {
    let tarea = tareas.find(t => t.id === id);
    if (!tarea || tarea.completada) return;
    acciones.push({ tipo: "completar", tareaId: id });
    tarea.completada = true;
    registrar("Se completó la tarea: " + tarea.nombre);
    mostrarTodo();
}

function completarSiguiente() {
    let pendientes = tareas.filter(t => !t.completada).sort((a,b) => a.fecha.localeCompare(b.fecha));
    if (pendientes.length === 0) { alert("No hay tareas pendientes."); return; }
    completarTarea(pendientes[0].id);
}

function deshacer() {
    let accion = acciones.pop();
    if (!accion) { alert("No hay acciones recientes para deshacer en la Pila LIFO."); return; }
    if (accion.tipo === "agregar") {
        tareas = tareas.filter(t => t.id !== accion.tarea.id);
        registrar("Se deshizo el registro de: " + accion.tarea.nombre);
    } else if (accion.tipo === "completar") {
        let tarea = tareas.find(t => t.id === accion.tareaId);
        if (tarea) { tarea.completada = false; registrar("Se des hizo la completación de: " + tarea.nombre); }
    }
    guardar();
    mostrarTodo();
}

function eliminarTarea(id) {
    if (!confirm("¿Deseas eliminar esta tarea permanentemente?")) return;
    let tarea = tareas.find(t => t.id === id);
    tareas = tareas.filter(t => t.id !== id);
    registrar("Se eliminó la tarea: " + tarea.nombre);
    guardar();
    mostrarTodo();
}

function mostrarEstructuras() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Visualizador Gráfico de Estructuras";
    document.getElementById("descripcionVista").textContent = "Representación conceptual de la memoria (Cola FIFO y Pila LIFO).";
    
    let pendientes = tareas.filter(t => !t.completada);
    let completadas = tareas.filter(t => t.completada);

    let html = `<h3>📦 Cola de Pendientes (Frente -> Fin)</h3>`;
    if(pendientes.length === 0) {
        html += `<p style="color:var(--gris); margin-bottom:20px;">Cola vacía (NULL)</p>`;
    } else {
        html += `<div style="margin-bottom:20px;">`;
        pendientes.forEach((t, i) => {
            html += `<div class="nodo-estructura"><span class="flecha-nodo">[${i === 0 ? 'FRENTE' : 'nodo'}]</span> <strong>${escapar(t.nombre)}</strong> (${escapar(t.materia)})</div>`;
        });
        html += `</div>`;
    }

    html += `<h3>📚 Pila de Historial / Completadas (Tope LIFO)</h3>`;
    if(completadas.length === 0) {
        html += `<p style="color:var(--gris);">Pila vacía (TOPE = NULL)</p>`;
    } else {
        html += `<div>`;
        completadas.slice().reverse().forEach((t, i) => {
            html += `<div class="nodo-estructura"><span class="flecha-nodo">[${i === 0 ? 'TOPE' : 'abajo'}]</span> ✅ <strong>${escapar(t.nombre)}</strong> (${escapar(t.materia)})</div>`;
        });
        html += `</div>`;
    }

    document.getElementById("vista").innerHTML = html;
}

function mostrarHistorial() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Historial de Actividades";
    document.getElementById("descripcionVista").textContent = "Registro cronológico de cambios y transacciones.";
    let vista = document.getElementById("vista");
    if (historial.length === 0) { vista.innerHTML = '<div class="vacio">No hay movimientos registrados.</div>'; return; }
    vista.innerHTML = [...historial].reverse().map(h => `
        <div class="tarea">
            <h3>${escapar(h.mensaje)}</h3>
            <p>${escapar(h.fecha)}</p>
        </div>
    `).join("");
}

function mostrarCalendario() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Calendario de Entregas";
    document.getElementById("descripcionVista").textContent = "Listado cronológico de tareas programadas.";
    let vista = document.getElementById("vista");
    if (tareas.length === 0) { vista.innerHTML = '<div class="vacio">No hay tareas programadas.</div>'; return; }
    let ordenadas = [...tareas].sort((a,b) => a.fecha.localeCompare(b.fecha));
    vista.innerHTML = ordenadas.map(t => `
        <div class="tarea ${t.completada ? "completada" : ""}">
            <h3>📅 ${t.fecha}</h3>
            <p><strong>${escapar(t.nombre)}</strong> - ${escapar(t.materia)}</p>
            <span class="estado ${t.completada ? "ok" : ""}">${t.completada ? "Completada" : "Pendiente"}</span>
        </div>
    `).join("");
}

function mostrarCodigoC() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Código Fuente en C";
    document.getElementById("descripcionVista").textContent = "Implementación estructural base en lenguaje C.";
    document.getElementById("vista").innerHTML = `
        <div class="contenedor-codigo">
            <div class="barra-codigo">
                <span>codigo principal.c</span>
                <button class="btn" style="padding:6px 12px; font-size:12px;" onclick="copiarCodigoC()">Copiar</button>
            </div>
            <pre><code>${escapar(codigoC)}</code></pre>
        </div>
    `;
}

function copiarCodigoC() {
    navigator.clipboard.writeText(codigoC).then(() => { alert("Código copiado al portapapeles con éxito."); });
}

function escapar(valor) {
    return String(valor).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
}

// NUEVA FUNCIÓN PARA GESTIONAR EL BUZÓN DE NETLIFY MEDIANTE FETCH
function mostrarFormularioNetlify() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Buzón de Comentarios (Netlify)";
    document.getElementById("descripcionVista").textContent = "Envía tus comentarios o sugerencias directamente a la plataforma.";
    
    let vista = document.getElementById("vista");
    vista.innerHTML = `
        <div class="tarjeta" style="max-width: 600px; margin: 0 auto;">
            <form id="formNetlify" name="contacto-net" method="POST" data-netlify="true">
                <input type="hidden" name="form-name" value="contacto-net" />
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;"><strong>Nombre:</strong></label>
                    <input type="text" name="nombre" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--gris);" />
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;"><strong>Correo electrónico:</strong></label>
                    <input type="email" name="email" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--gris);" />
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;"><strong>Mensaje / Comentario:</strong></label>
                    <textarea name="mensaje" rows="4" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--gris);"></textarea>
                </div>
                <button type="submit" class="btn btn-verde">Enviar a Netlify</button>
            </form>
            <div id="respuestaNetlify" style="margin-top: 15px; font-weight: bold;"></div>
        </div>
    `;

    document.getElementById("formNetlify").addEventListener("submit", function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        })
        .then(() => {
            alert("¡Mensaje enviado con éxito a Netlify!");
            this.reset();
        })
        .catch(error => {
            alert("Hubo un error al enviar el formulario.");
            console.error(error);
        });
    });
}

actualizarEstadisticas();
