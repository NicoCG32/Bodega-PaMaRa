import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProductVisual } from "@/components/ProductVisual";
import { aPublico } from "@/lib/boutique";

const [eden] = aPublico([{ codigo: "M-31", nombre: "Eden", stock: 0 }]);
afterEach(cleanup);

describe("Imágenes del catálogo", () => {
  it("asocia la escena al código oficial y conserva los textos fuera de la imagen", () => {
    render(<ProductVisual item={eden!} />);
    const scene = screen.getByRole("img", { name: /referencial.*Eden de Cacharel/ });
    expect(scene).toHaveAttribute("loading", "lazy");
    expect(screen.getByText("M-31")).toBeInTheDocument();
    expect(screen.getByText("Cacharel")).toBeInTheDocument();
    expect(screen.getByText("Imagen referencial")).toBeInTheDocument();
    expect(scene.getAttribute("srcset")).not.toContain("1024w");
  });

  it("respeta la foto de Bodega y recupera la referencia si la foto deja de estar disponible", () => {
    render(<ProductVisual item={{ ...eden!, foto: "https://example.com/foto.jpg" }} />);
    const photo = screen.getByRole("img", { name: "Eden" });
    expect(photo).toHaveAttribute("src", "https://example.com/foto.jpg");
    expect(screen.queryByText("Imagen referencial")).not.toBeInTheDocument();
    fireEvent.error(photo);
    const reference = screen.getByRole("img", { name: /referencial.*Eden/ });
    fireEvent.error(reference);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Ilustración de referencia")).toBeInTheDocument();
  });

  it("reserva la versión grande para la ficha abierta", () => {
    render(<ProductVisual item={eden!} ampliada />);
    const scene = screen.getByRole("img", { name: /referencial.*Eden/ });
    expect(scene.getAttribute("srcset")).toContain("1024w");
    expect(scene).toHaveAttribute("loading", "eager");
    expect(screen.getByText("Aroma inspirado en Eden de Cacharel")).toBeInTheDocument();
  });
});
