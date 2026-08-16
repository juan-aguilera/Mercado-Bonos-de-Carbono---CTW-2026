"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * El MVP del hackathon no tiene pantalla de login (fuera de alcance, ver PRD).
 * Sin una sesion, RLS bloquea cualquier insert/select de predios/expedientes
 * y el usuario nunca ve "Continuar a formulacion". Este componente crea una
 * sesion anonima de Supabase en el primer render para que cada visitante
 * tenga un owner_id estable, sin bloquear el resto de la app si Supabase
 * no esta configurado o el anonimo esta deshabilitado en el proyecto.
 */
export function AuthBootstrap() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        supabase.auth.signInAnonymously().catch(() => {
          // Si el inicio de sesion anonimo no esta habilitado en el proyecto
          // de Supabase, la app sigue funcionando sin persistencia.
        });
      }
    });
  }, []);

  return null;
}
