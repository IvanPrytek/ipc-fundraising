import Link from "next/link";

export default function TokenInvalid() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <div className="max-w-md px-6 text-center">
        <div className="mb-4 text-[48px] font-extralight text-white">
          Access Denied
        </div>
        <p className="mb-8 text-[17px] leading-relaxed text-[#86868B]">
          You don't have access to this page, or your session has expired.
          Please sign in to continue.
        </p>
        <Link
          href="/portal/login"
          className="inline-block rounded-lg bg-champagne px-6 py-3 text-[14px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
