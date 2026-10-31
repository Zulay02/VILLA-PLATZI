// VILLA PLATZI - versión final
// Une lo aprendido en las versiones anteriores:
// - los animales aparecen al azar UNA sola vez y se guardan sus posiciones
// - el cerdo se mueve con las flechas
// - el lobo se mueve con W, A, S, D
// - al mover, se vuelve a dibujar todo en las MISMAS posiciones (nadie salta)

var vp = document.getElementById("villaplatzi");
var papel = vp.getContext("2d");

var teclas = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    W: 87,
    S: 83,
    A: 65,
    D: 68
};

var movimiento = 20;

var fondo = { url: "tile.png", cargaOK: false };
var vaca = { url: "vaca.png", cargaOK: false, x: [], y: [] };
var pollo = { url: "pollo.png", cargaOK: false, x: [], y: [] };
var cerdo = { url: "cerdo.png", cargaOK: false, x: 0, y: 0, ancho: 80, alto: 80 };

// El dibujo del lobo (lobo.png) mide 256 x 256, pero el lobo solo ocupa
// una franja del centro. Recortamos esa parte para que no se vea aplastado
// y lo dibujamos proporcional, un poco más grande que la vaca.
var lobo = {
    url: "lobo.png",
    cargaOK: false,
    x: 300,
    y: 380,
    recorteX: 8,
    recorteY: 73,
    recorteAncho: 240,
    recorteAlto: 110,
    ancho: 132,
    alto: 60
};

var cantidadVacas = aleatorio(3, 8);
var cantidadPollos = aleatorio(3, 8);

// Se calculan las posiciones al azar una sola vez
for (var v = 0; v < cantidadVacas; v++) {
    vaca.x.push(aleatorio(0, 7) * 60);
    vaca.y.push(aleatorio(0, 7) * 60);
}
for (var p = 0; p < cantidadPollos; p++) {
    pollo.x.push(aleatorio(0, 7) * 60);
    pollo.y.push(aleatorio(0, 7) * 60);
}
cerdo.x = aleatorio(0, 5) * 60;
cerdo.y = aleatorio(0, 5) * 60;

cargarImagen(fondo);
cargarImagen(vaca);
cargarImagen(pollo);
cargarImagen(cerdo);
cargarImagen(lobo);

function cargarImagen(animal) {
    animal.imagen = new Image();
    animal.imagen.addEventListener("load", function () {
        animal.cargaOK = true;
        dibujar();
    });
    animal.imagen.src = animal.url;
}

function dibujar() {
    if (fondo.cargaOK) {
        papel.drawImage(fondo.imagen, 0, 0);
    }
    if (vaca.cargaOK) {
        for (var v = 0; v < cantidadVacas; v++) {
            papel.drawImage(vaca.imagen, vaca.x[v], vaca.y[v]);
        }
    }
    if (pollo.cargaOK) {
        for (var p = 0; p < cantidadPollos; p++) {
            papel.drawImage(pollo.imagen, pollo.x[p], pollo.y[p]);
        }
    }
    if (cerdo.cargaOK) {
        papel.drawImage(cerdo.imagen, cerdo.x, cerdo.y);
    }
    if (lobo.cargaOK) {
        papel.drawImage(
            lobo.imagen,
            lobo.recorteX, lobo.recorteY, lobo.recorteAncho, lobo.recorteAlto,
            lobo.x, lobo.y, lobo.ancho, lobo.alto
        );
    }
}

function aleatorio(min, maxi) {
    return Math.floor(Math.random() * (maxi - min + 1)) + min;
}

// Evita que el animal se salga del lienzo
function limitar(valor, maximo) {
    if (valor < 0) {
        return 0;
    }
    if (valor > maximo) {
        return maximo;
    }
    return valor;
}

document.addEventListener("keydown", moverTecla);

function moverTecla(evento) {
    switch (evento.keyCode) {
        // Cerdo con las flechas
        case teclas.UP:
            cerdo.y = cerdo.y - movimiento;
            break;
        case teclas.DOWN:
            cerdo.y = cerdo.y + movimiento;
            break;
        case teclas.LEFT:
            cerdo.x = cerdo.x - movimiento;
            break;
        case teclas.RIGHT:
            cerdo.x = cerdo.x + movimiento;
            break;
        // Lobo con W, A, S, D
        case teclas.W:
            lobo.y = lobo.y - movimiento;
            break;
        case teclas.S:
            lobo.y = lobo.y + movimiento;
            break;
        case teclas.A:
            lobo.x = lobo.x - movimiento;
            break;
        case teclas.D:
            lobo.x = lobo.x + movimiento;
            break;
        default:
            return; // otra tecla: no se hace nada
    }
    // Las flechas no deben mover la página hacia arriba o abajo
    evento.preventDefault();

    cerdo.x = limitar(cerdo.x, vp.width - cerdo.ancho);
    cerdo.y = limitar(cerdo.y, vp.height - cerdo.alto);
    lobo.x = limitar(lobo.x, vp.width - lobo.ancho);
    lobo.y = limitar(lobo.y, vp.height - lobo.alto);

    dibujar();
}
