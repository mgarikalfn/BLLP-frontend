import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  redirect("/marketing");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      {/* 
      <h1 className="text-4xl font-bold text-bird mb-8">Hello Afaan-ልሳን!</h1>
      
      <Button>Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="primaryOutline">Primary Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="secondaryOutline">Secondary Outline</Button>
      <Button variant="danger">danger</Button>
      <Button variant="dangerOutline">danger Outline</Button>
      <Button variant="super">super</Button>
      <Button variant="superOutline">super Outline</Button>
      <Button variant="ghost">ghost</Button>
      
      <Button variant="sidebar">sidebar</Button>
      <Button variant="sidebarOutline">sidebar Outline</Button>
      */}
    </main>
  );
}