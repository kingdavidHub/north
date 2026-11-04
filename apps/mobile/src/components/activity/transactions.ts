import type { ComponentProps } from "react";

import type { Lucide } from "@/icons";

type LucideName = ComponentProps<typeof Lucide>["name"];

export type Transaction = {
  id: string;
  merchant: string;
  amount: string;
  category: string;
  time: string;
  direction: "in" | "out";
  icon?: LucideName;
  initial?: string;
  pending?: boolean;
};

export type ActivityGroup = {
  id: string;
  label: string;
  total: string;
  transactions: Transaction[];
};

// Demo values until the transactions API is connected.
export const ACTIVITY_GROUPS: ActivityGroup[] = [
  {
    id: "october-2026",
    label: "OCTOBER 2026",
    total: "−₦ 126,840",
    transactions: [
      {
        id: "fresh-market",
        merchant: "Fresh Market",
        amount: "−₦ 18,400",
        category: "Groceries",
        time: "Today, 10:42 AM",
        direction: "out",
      },
      {
        id: "bolt",
        merchant: "Bolt",
        amount: "−₦ 4,200",
        category: "Transport",
        time: "Today, 8:18 AM",
        direction: "out",
      },
      {
        id: "netflix",
        merchant: "Netflix",
        amount: "−₦ 6,500",
        category: "Subscriptions",
        time: "Oct 15",
        direction: "out",
      },
      {
        id: "salary-payment",
        merchant: "Salary payment",
        amount: "+₦ 850,000",
        category: "Income",
        time: "Oct 14",
        direction: "in",
        icon: "arrow-up-right",
      },
    ],
  },
  {
    id: "september-2026",
    label: "SEPTEMBER 2026",
    total: "−₦ 318,200",
    transactions: [
      {
        id: "shopify",
        merchant: "Shopify",
        amount: "−₦ 12,000",
        category: "Software",
        time: "Sep 29",
        direction: "out",
      },
      {
        id: "transfer-from-ada",
        merchant: "Transfer from Ada",
        amount: "+₦ 35,000",
        category: "Transfer",
        time: "Sep 28",
        direction: "in",
        initial: "A",
      },
      {
        id: "food-and-co",
        merchant: "Food & Co.",
        amount: "−₦ 8,900",
        category: "Dining",
        time: "Sep 26",
        direction: "out",
      },
    ],
  },
];
