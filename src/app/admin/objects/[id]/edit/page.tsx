import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ObjectForm from "@/components/admin/ObjectForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditObjectPage({ params }: PageProps) {
  const { id } = await params;
  let obj = null;
  try {
    obj = await prisma.object.findUnique({ where: { id } });
  } catch { /* БД недоступна */ }

  if (!obj) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Редактировать объект</h1>
      <ObjectForm initialData={obj} />
    </div>
  );
}
