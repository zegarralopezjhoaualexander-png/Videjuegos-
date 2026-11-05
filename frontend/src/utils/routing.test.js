import { describe, expect, it } from "vitest";
import { esRutaInterna } from "./routing.js";

describe("esRutaInterna", () => {
  it("acepta rutas internas", () => {
    const rutas = ["/", "/catalogo", "/juego/1", "/carrito?cupon=BIENVENIDO10"];

    for (const ruta of rutas) {
      expect(esRutaInterna(ruta)).toBe(true);
    }
  });

  it("rechaza rutas que apuntan a otro dominio", () => {
    expect(esRutaInterna("//x.com")).toBe(false);
    expect(esRutaInterna("//evil.example/ruta")).toBe(false);
  });

  it("rechaza rutas con barra invertida", () => {
    expect(esRutaInterna("/\\x")).toBe(false);
  });

  it("rechaza texto vacío", () => {
    expect(esRutaInterna("")).toBe(false);
  });

  it("rechaza valores que no son strings", () => {
    const valores = [null, undefined, 123, true, {}, []];

    for (const valor of valores) {
      expect(esRutaInterna(valor)).toBe(false);
    }
  });
});
