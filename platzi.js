// VILLA PLATZI - juego con tres niveles
// Nivel 1: el lobo persigue al cerdo (dos jugadores)
// Nivel 2: el cerdo rescata a los pollitos antes de que el lobo lo atrape
// Nivel 3: el cerdo lleva las vacas al granero antes de que se acabe el tiempo

var vp = document.getElementById("villaplatzi");
var papel = vp.getContext("2d");
var textoInstrucciones = document.getElementById("instrucciones");
var textoEstado = document.getElementById("estado");

// ---------- IMÁGENES ----------
var imagenes = {
    fondo: "tile.png",
    vaca: "vaca.png",
    cerdo: "cerdo.png",
    pollo: "pollo.png",
    lobo: "lobo.png"
};
var imagenesCargadas = 0;

for (var nombre in imagenes) {
    var img = new Image();
    img.addEventListener("load", function () {
        imagenesCargadas++;
        if (imagenesCargadas === 5) {
            dibujarPortada();
        }
    });
    img.src = imagenes[nombre];
    imagenes[nombre] = img;
}

// Cada animal se dibuja con este tamaño en el lienzo.
// "caja" es la parte del dibujo que de verdad ocupa el animal
// (las imágenes tienen espacio vacío alrededor). Se usa para saber si dos animales se tocan.
var formas = {
    cerdo: { ancho: 80, alto: 80, caja: { x: 15, y: 30, ancho: 50, alto: 26 } },
    vaca:  { ancho: 80, alto: 80, caja: { x: 8, y: 26, ancho: 64, alto: 38 } },
    pollo: { ancho: 80, alto: 80, caja: { x: 23, y: 31, ancho: 28, alto: 25 } },
    lobo:  { ancho: 132, alto: 60, caja: { x: 10, y: 8, ancho: 112, alto: 46 },
             recorte: { x: 8, y: 73, ancho: 240, alto: 110 } }
};

// El granero está en la esquina de abajo a la derecha del fondo
var granero = { x: 385, y: 375, ancho: 115, alto: 125 };

// ---------- TECLADO ----------
var teclasPresionadas = {};

document.addEventListener("keydown", function (evento) {
    teclasPresionadas[evento.code] = true;
    if (evento.code.indexOf("Arrow") === 0) {
        evento.preventDefault(); // que las flechas no muevan la página
    }
});
document.addEventListener("keyup", function (evento) {
    teclasPresionadas[evento.code] = false;
});

// ---------- ESTADO DEL JUEGO ----------
var nivel = 0;
var jugando = false;
var tiempo = 0;
var ultimoMomento = 0;
var cerdo, lobo, pollos, vacas;

document.getElementById("nivel1").addEventListener("click", function () { empezarNivel(1); });
document.getElementById("nivel2").addEventListener("click", function () { empezarNivel(2); });
document.getElementById("nivel3").addEventListener("click", function () { empezarNivel(3); });

function aleatorio(min, maxi) {
    return Math.floor(Math.random() * (maxi - min + 1)) + min;
}

function crearAnimal(tipo, x, y) {
    return { tipo: tipo, x: x, y: y };
}

function empezarNivel(numero) {
    nivel = numero;
    marcarBoton(numero);
    teclasPresionadas = {};

    cerdo = crearAnimal("cerdo", 40, 60);
    lobo = null;
    pollos = [];
    vacas = [];

    if (numero === 1) {
        lobo = crearAnimal("lobo", 330, 400);
        tiempo = 30;
        textoInstrucciones.innerHTML =
            "<strong>Dos jugadores.</strong> 🐷 El cerdo huye con las flechas " +
            "<kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd>. " +
            "🐺 El lobo persigue con <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>. " +
            "Si el cerdo aguanta 30 segundos, gana el cerdo.";
    }

    if (numero === 2) {
        lobo = crearAnimal("lobo", 340, 400);
        lobo.velocidad = 70;
        for (var p = 0; p < 6; p++) {
            pollos.push(crearAnimal("pollo", aleatorio(1, 6) * 60, aleatorio(0, 5) * 60));
        }
        tiempo = 0;
        textoInstrucciones.innerHTML =
            "🐷 Mueve el cerdo con las flechas <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> " +
            "y toca a los 6 pollitos para rescatarlos. " +
            "🐺 ¡Cuidado! El lobo te persigue solo y cada vez corre más rápido.";
    }

    if (numero === 3) {
        for (var v = 0; v < 4; v++) {
            var vaca = crearAnimal("vaca", aleatorio(0, 5) * 70, aleatorio(0, 4) * 70 + 10);
            vaca.sigue = false;
            vaca.enGranero = false;
            vacas.push(vaca);
        }
        tiempo = 45;
        textoInstrucciones.innerHTML =
            "🐷 Mueve el cerdo con las flechas <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd>. " +
            "Toca cada vaca 🐄 para que te siga y llévalas al <strong>granero</strong> " +
            "(abajo a la derecha) antes de 45 segundos.";
    }

    jugando = true;
    ultimoMomento = performance.now();
    requestAnimationFrame(cicloDelJuego);
}

function marcarBoton(numero) {
    for (var n = 1; n <= 3; n++) {
        document.getElementById("nivel" + n).className = (n === numero) ? "activo" : "";
    }
}

// ---------- CICLO DEL JUEGO ----------
// Se repite unas 60 veces por segundo: mueve todo y vuelve a dibujar.
function cicloDelJuego(momento) {
    if (!jugando) {
        return;
    }
    var segundos = Math.min((momento - ultimoMomento) / 1000, 0.05);
    ultimoMomento = momento;

    actualizar(segundos);
    dibujar();

    if (jugando) {
        requestAnimationFrame(cicloDelJuego);
    }
}

function moverConTeclas(animal, arriba, abajo, izquierda, derecha, velocidad, segundos) {
    var paso = velocidad * segundos;
    if (teclasPresionadas[arriba]) { animal.y -= paso; }
    if (teclasPresionadas[abajo]) { animal.y += paso; }
    if (teclasPresionadas[izquierda]) { animal.x -= paso; }
    if (teclasPresionadas[derecha]) { animal.x += paso; }
    mantenerDentro(animal);
}

function mantenerDentro(animal) {
    var forma = formas[animal.tipo];
    animal.x = Math.max(-forma.caja.x, Math.min(animal.x, vp.width - forma.caja.x - forma.caja.ancho));
    animal.y = Math.max(-forma.caja.y, Math.min(animal.y, vp.height - forma.caja.y - forma.caja.alto));
}

// Mueve un animal hacia un punto, a cierta velocidad
function irHacia(animal, destinoX, destinoY, velocidad, segundos) {
    var dx = destinoX - animal.x;
    var dy = destinoY - animal.y;
    var distancia = Math.sqrt(dx * dx + dy * dy);
    if (distancia < 1) {
        return;
    }
    var paso = Math.min(velocidad * segundos, distancia);
    animal.x += dx / distancia * paso;
    animal.y += dy / distancia * paso;
}

// Devuelve la caja (rectángulo) que ocupa un animal en el lienzo
function caja(animal) {
    var c = formas[animal.tipo].caja;
    return { x: animal.x + c.x, y: animal.y + c.y, ancho: c.ancho, alto: c.alto };
}

// COLISIÓN: ¿se tocan dos rectángulos?
function seTocan(a, b) {
    return a.x < b.x + b.ancho &&
           a.x + a.ancho > b.x &&
           a.y < b.y + b.alto &&
           a.y + a.alto > b.y;
}

function centro(animal) {
    var c = caja(animal);
    return { x: c.x + c.ancho / 2, y: c.y + c.alto / 2 };
}

function actualizar(segundos) {
    moverConTeclas(cerdo, "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", 170, segundos);

    if (nivel === 1) {
        moverConTeclas(lobo, "KeyW", "KeyS", "KeyA", "KeyD", 170, segundos);
        tiempo -= segundos;
        textoEstado.textContent = "⏱️ Tiempo: " + Math.ceil(Math.max(tiempo, 0)) + " segundos";

        if (seTocan(caja(cerdo), caja(lobo))) {
            terminar("🐺 ¡El lobo atrapó al cerdo! Gana el lobo.");
        } else if (tiempo <= 0) {
            terminar("🐷 ¡El cerdo aguantó 30 segundos! Gana el cerdo.");
        }
    }

    if (nivel === 2) {
        tiempo += segundos;
        // El lobo va hacia el cerdo y cada segundo corre un poquito más
        lobo.velocidad = 70 + tiempo * 3;
        var objetivo = centro(cerdo);
        var forma = formas.lobo;
        irHacia(lobo, objetivo.x - forma.ancho / 2, objetivo.y - forma.alto / 2, lobo.velocidad, segundos);

        for (var p = pollos.length - 1; p >= 0; p--) {
            if (seTocan(caja(cerdo), caja(pollos[p]))) {
                pollos.splice(p, 1); // rescatado: se quita de la lista
            }
        }
        textoEstado.textContent = "🐣 Pollitos rescatados: " + (6 - pollos.length) + " de 6";

        if (seTocan(caja(cerdo), caja(lobo))) {
            terminar("🐺 ¡El lobo te atrapó! Rescataste " + (6 - pollos.length) + " de 6 pollitos.");
        } else if (pollos.length === 0) {
            terminar("🎉 ¡Rescataste a los 6 pollitos en " + Math.round(tiempo) + " segundos!");
        }
    }

    if (nivel === 3) {
        tiempo -= segundos;
        var enGranero = 0;
        var fila = 0;

        for (var v = 0; v < vacas.length; v++) {
            var vaca = vacas[v];
            if (vaca.enGranero) {
                enGranero++;
                continue;
            }
            if (!vaca.sigue && seTocan(caja(cerdo), caja(vaca))) {
                vaca.sigue = true;
            }
            if (vaca.sigue) {
                // Las vacas que siguen al cerdo hacen una fila detrás de él
                fila++;
                var destinoX = cerdo.x - 45 * fila;
                var destinoY = cerdo.y - 10;
                var dx = destinoX - vaca.x;
                var dy = destinoY - vaca.y;
                if (Math.sqrt(dx * dx + dy * dy) > 30) {
                    irHacia(vaca, destinoX, destinoY, 150, segundos);
                }
                mantenerDentro(vaca);
            }
            var c = centro(vaca);
            if (c.x > granero.x && c.y > granero.y) {
                vaca.enGranero = true;
                vaca.sigue = false;
                // Se acomoda dentro del granero
                vaca.x = granero.x + 5 + (enGranero % 2) * 30;
                vaca.y = granero.y + 10 + Math.floor(enGranero / 2) * 30;
                enGranero++;
            }
        }
        textoEstado.textContent = "🐄 Vacas en el granero: " + enGranero + " de 4   ⏱️ " +
            Math.ceil(Math.max(tiempo, 0)) + " s";

        if (enGranero === vacas.length) {
            terminar("🎉 ¡Todas las vacas están en el granero! Te sobraron " +
                Math.ceil(tiempo) + " segundos.");
        } else if (tiempo <= 0) {
            terminar("⏱️ ¡Se acabó el tiempo! Guardaste " + enGranero + " de 4 vacas.");
        }
    }
}

// ---------- DIBUJO ----------
function dibujarAnimal(animal) {
    var forma = formas[animal.tipo];
    var imagen = imagenes[animal.tipo];
    if (forma.recorte) {
        var r = forma.recorte;
        papel.drawImage(imagen, r.x, r.y, r.ancho, r.alto, animal.x, animal.y, forma.ancho, forma.alto);
    } else {
        papel.drawImage(imagen, animal.x, animal.y, forma.ancho, forma.alto);
    }
}

function dibujar() {
    papel.drawImage(imagenes.fondo, 0, 0);

    if (nivel === 3) {
        // Marca el granero con un borde amarillo para que se vea dónde llevar las vacas
        papel.lineWidth = 4;
        papel.strokeStyle = "#ffd400";
        papel.setLineDash([10, 6]);
        papel.strokeRect(granero.x, granero.y, granero.ancho - 3, granero.alto - 3);
        papel.setLineDash([]);
        for (var v = 0; v < vacas.length; v++) {
            dibujarAnimal(vacas[v]);
        }
    }
    for (var p = 0; p < pollos.length; p++) {
        dibujarAnimal(pollos[p]);
    }
    dibujarAnimal(cerdo);
    if (lobo) {
        dibujarAnimal(lobo);
    }
}

function mensajeGrande(lineas) {
    var altoLinea = 36;
    var alto = lineas.length * altoLinea + 40;
    var arriba = (vp.height - alto) / 2;
    papel.fillStyle = "rgba(0, 0, 0, 0.8)";
    papel.fillRect(0, arriba, vp.width, alto);
    papel.fillStyle = "#fff";
    papel.textAlign = "center";
    papel.font = "bold 24px Arial";
    for (var i = 0; i < lineas.length; i++) {
        papel.fillText(lineas[i], vp.width / 2, arriba + 45 + i * altoLinea);
    }
}

function terminar(mensaje) {
    jugando = false;
    dibujar();
    textoEstado.textContent = mensaje;
    var siguiente = nivel < 3 ? "Elige otro nivel arriba o repite este." : "¡Terminaste los tres niveles!";
    mensajeGrande(partirTexto(mensaje, 34).concat(["", siguiente]));
}

// Parte un texto largo en varias líneas para que quepa en el lienzo
function partirTexto(texto, maximo) {
    var palabras = texto.split(" ");
    var lineas = [];
    var actual = "";
    for (var i = 0; i < palabras.length; i++) {
        if ((actual + " " + palabras[i]).trim().length > maximo) {
            lineas.push(actual.trim());
            actual = palabras[i];
        } else {
            actual = actual + " " + palabras[i];
        }
    }
    lineas.push(actual.trim());
    return lineas;
}

function dibujarPortada() {
    papel.drawImage(imagenes.fondo, 0, 0);
    dibujarAnimal(crearAnimal("cerdo", 150, 90));
    dibujarAnimal(crearAnimal("lobo", 260, 100));
    mensajeGrande(["¡Bienvenidos a Villa Platzi!", "", "Elige un nivel arriba para jugar."]);
}
