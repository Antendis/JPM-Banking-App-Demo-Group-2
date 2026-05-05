import { CATEGORY_MAP } from "@/lib/mock-data";

interface Props {
  description: string;
  category: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "w-9 h-9 text-[11px]",
  md: "w-11 h-11 text-sm",
  lg: "w-14 h-14 text-base",
};

export default function MerchantAvatar({ description, category, size = "md" }: Props) {
  const cat = CATEGORY_MAP[category] ?? { avatar: "bg-gray-400", label: "", pill: "", chart: "#9ca3af", soft: "bg-gray-100" };
  const initials = description.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className={`${SIZE_MAP[size]} rounded-full ${cat.avatar} flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm`}>
      <span className="text-white font-bold tracking-tight">{initials}</span>
    </div>
  );
}
