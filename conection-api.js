// API UTILIZADA: https://api.precioil.es/api-docs/

// Sacar todas las provincias de españa:
// "https://api.precioil.es/provincias"

// codigo provincia barcelona = 8    "https://api.precioil.es/municipios/provincia/8"
// codigo provincia girona = 17      "https://api.precioil.es/municipios/provincia/17"

// codigo pueblo blanes = 2470

// Sacar gasolineras de un municipio:
// "https://api.precioil.es/estaciones/municipio/2470"

// codigo id estacio = 13994 -> GM OIL
// "https://api.precioil.es/estaciones/detalles/13994"


// historico de precios de una estacion:
// "https://api.precioil.es/estaciones/historico/13994"


const boton = document.getElementById("boton-buscar");
const respuestaSP95 = document.getElementById("respuesta-SP95");
const respuestaGasoilA = document.getElementById("respuesta-GasoilA")
const fechaActual = document.getElementById("fecha-actual");

const posElt = document.getElementById('pos');
const posLinkElt = document.querySelector('#posLink > a');

// eventos
windows.addEventListener('load', geolocalizacionActual);
boton.addEventListener('click', busquedaActual);
boton.addEventListener('click', busquedaUltimaSemana);

// Buscar y mostrar la fecha actual.
let f = new Date();
fechaActual.innerHTML += f.getDate().toString().padStart(2, "0") + "/" + (f.getMonth()+1).toString().padStart(2, "0") + "/" + f.getFullYear(); 


function geolocalizacionActual() {
    // Devuelve un objeto como respuesta que se usa para la funcion callback tanto de OK, como de error
    // https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
    navigator.geolocation.getCurrentPosition(geoposOK, geoposKO);
}

function geoposOK(pos) {
    //Obtenemos latitud y longitud
    var lat = pos.coords.latitude;
    var long = pos.coords.longitude;

    //Mostramos la posición
    posElt.textContent = `Latitud: ${lat}, Longitud: ${long}`;

    //generamos enlace a la posición
    posLinkElt.href = `https://maps.google.com/?q=${lat},${long}`;
    posLinkElt.textContent = 'Mostrar tu posición en un mapa';
}

/** @param {GeolocationPositionError} err */
function geoposKO(err) {
    console.warn(err.message);
    let msg;
    switch (err.code) {
        case err.PERMISSION_DENIED:
            msg = "No nos has dado permiso para obtener tu posición";
            break;
        case err.POSITION_UNAVAILABLE:
            msg = "Tu posición actual no está disponible";
            break;
        case err.TIMEOUT:
            msg = "No se ha podido obtener tu posición en un tiempo prudencial";
            break;
        default:
            msg = "Error desconocido";
            break;
    }
    posElt.textContent = msg;
}









function busquedaActual(){
    const link = "https://api.precioil.es/estaciones/detalles/13994";
    respuestaSP95.innerHTML = "Buscando...";
    respuestaGasoilA.innerHTML = "Buscando...";
    fetch(link)
    .then(res => res.json())
    .then(response => {
        //console.log(response);
        respuestaSP95.innerHTML = response.Gasolina95+"€";
        respuestaGasoilA.innerHTML = response.Diesel +"€";
    })
}

function busquedaUltimaSemana(){

    // Permite actualizar la cantidad de dias hacia atras que revisamos precios.
    const margenDiasComparativa = 4;

    let contenedor = document.getElementById("contenedor-precios-antiguos");
    contenedor.innerHTML = `
            <div class="row">
              <span class="text-center">Buscando datos...</span> 
            </div>
            <div class="row">
              <span class="text-center">Buscando datos...</span> 
            </div>
            <div class="row">
              <span class="text-center">Buscando datos...</span> 
            </div>
            <div class="row">
              <span class="text-center">Buscando datos...</span> 
            </div>
    `;
    

    const fechaFinal = new Date();
    let annoFinal = fechaFinal.getFullYear().toString();
    let mesFinal = (fechaFinal.getMonth()+1).toString().padStart(2, "0");
    let diaFinal = fechaFinal.getDate().toString().padStart(2, "0");
    

    const fechaInicio = new Date();
    let fechaAux = fechaInicio.getDate() - margenDiasComparativa;
    fechaInicio.setDate(fechaAux);
    let annoInicio = fechaInicio.getFullYear().toString();
    let mesInicio = (fechaInicio.getMonth()+1).toString().padStart(2, "0");
    let diaInicio = fechaInicio.getDate().toString().padStart(2, "0");

    let fechasUrl = "?fechaInicio="+annoInicio+"-"+mesInicio+"-"+diaInicio+"&fechaFin="+annoFinal+"-"+mesFinal+"-"+diaFinal;
    const link = "https://api.precioil.es/estaciones/historico/13994"+fechasUrl;
    fetch(link)
    .then(res => res.json())
    .then(response => {
        // console.log(response);
        let idReferenciaDivNuevo;
        let elementos = response.data;
        contenedor.innerHTML = "";

        for(let i = elementos.length-1; i >= 0; i--){

                // sp95
                if (elementos[i].idFuelType == 10) {
                    
                    // 1. creamos la fila y la columna
                    // 2. añadimos el valor de sp95
                    idReferenciaDivNuevo = crearFilaYColumnaDeTabla(elementos[i], idReferenciaDivNuevo, true, false)

                    // 3. creamos la segunda columna de esa fila
                    // 4. añadimos la fecha en la segunda columna
                    idReferenciaDivNuevo = crearFilaYColumnaDeTabla(elementos[i], idReferenciaDivNuevo, false, true)
                }

                // gasoil A
                 if (elementos[i].idFuelType == 6){
                    
                    // 1. creamos la tercera fila 
                    // 2. añadimos el valor de gasoil A
                    idReferenciaDivNuevo = crearFilaYColumnaDeTabla(elementos[i], idReferenciaDivNuevo, false, false); 
                }            
        }
    })
}

function crearFilaYColumnaDeTabla(elemento, idReferenciaDivNuevo, crearFila, ponerFechaEnColumna){
    let contenedor = document.getElementById("contenedor-precios-antiguos");
    let span = document.createElement("span");
    let div;
    span.classList.add("text-center");
    span.classList.add("col");
    

    if (crearFila == true){
        div = document.createElement("div");
        div.classList.add("row");
        contenedor.append(div);
        idReferenciaDivNuevo = elemento.idPrecio;
        div.setAttribute("id", idReferenciaDivNuevo);


    }
    else{ div = document.getElementById(idReferenciaDivNuevo); }
    
    
    if (ponerFechaEnColumna == true){
        let fecha = new Date(elemento.timestamp.substring(0,10));
        span.innerHTML = fecha.getDate().toString().padStart(2, "0") +"/"+(fecha.getMonth()+1).toString().padStart(2, "0")+"/"+fecha.getFullYear();      
    }
    else{ 
        span.innerHTML = elemento.precio+"€";
    }


    div.append(span);
    return idReferenciaDivNuevo;
}
