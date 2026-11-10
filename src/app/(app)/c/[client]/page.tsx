import { redirect } from "next/navigation";

export default async function ClientHome({ params }: PageProps<"/c/[client]">) {
  const { client } = await params;
  redirect(`/c/${client}/brand`);
}
