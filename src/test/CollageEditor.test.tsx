import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CollageEditor } from "@/components/CollageEditor";
import { FORMATOS_COLLAGE, MENSAJE_COLLAGE } from "@/lib/collage";
import { conCatalogo } from "@/lib/store";

const crearCollages = vi.hoisted(() => vi.fn());
vi.mock("@/lib/collage-render", () => ({ crearCollages }));
vi.mock("@/lib/store", async (original) => {
  const mod = await original<typeof import("@/lib/store")>();
  return { ...mod, useStore: () => ({ productos: conCatalogo([]) }) };
});
beforeEach(() => {
  vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:collage"), revokeObjectURL: vi.fn() });
  crearCollages.mockReset();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Crear un collage", () => {
  it("comienza sin precios, con A pedido y exige al menos un perfume", () => {
    render(<CollageEditor />);
    expect(screen.getByLabelText(/Mostrar precios/)).not.toBeChecked();
    expect(screen.getByLabelText(/Incluir los frascos/)).toBeChecked();
    expect(screen.getByLabelText("Mensaje")).toHaveValue(MENSAJE_COLLAGE);
    expect(screen.getByRole("button", { name: "Crear mis dos imágenes" })).toBeDisabled();
  });
  it("limita a seis y permite quitar uno para elegir otro", () => {
    render(<CollageEditor />);
    for (const b of screen.getAllByRole("button", { name: /^Elegir/ }).slice(0, 6))
      fireEvent.click(b);
    expect(screen.getByText("6 de 6")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /^Elegir/ }).every((b) => b.hasAttribute("disabled")),
    ).toBe(true);
    fireEvent.click(screen.getAllByRole("button", { name: /de la selección$/ })[0]!);
    expect(screen.getByText("5 de 6")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Elegir/ })[0]!).toBeEnabled();
  });
  it("genera ambos formatos, cambia la descarga y retira resultados si se edita", async () => {
    crearCollages.mockResolvedValue(
      FORMATOS_COLLAGE.map((formato) => ({
        formato,
        archivo: new File(["jpg"], `${formato.id}.jpg`, { type: "image/jpeg" }),
      })),
    );
    const { unmount } = render(<CollageEditor />);
    fireEvent.click(screen.getAllByRole("button", { name: /^Elegir/ })[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Crear mis dos imágenes" }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Guardar imagen" })).toHaveAttribute(
        "download",
        "cuadrado.jpg",
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Estado vertical" }));
    expect(screen.getByRole("link", { name: "Guardar imagen" })).toHaveAttribute(
      "download",
      "vertical.jpg",
    );
    fireEvent.change(screen.getByLabelText("Mensaje"), { target: { value: "Nueva selección" } });
    expect(screen.queryByRole("link", { name: "Guardar imagen" })).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    unmount();
  });
  it("muestra un error recuperable si una imagen no carga", async () => {
    crearCollages.mockRejectedValue(new Error("Revisa tu conexión e intenta de nuevo."));
    render(<CollageEditor />);
    fireEvent.click(screen.getAllByRole("button", { name: /^Elegir/ })[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Crear mis dos imágenes" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Revisa tu conexión");
    expect(screen.getByRole("button", { name: "Crear mis dos imágenes" })).toBeEnabled();
  });
});
