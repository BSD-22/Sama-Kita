import * as React from "react";
import axios from "axios";
import { Bot, CircleUser, LayoutDashboard, PersonStanding, SquareActivity } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";

type Property = {
  id: number;
  propertyName: string;
};
// This is sample data.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    user: {
      name: `${localStorage.name}`,
      email: `${localStorage.email}`,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "SamaKita",
        logo: PersonStanding,
        plan: "Enterprise",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
        isActive: true,
        items: [
          {
            title: "Graphic Performance",
            url: "/graph",
          },
          {
            title: "Download Records",
            url: "#",
          },
        ],
      },
      {
        title: "Properties",
        url: "/property",
        icon: Bot,
        items: [],
      },
      {
        title: "Expenses",
        url: "/expenses",
        icon: SquareActivity,
        items: [
          {
            title: "Maintenance & Non Operational",
            url: "/expenses/maintenance",
          },
          {
            title: "Advertisements",
            url: "/expenses/advertisements",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Customer Service",
        url: "https://wa.me/+62082249013283?text=<message>",
        icon: CircleUser,
      },
    ],
  };
  const [, setProperties] = React.useState([]);
  const [navMain, setNavMain] = React.useState(data.navMain);

  async function getProperties() {
    try {
      const { data: fetchedProperties } = await axios.get("http://localhost:8080/properties", {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setProperties(fetchedProperties);

      const updatedNavMain = data.navMain.map((item) => {
        if (item.title === "Properties") {
          return {
            ...item,
            items: [
              ...fetchedProperties.map((property: Property) => ({
                title: property.propertyName,
                url: `/property/${property.id}`,
              })),
            ],
          };
        }
        return item;
      });

      setNavMain(updatedNavMain);
    } catch (error) {
      console.log(error);
    }
  }

  React.useEffect(() => {
    getProperties();
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
