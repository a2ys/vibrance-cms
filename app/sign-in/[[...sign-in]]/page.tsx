"use client";

import { SignIn } from "@clerk/nextjs";
import { HeartIcon } from "@phosphor-icons/react";

export default function Page() {
  return (
    <div className="flex flex-col items-center min-h-screen justify-center bg-zinc-50">
      <div className="flex-1 flex items-center justify-center p-4">
        <SignIn />
      </div>

      <div className="pb-8 text-xs text-zinc-400 font-medium flex items-center gap-1.5">
        <span>Made with</span>
        <HeartIcon
          weight="fill"
          className="h-3.5 w-3.5 text-red-500 animate-pulse"
        />
        <span>
          by{" "}
          <a
            href="https://a2ys.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            a2ys
          </a>
        </span>
      </div>
    </div>
  );
}
