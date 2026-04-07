import { getCompanyFromSession } from "@/lib/company-session";
import { getCompanyBySlug } from "@/lib/company-data";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

type Props = {
  params: Promise<{ company: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ params, searchParams }: Props) {
  const { company } = await params;
  const query = await searchParams;

  const isDevPreview =
    process.env.NODE_ENV === "development" && query.preview === "true";

  if (!isDevPreview) {
    const existingSession = await getCompanyFromSession();
    if (existingSession) {
      redirect("/");
    }
  }

  const config = await getCompanyBySlug(company);

  const theme = config && config.active
    ? {
        accent: config.accent || null,
        greeting: config.greeting,
        companyName: config.name,
      }
    : { accent: null, greeting: "Welcome", companyName: null };

  return (
    <LoginClient
      company={company}
      accent={theme.accent}
      greeting={theme.greeting}
      companyName={theme.companyName}
    />
  );
}
