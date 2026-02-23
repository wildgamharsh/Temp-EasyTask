"use client";

import { LandingNavbar, LandingFooter } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const teamMembers = [
    {
        name: "Alex Johnson",
        role: "Founder & CEO",
        bio: "Visionary leader with 10+ years in the event industry.",
        image: ""
    },
    {
        name: "Sarah Williams",
        role: "Head of Product",
        bio: "Passionate about building intuitive user experiences.",
        image: ""
    },
    {
        name: "Michael Chen",
        role: "Lead Developer",
        bio: "Full-stack wizard ensuring our platform runs smoothly.",
        image: ""
    },
     {
        name: "Emily Davis",
        role: "Customer Success",
        bio: "Dedicated to helping your business thrive.",
        image: ""
    }
];

export default function OurTeamPage() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased selection:bg-brand-200 selection:text-brand-900">
      <LandingNavbar />
      
       {/* Hero Section */}
       <section className="pt-32 pb-20 md:pt-48 md:pb-24 text-center bg-linear-to-b from-brand-50 to-white">
            <div className="max-w-4xl mx-auto px-4">
                 <h1 className="text-4xl md:text-6xl font-extrabold text-brand-900 mb-6 tracking-tight">
                    Meet the <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 to-indigo-600">Team</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    The passionate individuals behind Zaaro, dedicated to modernizing the event industry.
                </p>
            </div>
       </section>
        
      <main className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-all text-center group">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-brand-50 group-hover:border-brand-100 transition-colors">
                         <Avatar className="w-full h-full">
                            <AvatarImage src={member.image} />
                            <AvatarFallback className="bg-brand-100 text-brand-600 text-2xl font-bold">
                                {member.name[0]}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                    <p className="text-brand-600 font-medium text-sm mb-4">{member.role}</p>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        {member.bio}
                    </p>
                </div>
            ))}
         </div>
      </main>
      <LandingFooter />
    </div>
  );
}
