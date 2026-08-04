import Link from "next/link";
import { redirect } from "next/navigation";
import { FormularioEntrar } from "@/components/formulario-entrar";
import { currentSession } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Entrar · Panel del bar" };

export default async function PaginaEntrar() {
  if (await currentSession()) redirect("/panel");

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
      <div className="tarjeta p-6">
        <FormularioEntrar />
      </div>
      <p className="text-sm text-slate-400">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/panel/alta" className="text-cesped hover:underline">
          Da de alta tu bar
        </Link>
        .
      </p>
    </div>
  );
}
