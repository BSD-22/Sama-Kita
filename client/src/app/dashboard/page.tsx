import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router";
import React from "react";

export default function Page({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Split the pathname into parts and filter out empty segments
  const pathParts = location.pathname.split("/").filter(Boolean);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {/* Home breadcrumb */}
                <BreadcrumbItem>
                  <Link
                    to="/"
                    className="text-black">
                    Home
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                {/* Dynamically render other breadcrumbs based on path */}
                {pathParts.map((part: string, index: number) => {
                  // Construct the breadcrumb path
                  const breadcrumbPath = `/${pathParts.slice(0, index + 1).join("/")}`;

                  // Handle special cases for routes like "property" or dynamic ids
                  let displayText = part.charAt(0).toUpperCase() + part.slice(1);

                  // Check for property route and prevent linking
                  if (part === "property") {
                    displayText = "Property"; // Just display "Property" as a label
                    return (
                      <React.Fragment key={index}>
                        <BreadcrumbItem>
                          <span className="text-black">{displayText}</span>
                        </BreadcrumbItem>
                        {index < pathParts.length - 1 && <BreadcrumbSeparator />}
                      </React.Fragment>
                    );
                  }

                  // Check for dynamic IDs like ":id" and prevent linking
                  if (part.match(/^\d+$/)) {
                    displayText = part; // Just display the ID as label
                    return (
                      <React.Fragment key={index}>
                        <BreadcrumbItem>
                          <span className="text-black">{displayText}</span>
                        </BreadcrumbItem>
                        {index < pathParts.length - 1 && <BreadcrumbSeparator />}
                      </React.Fragment>
                    );
                  }

                  return (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        <Link
                          to={breadcrumbPath}
                          className="text-black">
                          {displayText}
                        </Link>
                      </BreadcrumbItem>
                      {index < pathParts.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
