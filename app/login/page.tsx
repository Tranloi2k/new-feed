import LoginForm from "../ui/form/loginForm";

type SignInPageProps = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { registered } = await searchParams;
  return <LoginForm registered={registered === "1"} />;
}
