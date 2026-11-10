import Image from "next/image";
import { APP_NAME } from "@/config/app";

export function BrandMark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const height = size === "lg" ? 40 : 22;
  return (
    <span className="flex items-center gap-2.5">
      <Image
        src="/brand/5k-logo-gradient-mark.png"
        alt="5K"
        width={Math.round((height * 129) / 84)}
        height={height}
        priority
      />
      <span
        className={
          size === "lg"
            ? "text-2xl font-semibold tracking-tight text-chrome-text"
            : "text-sm font-semibold tracking-tight text-chrome-text"
        }
      >
        {APP_NAME.replace(/^5K\s*/, "")}
      </span>
    </span>
  );
}
