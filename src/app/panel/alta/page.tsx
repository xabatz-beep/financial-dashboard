import Link from "next/link";
import { redirect } from "next/navigation";
import { FormularioAlta } from "@/components/formulario-alta";
import { currentSession } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dar de alta mi bar" };

export default async function PaginaAlta() {
  if (await currentSession()) redirect("/panel");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Da de alta tu bar</h1>
      <p className="text-slate-400">
        Es gratis. En cuanto termines podrás elegir los partidos de esta semana y aparecer en las
        búsquedas.
      </p>
      <div className="tarjeta p-6">
        <FormularioAlta />
      </div>
      <p className="text-sm text-slate-400">
        ¿Ya tienes cuenta?{" "}
        <Link href="/panel/entrar" className="text-cesped hover:underline">
          Entra aquí
        </Link>
        .
      </p>
    </div>
  );
}
