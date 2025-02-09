"use client";

import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useState } from "react";

interface NavMainProps {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items: {
      title: string;
      url: string;
    }[];
  }[];
}

export function NavMain({ items }: NavMainProps) {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleDropdown = (title: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <ScrollArea className="h-[300px] px-1">
      <div className="space-y-1 p-2">
        {items?.map((item, index) => (
          <div key={index}>
            <div className="relative flex w-full">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start font-normal hover:bg-muted",
                  "group-has-[[data-collapsible=icon]]/sidebar:w-12 group-has-[[data-collapsible=icon]]/sidebar:px-0",
                  item.isActive && "bg-muted",
                  item.items.length > 0 && !openItems[item.title] && "rounded-r-none"
                )}
                onClick={() => navigate(item.url)}>
                <div className="flex min-w-[24px] items-center justify-center">
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="ml-2 flex-1 group-has-[[data-collapsible=icon]]/sidebar:hidden">{item.title}</span>
              </Button>
              {item.items.length > 0 && (
                <Button
                  variant="ghost"
                  className={cn("absolute right-0 px-2 hover:bg-muted", "group-has-[[data-collapsible=icon]]/sidebar:hidden", item.isActive && "bg-muted")}
                  onClick={(e) => toggleDropdown(item.title, e)}>
                  <ChevronDownIcon className={cn("h-4 w-4 transition-transform duration-200", openItems[item.title] && "rotate-180")} />
                </Button>
              )}
            </div>
            {openItems[item.title] && item.items.length > 0 && (
              <div className="ml-6 mt-1 space-y-1 group-has-[[data-collapsible=icon]]/sidebar:hidden">
                {item.items.map((subItem, subIndex) => (
                  <Button
                    key={subIndex}
                    variant="ghost"
                    className="w-full justify-start font-normal hover:bg-muted"
                    onClick={() => navigate(subItem.url)}>
                    <span>{subItem.title}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
