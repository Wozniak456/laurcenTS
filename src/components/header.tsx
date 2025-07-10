"use client";

import { useState } from "react";
import {
  Navbar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
import { usePathname } from "next/navigation";
import {
  PoolIcon,
  BatchIcon,
  ReportIcon,
  FeedingIcon,
  PurchaseIcon,
  VendorIcon,
  CostIcon,
  StockIcon,
  SummaryIcon,
  FishingIcon,
} from "@/components/icons";

const menuCategories = [
  {
    title: "Басейни",
    items: [
      {
        label: "Керування басейнами (дні)",
        href: "/pool-managing/day",
        icon: <PoolIcon />,
      },
      {
        label: "Дії над басейнами",
        href: "/pools/actions",
        icon: <PoolIcon />,
      },
    ],
  },
  {
    title: "Риба",
    items: [
      {
        label: "Партії",
        href: "/batches/view",
        icon: <BatchIcon />,
      },
      {
        label: "Годування (дні)",
        href: "/summary-feeding-table/day",
        icon: <FeedingIcon />,
      },
    ],
  },
  {
    title: "Корми",
    items: [
      {
        label: "Реєстрація приходу",
        href: "/purchtable/view",
        icon: <PurchaseIcon />,
      },
      {
        label: "Постачальники та корми",
        href: "/vendors/view",
        icon: <VendorIcon />,
      },
      {
        label: "Склад",
        href: "/leftovers/view",
        icon: <StockIcon />,
      },
    ],
  },
  {
    title: "Звіти",
    items: [
      {
        label: "Тижневий звіт",
        href: "/summary-feeding-table/week",
        icon: <ReportIcon />,
      },
      {
        label: "Собівартість",
        href: "/accumulation/view",
        icon: <CostIcon />,
      },
      {
        label: "Загальний звіт",
        href: "/general-summary/day-selection",
        icon: <SummaryIcon />,
      },
      {
        label: "Вилов",
        href: "/fetching/view",
        icon: <FishingIcon />,
      },
      {
        label: "Звіт по витратам",
        href: "/cost-report",
        icon: <CostIcon />,
      },
    ],
  },
  {
    title: "Система",
    items: [
      {
        label: "Параметри",
        href: "/system/parameters",
        icon: <></>, // You can add a settings icon if you have one
      },
      {
        label: "Модулі",
        href: "/system/modules",
        icon: <></>,
      },
    ],
  },
];

export default function Header() {
  const pathname = usePathname();
  const today = new Date().toISOString().split("T")[0];

  return (
    <Navbar className="shadow mb-6 bg-white">
      <NavbarContent>
        <NavbarItem>
          <div className="font-bold text-xl">LaursenAC</div>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuCategories.map((category) => (
          <Dropdown key={category.title}>
            <DropdownTrigger>
              <Button variant="light" className="text-medium">
                {category.title}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label={`${category.title} menu`}
              className="w-[300px]"
              itemClasses={{
                base: "gap-4",
              }}
            >
              {category.items.map((item) => {
                const href =
                  item.href.includes("day") &&
                  !item.href.includes("general-summary")
                    ? `${item.href}/${today}`
                    : item.href;
                const isActive = pathname.startsWith(item.href);

                return (
                  <DropdownItem
                    key={item.label}
                    startContent={item.icon}
                    href={href}
                    className={isActive ? "bg-blue-50" : ""}
                  >
                    {item.label}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </Dropdown>
        ))}
      </NavbarContent>

      <NavbarContent className="sm:hidden" justify="end">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="light">Меню</Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Mobile menu"
            className="w-[300px]"
            itemClasses={{
              base: "gap-4",
            }}
          >
            {menuCategories.flatMap((category) => [
              <DropdownItem
                key={category.title}
                className="font-bold"
                isReadOnly
              >
                {category.title}
              </DropdownItem>,
              ...category.items.map((item) => {
                const href =
                  item.href.includes("day") &&
                  !item.href.includes("general-summary")
                    ? `${item.href}/${today}`
                    : item.href;
                const isActive = pathname.startsWith(item.href);

                return (
                  <DropdownItem
                    key={item.label}
                    startContent={item.icon}
                    href={href}
                    className={isActive ? "bg-blue-50" : ""}
                  >
                    {item.label}
                  </DropdownItem>
                );
              }),
            ])}
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
