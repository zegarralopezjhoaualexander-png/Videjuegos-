package com.proyecto.backend.config;

import com.proyecto.backend.model.Videojuego;
import com.proyecto.backend.repository.VideojuegoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

// Completa la ficha de cada juego. Los requisitos de PC son aproximados.
@Component
public class DatosDemo implements CommandLineRunner {

    private record Ficha(String desarrollador, String fecha, String sinopsis,
                         String minimos, String recomendados, String trailer) {}

    private static final String DEMO = "Estudio de ejemplo";

    private static final String SWITCH_MIN = "Plataforma: Nintendo Switch\nRequisitos de PC: no aplica";
    private static final String PS5_MIN = "Plataforma: PlayStation 5\nRequisitos de PC: no aplica";
    private static final String XBOX_MIN = "Plataforma: Xbox Series X\nRequisitos de PC: no aplica";
    private static final String CONSOLA_REC = "Se recomienda conexión a internet para actualizaciones y funciones en línea";

    private static final List<String> PLATAFORMAS_DEMO = List.of(
            "PC", "PlayStation", "Xbox", "Nintendo");

    private static Ficha f(String dev, String fecha, String sinopsis, String min, String rec, String trailer) {
        return new Ficha(dev, fecha, sinopsis, min, rec, trailer);
    }

    // Identificador de cada juego en Steam, para usar sus imágenes oficiales.
    private static final Map<String, Integer> STEAM = Map.ofEntries(
            Map.entry("Elden Ring", 1245620),
            Map.entry("God of War Ragnarök", 2322010),
            Map.entry("Marvel's Spider-Man 2", 2651280),
            Map.entry("Resident Evil 4", 2050650),
            Map.entry("Street Fighter 6", 1364780),
            Map.entry("Mortal Kombat 1", 1971870),
            Map.entry("EA Sports FC 24", 2195250),
            Map.entry("NBA 2K24", 2338770),
            Map.entry("Forza Horizon 5", 1551360),
            Map.entry("Halo Infinite", 1240440),
            Map.entry("Call of Duty: Modern Warfare III", 2519060),
            Map.entry("The Witcher 3: Wild Hunt", 292030),
            Map.entry("Cyberpunk 2077", 1091500),
            Map.entry("Baldur's Gate 3", 1086940),
            Map.entry("Red Dead Redemption 2", 1174180),
            Map.entry("Grand Theft Auto V", 271590),
            Map.entry("Hades", 1145360),
            Map.entry("Hollow Knight", 367520),
            Map.entry("Celeste", 504230),
            Map.entry("Stardew Valley", 413150),
            Map.entry("The Sims 4", 1222670),
            Map.entry("Portal 2", 620),
            Map.entry("Civilization VI", 289070),
            Map.entry("Age of Empires IV", 1466860),
            Map.entry("DOOM Eternal", 782330),
            Map.entry("Silent Hill 2", 2124490)
    );

    private static final Map<String, Ficha> FICHAS = Map.ofEntries(
            Map.entry("The Legend of Zelda", f("Nintendo", "1986-02-21",
                    "Link recorre el reino de Hyrule para rescatar a la princesa Zelda y derrotar a Ganon, en el juego que dio origen a una de las sagas de aventura más influyentes.",
                    null, null, null)),
            Map.entry("Minecraft", f("Mojang Studios", "2011-11-18",
                    "Mundo de bloques generado al azar donde puedes explorar, extraer recursos, construir y sobrevivir, solo o con amigos.",
                    null, null, null)),
            Map.entry("FIFA", f("EA Sports", "1993-07-15",
                    "Saga de fútbol con licencias oficiales de clubes, ligas y selecciones, con partidos, modos de carrera y competencia en línea.",
                    null, null, null)),
            Map.entry("Fortnite", f("Epic Games", "2017-07-25",
                    "Juego en línea donde 100 jugadores compiten en una isla hasta que solo queda uno, con construcción de estructuras y eventos que cambian el mapa.",
                    null, null, null)),
            Map.entry("Mario Kart", f("Nintendo", "1992-08-27",
                    "Saga de carreras de karts con personajes de Mario, circuitos coloridos y objetos para sabotear a los rivales.",
                    null, null, null)),
            Map.entry("The Legend of Zelda: Breath of the Wild", f("Nintendo EPD", "2017-03-03",
                    "Link despierta tras un siglo de sueño en un enorme mundo abierto donde puedes escalar, cocinar y resolver santuarios para derrotar a Ganon.",
                    SWITCH_MIN, CONSOLA_REC, "https://www.youtube.com/watch?v=zw47_q9wbBE")),
            Map.entry("Super Mario Odyssey", f("Nintendo EPD", "2017-10-27",
                    "Mario viaja por reinos de todo el mundo con su gorra Cappy para rescatar a la princesa Peach de la boda forzada de Bowser.",
                    SWITCH_MIN, CONSOLA_REC, null)),
            Map.entry("Mario Kart 8 Deluxe", f("Nintendo EPD", "2017-04-28",
                    "Versión definitiva de Mario Kart 8 con todos los circuitos y personajes, carreras antigravedad y hasta 4 jugadores en pantalla dividida.",
                    SWITCH_MIN, CONSOLA_REC, null)),
            Map.entry("Animal Crossing: New Horizons", f("Nintendo EPD", "2020-03-20",
                    "Llegas a una isla desierta para construir tu hogar, decorar, pescar y crear una comunidad con vecinos animales.",
                    SWITCH_MIN, CONSOLA_REC, null)),
            Map.entry("Elden Ring", f("FromSoftware", "2022-02-25",
                    "RPG de acción en un mundo abierto creado junto a George R. R. Martin, donde recorres las Tierras Intermedias para restaurar el Círculo de Elden.",
                    PS5_MIN, CONSOLA_REC, null)),
            Map.entry("God of War Ragnarök", f("Santa Monica Studio", "2022-11-09",
                    "Kratos y Atreus viajan por los nueve reinos nórdicos mientras se acerca el Ragnarök, el fin del mundo profetizado.",
                    PS5_MIN, CONSOLA_REC, null)),
            Map.entry("Marvel's Spider-Man 2", f("Insomniac Games", "2023-10-20",
                    "Peter Parker y Miles Morales protegen Nueva York de Kraven y Venom, con balanceo por la ciudad y trajes simbiontes.",
                    PS5_MIN, CONSOLA_REC, null)),
            Map.entry("Resident Evil 4", f("Capcom", "2023-03-24",
                    "Remake del clásico de terror: Leon S. Kennedy rescata a la hija del presidente en una aldea europea plagada de infectados.",
                    PS5_MIN, CONSOLA_REC, null)),
            Map.entry("Street Fighter 6", f("Capcom", "2023-06-02",
                    "Juego de lucha con un modo historia en mundo abierto, el sistema de control moderno y combates en línea con 18 luchadores iniciales.",
                    PS5_MIN, CONSOLA_REC, null)),
            Map.entry("Mortal Kombat 1", f("NetherRealm Studios", "2023-09-19",
                    "Reinicio de la saga: el dios del fuego Liu Kang crea una nueva línea temporal, con luchadores, fatalities y el sistema Kameo.",
                    PS5_MIN, CONSOLA_REC, null)),
            Map.entry("EA Sports FC 24", f("EA Vancouver y EA Romania", "2023-09-29",
                    "Primer juego de fútbol de EA bajo la marca FC, con más de 19.000 jugadores con licencia y el motor HyperMotionV.",
                    PS5_MIN, CONSOLA_REC, null)),
            Map.entry("NBA 2K24", f("Visual Concepts", "2023-09-08",
                    "Simulador de baloncesto con los modos MyCAREER, MyTEAM y The City, con Kobe Bryant en una de sus portadas.",
                    PS5_MIN, CONSOLA_REC, null)),
            Map.entry("Forza Horizon 5", f("Playground Games", "2021-11-09",
                    "Carreras en mundo abierto ambientadas en México, con cientos de autos, eventos estacionales y modo en línea.",
                    XBOX_MIN, CONSOLA_REC, null)),
            Map.entry("Halo Infinite", f("343 Industries", "2021-12-08",
                    "El Jefe Maestro enfrenta a los Desterrados en el anillo Zeta Halo, con campaña de mundo abierto y multijugador gratuito.",
                    XBOX_MIN, CONSOLA_REC, null)),
            Map.entry("Call of Duty: Modern Warfare III", f("Sledgehammer Games", "2023-11-10",
                    "Entrega de la saga bélica con campaña, multijugador y el modo Zombis en mundo abierto, protagonizada por la Fuerza de Tarea 141.",
                    PS5_MIN, CONSOLA_REC, null)),
            Map.entry("The Witcher 3: Wild Hunt", f("CD Projekt Red", "2015-05-19",
                    "Geralt de Rivia busca a su hija adoptiva Ciri mientras la Cacería Salvaje amenaza al mundo, en un RPG de mundo abierto.",
                    "SO: Windows 7/8/10 de 64 bits\nProcesador: Intel Core i5-2500K 3.3 GHz\nMemoria: 6 GB RAM\nGráficos: NVIDIA GTX 660\nAlmacenamiento: 35 GB",
                    "Procesador: Intel Core i7-3770 3.4 GHz\nMemoria: 8 GB RAM\nGráficos: NVIDIA GTX 770\nAlmacenamiento: 35 GB",
                    null)),
            Map.entry("Cyberpunk 2077", f("CD Projekt Red", "2020-12-10",
                    "RPG de acción en Night City donde V, un mercenario, busca un implante único que promete la inmortalidad.",
                    "SO: Windows 10 de 64 bits\nProcesador: Intel Core i7-6700 o AMD Ryzen 5 1600\nMemoria: 12 GB RAM\nGráficos: NVIDIA GTX 1060 6 GB\nAlmacenamiento: 70 GB SSD",
                    "Procesador: Intel Core i7-12700 o AMD Ryzen 7 7800X3D\nMemoria: 16 GB RAM\nGráficos: NVIDIA RTX 2060 Super\nAlmacenamiento: 70 GB SSD",
                    null)),
            Map.entry("Baldur's Gate 3", f("Larian Studios", "2023-08-03",
                    "RPG por turnos basado en Dungeons & Dragons: un parásito mental te infecta y debes decidir en quién confiar, solo o en cooperativo.",
                    "SO: Windows 10 de 64 bits\nProcesador: Intel Core i5-4690 o AMD Ryzen 5 1500X\nMemoria: 8 GB RAM\nGráficos: NVIDIA GTX 970 o AMD RX 480 4 GB\nAlmacenamiento: 150 GB",
                    "Procesador: Intel Core i7-8700K o AMD Ryzen 5 3600\nMemoria: 16 GB RAM\nGráficos: NVIDIA RTX 2060 Super\nAlmacenamiento: 150 GB SSD",
                    null)),
            Map.entry("Red Dead Redemption 2", f("Rockstar Games", "2018-10-26",
                    "Arthur Morgan y la banda de Van der Linde huyen por un Oeste americano en decadencia, en una aventura de mundo abierto.",
                    "SO: Windows 10 de 64 bits\nProcesador: Intel Core i5-2500K o AMD FX-6300\nMemoria: 8 GB RAM\nGráficos: NVIDIA GTX 770 2 GB\nAlmacenamiento: 150 GB",
                    "Procesador: Intel Core i7-4770K o AMD Ryzen 5 1500X\nMemoria: 12 GB RAM\nGráficos: NVIDIA GTX 1060 6 GB\nAlmacenamiento: 150 GB",
                    null)),
            Map.entry("Grand Theft Auto V", f("Rockstar North", "2013-09-17",
                    "Tres criminales muy distintos planean golpes en Los Santos, en un mundo abierto con modo historia y GTA Online.",
                    "SO: Windows 7 de 64 bits\nProcesador: Intel Core 2 Quad Q6600\nMemoria: 4 GB RAM\nGráficos: NVIDIA 9800 GT 1 GB\nAlmacenamiento: 72 GB",
                    "Procesador: Intel Core i5-3470\nMemoria: 8 GB RAM\nGráficos: NVIDIA GTX 660 2 GB\nAlmacenamiento: 72 GB",
                    null)),
            Map.entry("Hades", f("Supergiant Games", "2020-09-17",
                    "Roguelike de acción en el que Zagreus, hijo de Hades, intenta escapar del Inframundo griego una y otra vez.",
                    "SO: Windows 7 SP1\nProcesador: Dual Core 2.4 GHz\nMemoria: 4 GB RAM\nGráficos: 1 GB de VRAM compatible con DirectX 10\nAlmacenamiento: 15 GB",
                    "Procesador: Quad Core 3.0 GHz\nMemoria: 8 GB RAM\nGráficos: GTX 650 o equivalente\nAlmacenamiento: 15 GB",
                    null)),
            Map.entry("Hollow Knight", f("Team Cherry", "2017-02-24",
                    "Metroidvania dibujado a mano donde un pequeño caballero explora el reino subterráneo de Hallownest.",
                    "SO: Windows 7\nProcesador: Intel Core 2 Duo E5200\nMemoria: 4 GB RAM\nGráficos: GeForce 9800GTX+ 1 GB\nAlmacenamiento: 9 GB",
                    "Procesador: Intel Core i5\nMemoria: 8 GB RAM\nGráficos: GeForce GTX 560\nAlmacenamiento: 9 GB",
                    null)),
            Map.entry("Celeste", f("Maddy Makes Games", "2018-01-25",
                    "Madeline escala la montaña Celeste en un juego de plataformas precisas que habla de ansiedad y superación.",
                    SWITCH_MIN, CONSOLA_REC, null)),
            Map.entry("Stardew Valley", f("ConcernedApe", "2016-02-26",
                    "Heredas una granja abandonada y la haces prosperar: cultiva, pesca, explora minas y crea lazos con el pueblo.",
                    "SO: Windows Vista o superior\nProcesador: 2 GHz\nMemoria: 2 GB RAM\nGráficos: 256 MB de VRAM\nAlmacenamiento: 500 MB",
                    "Procesador: Dual Core 2.5 GHz\nMemoria: 4 GB RAM\nGráficos: 512 MB de VRAM\nAlmacenamiento: 500 MB",
                    null)),
            Map.entry("The Sims 4", f("Maxis", "2014-09-02",
                    "Simulador de vida en el que creas personas, construyes casas y diriges sus historias, con muchas expansiones.",
                    "SO: Windows 10 de 64 bits\nProcesador: Intel Core 2 Duo 1.8 GHz o AMD Athlon 64 X2 4000+\nMemoria: 4 GB RAM\nGráficos: 128 MB de VRAM\nAlmacenamiento: 26 GB",
                    "Procesador: Intel Core i5 o AMD Ryzen 3\nMemoria: 8 GB RAM\nGráficos: NVIDIA GTX 650\nAlmacenamiento: 26 GB",
                    null)),
            Map.entry("Portal 2", f("Valve", "2011-04-19",
                    "Puzles en primera persona con portales y gel de propulsión, con cooperativo y la voz de la IA GLaDOS.",
                    "SO: Windows 7\nProcesador: Pentium 4 3.0 GHz o Core 2 Duo 2.0 GHz\nMemoria: 2 GB RAM\nGráficos: compatible con DirectX 9\nAlmacenamiento: 8 GB",
                    "Procesador: Intel Core 2 Duo\nMemoria: 4 GB RAM\nGráficos: NVIDIA GeForce 8800\nAlmacenamiento: 8 GB",
                    null)),
            Map.entry("Civilization VI", f("Firaxis Games", "2016-10-21",
                    "Estrategia por turnos en la que guías una civilización desde la antigüedad hasta la era de la información.",
                    "SO: Windows 7 de 64 bits\nProcesador: Intel Core i3 2.5 GHz o AMD Ryzen 3 1200\nMemoria: 4 GB RAM\nGráficos: NVIDIA GTX 650 2 GB\nAlmacenamiento: 12 GB",
                    "Procesador: Intel Core i5 2.5 GHz o AMD Ryzen 5 1400\nMemoria: 8 GB RAM\nGráficos: NVIDIA GTX 770 2 GB\nAlmacenamiento: 12 GB",
                    null)),
            Map.entry("Age of Empires IV", f("Relic Entertainment", "2021-10-28",
                    "Estrategia en tiempo real que recorre mil años de historia con ocho civilizaciones y campañas con vídeos documentales.",
                    "SO: Windows 10 de 64 bits\nProcesador: Intel Core i5-6300U o AMD Ryzen 5 2400G\nMemoria: 8 GB RAM\nGráficos: Intel HD 520 o Radeon RX Vega 11\nAlmacenamiento: 50 GB",
                    "Procesador: Intel Core i5-6300 o AMD Ryzen 5 1600\nMemoria: 16 GB RAM\nGráficos: NVIDIA GTX 970 o AMD RX 570 4 GB\nAlmacenamiento: 50 GB SSD",
                    null)),
            Map.entry("DOOM Eternal", f("id Software", "2020-03-20",
                    "El Doom Slayer lucha contra las fuerzas del infierno en combates rápidos y violentos que premian la agresividad.",
                    "SO: Windows 7 de 64 bits\nProcesador: Intel Core i5 3.3 GHz o AMD Ryzen 3\nMemoria: 8 GB RAM\nGráficos: NVIDIA GTX 1050 Ti 4 GB\nAlmacenamiento: 80 GB",
                    "Procesador: Intel Core i7-6700K o AMD Ryzen 7 1800X\nMemoria: 8 GB RAM\nGráficos: NVIDIA GTX 1060 6 GB\nAlmacenamiento: 80 GB SSD",
                    null)),
            Map.entry("Silent Hill 2", f("Bloober Team", "2024-10-08",
                    "Remake del clásico de terror psicológico: James Sunderland viaja a Silent Hill tras recibir una carta de su esposa fallecida.",
                    "SO: Windows 10 de 64 bits\nProcesador: Intel Core i5-8400 o AMD Ryzen 5 3600\nMemoria: 16 GB RAM\nGráficos: NVIDIA GTX 1060 6 GB\nAlmacenamiento: 50 GB SSD",
                    "Procesador: Intel Core i7-8700 o AMD Ryzen 5 3600X\nMemoria: 16 GB RAM\nGráficos: NVIDIA RTX 2060 o AMD RX 5700\nAlmacenamiento: 50 GB SSD",
                    null))
    );

    private final VideojuegoRepository repositorio;

    public DatosDemo(VideojuegoRepository repositorio) {
        this.repositorio = repositorio;
    }

    @Override
    public void run(String... args) {
        for (Videojuego j : repositorio.findAll()) {
            String nombre = j.getNombre() == null ? "" : j.getNombre().trim();
            Ficha f = FICHAS.get(nombre);
            if (f == null) {
                System.out.println("DatosDemo: sin ficha para '" + nombre + "'");
                continue;
            }
            boolean cambio = false;

            // Unifica los nombres de plataforma de datos anteriores.
            String plataforma = normalizarPlataforma(j.getPlataforma());
            if (!Objects.equals(plataforma, j.getPlataforma())) {
                j.setPlataforma(plataforma);
                cambio = true;
            }

            // Datos de la ficha
            if (j.getDesarrollador() == null || DEMO.equals(j.getDesarrollador())) {
                j.setDesarrollador(f.desarrollador());
                j.setFechaLanzamiento(LocalDate.parse(f.fecha()));
                String d = j.getDescripcion();
                if (d == null || d.isBlank() || d.startsWith("Sinopsis de ejemplo")
                        || d.startsWith("Descripción de ejemplo")) {
                    j.setDescripcion(f.sinopsis());
                }
                j.setRequisitosMinimos(f.minimos());
                j.setRequisitosRecomendados(f.recomendados());
                cambio = true;
            }

            // Imágenes oficiales de Steam (solo para los juegos que están en Steam)
            Integer steam = STEAM.get(nombre);
            String base = steam == null ? null
                    : "https://cdn.akamai.steamstatic.com/steam/apps/" + steam + "/";

            String img = j.getImagen();
            boolean imgRelleno = img == null || img.isBlank() || img.contains("picsum.photos")
                    || (base != null && img.startsWith("img/"));
            if (imgRelleno) {
                String nueva = base == null ? null : base + "header.jpg";
                if (!Objects.equals(nueva, img)) {
                    j.setImagen(nueva);
                    cambio = true;
                }
            }

            List<String> g = j.getGaleria();
            boolean galeriaRelleno = g == null || g.isEmpty() || g.get(0).contains("picsum.photos");
            if (galeriaRelleno) {
                List<String> nueva = new ArrayList<>();
                if (base != null) {
                    nueva.add(base + "header.jpg");
                    nueva.add(base + "library_hero.jpg");
                    nueva.add(base + "capsule_616x353.jpg");
                }
                if (g == null || !g.equals(nueva)) {
                    j.setGaleria(nueva);
                    cambio = true;
                }
            }

            // Tráiler
            String t = j.getTrailerUrl();
            boolean sinTrailer = t == null || t.isBlank() || t.contains("youtube.com/results");
            if (sinTrailer) {
                String url = f.trailer() != null ? f.trailer() : busqueda(nombre);
                if (!url.equals(t)) {
                    j.setTrailerUrl(url);
                    cambio = true;
                }
            }

            if (cambio) {
                repositorio.save(j);
            }
        }
    }

    private static String normalizarPlataforma(String plataforma) {
        if (plataforma == null || plataforma.isBlank()) {
            return plataforma;
        }

        List<String> normalizadas = new ArrayList<>();
        for (String parte : plataforma.split(",")) {
            String valor = parte.trim();
            String normalizada = PLATAFORMAS_DEMO.stream()
                    .filter((nombre) -> valor.toLowerCase().startsWith(nombre.toLowerCase()))
                    .findFirst()
                    .orElse(valor);
            normalizadas.add(normalizada);
        }

        return String.join(", ", normalizadas);
    }

    private static String busqueda(String nombre) {
        String q = URLEncoder.encode(nombre + " tráiler oficial", StandardCharsets.UTF_8);
        return "https://www.youtube.com/results?search_query=" + q;
    }
}