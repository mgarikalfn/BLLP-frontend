"use client"; // Needs to be a client component for state (language toggle & auth)

import Image from "next/image";
import Link from "next/link";
import { Loader, UserCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/languageStore";
// import { useAuth } from "@/hooks/useAuth"; // <-- Your custom auth hook!

export const Header = () => {
  // Mocking your auth state. Replace with your actual hook.
  // const { user, isLoading } = useAuth(); 
  const isLoading = false; 
  const user = null; 

  const lang = useLanguageStore((s) => s.lang);
  const toggleLang = useLanguageStore((s) => s.toggleLang);
  const t = translations[lang];

  useEffect(() => {
    document.body.lang = lang;
  }, [lang]);

  return (
    <header className="h-20 w-full border-b-2 border-slate-200 px-4">
      <div className="lg:max-w-5xl mx-auto flex items-center justify-between h-full">
        
        {/* Logo Section */}
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
          <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">
            Afaan-ልሳን
          </h1>
        </div>

        {/* Controls Section */}
        <div className="flex items-center gap-x-4">
          {/* Language Toggle */}
          <Button 
            variant="ghost" 
            onClick={toggleLang}
            className="flex items-center gap-2 text-slate-500"
          >
            <Globe className="w-5 h-5" />
            <span className="font-bold uppercase">{lang}</span>
          </Button>

          {/* Custom Auth Conditional Rendering */}
          {isLoading ? (
            <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : user ? (
            <Link href="/profile">
              {/* Replace with a User Avatar Component if you have one */}
              <UserCircle className="w-10 h-10 text-slate-400 hover:text-slate-600 cursor-pointer" />
            </Link>
          ) : (
            <Link href="/login">
              <Button size="lg" variant="ghost">
                {t.login}
              </Button>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};