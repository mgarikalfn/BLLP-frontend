"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/study/header";
//import { ChunkyButton } from "@/components/ui/chunky-button";
//import { Topic, TopicAPI } from "@/lib/api/topic";

export default function LearnPage() {
  const router = useRouter();
 // const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
/* 
  useEffect(() => {
    const loadTopics = async () => {
      try {
       
          const data = await TopicAPI.getAllTopics();
          setTopics(data);
        
      } catch (error) {
        console.error("Error loading topics:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTopics();
  });

  if (loading) return <div className="p-10 text-center">Loading modules...</div>; */

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-5xl mx-auto p-6">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-800">Learning Path</h1>
          <p className="text-slate-500 font-medium">Select a module to start your journey.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {/*  {topics.map((topic) => (
            <div 
              key={topic._id}
              className="bg-white border-2 border-b-8 border-slate-200 rounded-3xl p-6 hover:translate-y-[-4px] transition-all cursor-pointer flex flex-col justify-between"
              onClick={() => router.push(`/learn/${topic._id}`)}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider ${
                    topic.level === 'BEGINNER' ? 'bg-green-100 text-green-600' : 
                    topic.level === 'INTERMEDIATE' ? 'bg-orange-100 text-orange-600' : 
                    'bg-rose-100 text-rose-600'
                  }`}>
                    {topic.level}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-slate-700 mb-1">{topic.title.ao}</h2>
                <p className="text-slate-400 font-bold text-sm mb-3 uppercase tracking-tight">{topic.title.am}</p>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 italic">
                  "{topic.description.ao}"
                </p>
              </div>
              
              <ChunkyButton variant="primary" className="w-full">
                Learn Now
              </ChunkyButton>
            </div> 
          ))}*/}
        </div>
      </main>
    </div>
  );
}