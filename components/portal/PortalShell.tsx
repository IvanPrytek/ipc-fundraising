import type { PortalType } from "@/lib/portal/types";
import PortalSidebar from "./PortalSidebar";

interface PortalShellProps {
  portalType: PortalType;
  projectId: string;
  projectName: string;
  children: React.ReactNode;
}

export default function PortalShell({
  portalType,
  projectId,
  projectName,
  children,
}: PortalShellProps) {
  return (
    <div className="min-h-screen bg-dark text-[#e5e5e5]">
      <PortalSidebar
        portalType={portalType}
        projectId={projectId}
        projectName={projectName}
      />
      <div className="md:ml-[200px]">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
