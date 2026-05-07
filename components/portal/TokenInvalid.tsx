import Link from "next/link";

export default function TokenInvalid() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <div className="max-w-md px-6 text-center">
        <div className="mb-4 text-[48px] font-extralight text-white">
          Link Expired
        </div>
        <p className="mb-8 text-[17px] leading-relaxed text-[#86868B]">
          This portal link is no longer active. It may have been revoked or
          expired. Please contact Ownera Capital for a new link.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-champagne px-6 py-3 text-[14px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
