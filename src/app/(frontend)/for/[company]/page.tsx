import { getCompanyFromSession } from "@/lib/company-session";
import { getCompanyBySlug } from "@/lib/company-data";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

type Props = {
  params: Promise<{ company: string }>;
};

export default async function LoginPage({ params }: Props) {
  const { company } = await params;

  const existingSession = await getCompanyFromSession();
  if (existingSession) {
    redirect("/");
  }

  const config = await getCompanyBySlug(company);

  const theme = config && config.active
    ? { accent: config.accent, greeting: config.greeting, companyName: config.name }
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
