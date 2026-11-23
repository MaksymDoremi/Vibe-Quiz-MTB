import { QuizExperience } from "@/components/quiz-experience";
import { categories } from "@/lib/types";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const value = Array.isArray(params.category) ? params.category[0] : params.category;
  const initialCategory = categories.find((category) => category === value);
  return <QuizExperience initialCategory={initialCategory} />;
}
