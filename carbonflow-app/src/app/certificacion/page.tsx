"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(`/validacion-registro${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return <div className="p-8 text-center text-on-surface-variant">Redirigiendo a Validación y Registro…</div>;
}

export default function CertificacionRedirectPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Redirigiendo…</div>}>
      <RedirectInner />
    </Suspense>
  );
}
