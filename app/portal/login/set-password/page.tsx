import SetPasswordForm from "@/components/portal/auth/SetPasswordForm";

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <div className="w-full max-w-[400px] px-6">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-light text-white">Set Your Password</h1>
          <p className="mt-2 text-[15px] text-[#86868B]">
            Choose a password to access the Ownera Capital portal.
          </p>
        </div>
        <SetPasswordForm />
      </div>
    </div>
  );
}
