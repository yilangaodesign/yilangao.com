import companiesData from "@/config/companies.json";
import { getCompanyFromSession } from "@/lib/company-session";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

type CompanyConfig = {
  name: string;
  password: string;
  theme: { accent: string; greeting: string };
  caseStudyNotes: Record<string, string>;
};

const companies = companiesData as Record<string, CompanyConfig>;

type Props = {
  params: Promise<{ company: string }>;
};

export default async function LoginPage({ params }: Props) {
  const { company } = await params;

  const existingSession = await getCompanyFromSession();
  if (existingSession) {
    redirect("/");
  }

  const config = companies[company];

  const theme = config
    ? { accent: config.theme.accent, greeting: config.theme.greeting, companyName: config.name }
    : { accent: "#888888", greeting: "Welcome", companyName: null };

  return (
    <LoginClient
      company={company}
      accent={theme.accent}
      greeting={theme.greeting}
      companyName={theme.companyName}
    />
  );
}
