import { AdminQuestionManager } from "@/components/admin-question-manager";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const value = Array.isArray(params.new) ? params.new[0] : params.new;
  return <AdminQuestionManager initialNew={value === "1"} />;
}
