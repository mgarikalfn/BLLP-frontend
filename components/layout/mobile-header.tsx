import { MobileSidebar } from "./mobile-sidebar";
import { NotificationBell } from "@/components/NotificationBell";

export default function MobileHeader(){
    return (
        <nav className="lg:hidden px-4 h-12.5 flex items-center justify-between bg-green-500 border-b fixed top-0 w-full z-50">
           <MobileSidebar/>
           <NotificationBell />
        </nav>
    )
}