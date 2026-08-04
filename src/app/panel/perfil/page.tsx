import Link from "next/link";
import { redirect } from "next/navigation";
import { FormularioPerfil } from "@/components/formulario-perfil";
import { currentSession } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editar mi bar" };

export default async function PaginaPerfil() {
  const sesion = await currentSession();
  if (!sesion) redirect("/panel/entrar");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/panel" className="text-sm text-slate-400 hover:text-cesped">
        ‹ Volver al panel
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Datos de {sesion.bar.name}</h1>
      <div className="tarjeta p-6">
        <FormularioPerfil bar={sesion.bar} />
      </div>
    </div>
  );
}
