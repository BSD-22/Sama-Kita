import { Link, useLocation } from "react-router";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const routeMap: { [key: string]: string } = {
    property: "Properties",
    expenses: "Expenses",
    maintenance: "Maintenance",
    graph: "Graph Performance",
    add: "Add New",
    edit: "Edit",
    renters: "Renters",
  };

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 px-6 py-4">
      <Link
        to="/"
        className="flex items-center hover:text-primary">
        <Home className="w-4 h-4" />
      </Link>

      {pathnames.length > 0 && <ChevronRight className="w-4 h-4" />}

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeMap[name] || name;

        return (
          <div
            key={name}
            className="flex items-center">
            {isLast ? (
              <span className="text-gray-900 font-medium">{displayName}</span>
            ) : (
              <>
                <Link
                  to={routeTo}
                  className="hover:text-primary">
                  {displayName}
                </Link>
                <ChevronRight className="w-4 h-4 mx-1" />
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}
