import LoginForm from "./login-form";

function safeNextPath(next: string | string[] | undefined) {
  const value = Array.isArray(next) ? next[0] : next;
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/products";
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  return <LoginForm nextPath={safeNextPath(params.next)} />;
}
