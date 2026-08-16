"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { generateAndSavePdd, type PredioPddInput } from "@/lib/expedientePdd";
import type { PddData } from "@/lib/docx/pddDocxGenerator";

type Props = {
  open: boolean;
  predio: PredioPddInput | null;
  onClose: () => void;
  onGenerated: (pdd: PddData) => void;
};

export function GenerarPddModal({ open, predio, onClose, onGenerated }: Props) {
  const [amenazas, setAmenazas] = useState("");
  const [actividades, setActividades] = useState("");
  const [comunidad, setComunidad] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!open || !predio) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    setAiError(null);
    try {
      const pdd = await generateAndSavePdd({ predio, amenazas, actividades, comunidad });
      onGenerated(pdd);
      setAmenazas("");
      setActividades("");
      setComunidad("");
      onClose();
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Error al generar el documento.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-surface rounded-lg border border-outline-variant max-w-2xl w-full max-h-[90vh] flex flex-col ambient-shadow animate-fade-in text-on-surface">
        <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low rounded-t-lg">
          <div className="flex items-center gap-2">
            <MaterialIcon name="auto_awesome" className="text-primary text-xl" />
            <h3 className="text-headline-sm font-heading font-bold text-on-surface">
              Generar Documento de Diseño (PDD) con IA
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-highest transition-colors cursor-pointer"
            disabled={generating}
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          <p className="text-body-md text-on-surface-variant">
            Aporta información básica sobre el predio. La IA estructurará el PDD completo bajo estándares
            internacionales de carbono, incluyendo análisis de actores, modelo financiero (VAN/TIR), cronograma y
            matriz de KPIs. El resultado se guarda en el expediente de este proyecto.
          </p>
          <p className="text-body-sm text-on-surface">
            Predio: <strong>{predio.nombre}</strong>
          </p>

          <div>
            <label className="block text-body-sm font-medium text-on-surface mb-1">
              1. Amenazas de deforestación / degradación territorial
            </label>
            <textarea
              value={amenazas}
              onChange={(e) => setAmenazas(e.target.value)}
              placeholder="Ej: Presión por tala ilegal de madera fina, expansión de la ganadería extensiva y riesgo de quemas estacionales."
              rows={3}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface"
              disabled={generating}
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-on-surface mb-1">
              2. Actividades propuestas de conservación y restauración
            </label>
            <textarea
              value={actividades}
              onChange={(e) => setActividades(e.target.value)}
              placeholder="Ej: Reforestación activa con plántulas nativas (Abarco, Choibá), enriquecimiento de rastrojos y vigilancia satelital con guardabosques."
              rows={3}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface"
              disabled={generating}
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-on-surface mb-1">
              3. Relación comunitaria, empleo verde y acuerdos
            </label>
            <textarea
              value={comunidad}
              onChange={(e) => setComunidad(e.target.value)}
              placeholder="Ej: Vinculación laboral de 40 familias locales, distribución directa del 50% de ingresos de carbono y talleres de capacitación ambiental."
              rows={3}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface"
              disabled={generating}
            />
          </div>

          {aiError && (
            <div className="p-3 bg-error-container/20 border border-error/30 text-error text-body-sm rounded-lg flex items-start gap-2">
              <MaterialIcon name="error" className="text-[18px] shrink-0 mt-0.5" />
              <span>{aiError}</span>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-outline-variant bg-surface-container-low rounded-b-lg flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-medium border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer"
            disabled={generating}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !amenazas.trim() || !actividades.trim()}
            className="px-5 py-2.5 rounded-lg font-medium bg-primary-container text-on-primary hover:bg-primary transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                Generando PDD...
              </>
            ) : (
              <>
                <MaterialIcon name="auto_awesome" className="text-[18px]" />
                Generar PDD con IA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
