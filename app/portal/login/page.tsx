import LoginForm from "@/components/portal/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <div className="w-full max-w-[400px] px-6">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-light text-white">Ownera Capital</h1>
          <p className="mt-2 text-[15px] text-[#86868B]">
            Sign in to access the portal
          </p>
        </div>
        <LoginForm message={message} />
      </div>
    </div>
  );
}
