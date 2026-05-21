/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, Footer } from './components/Navigation';
import { 
  Hero, 
  StatsBar, 
  LegacySection, 
  MissionSection, 
  DogTypesSection, 
  HistoryTimeline, 
  ServicesSection, 
  StepsSection, 
  RegionalMembers,
  JoinFamilySection,
  GuideHero,
  WhatIsAdi,
  TrainingStandardsVisual,
  PublicAccessSection,
  ProcessTimeline,
  AccreditationSection,
  VerifyHero,
  VerifyFeatures,
  ApplyHero,
  ApplyForm,
  MembersHero,
  MembersDirectory,
  MembersCTA,
  LoginHero,
  LoginForm,
  AdminSidebar,
  AdminHeader,
  AdminStats,
  AdminRecentActivity,
  AdminQuickActions,
  AdminDashboardBanner,
  AdminAnimalsSection,
  AdminMembersSection,
  AdminApplicationsSection,
  AdminOwnersSection,
  OwnerSidebar,
  OwnerStats,
  OwnerAnimals,
  OwnerRecentActivity,
  OwnerTravelSection,
  OwnerHeader,
  OwnerProfileSection,
  OwnerSettingsSection
} from './components/PageSections';
import { FaqAccordion, SectionHeading, Button } from './components/UI';
import { FAQ, DOG_CATEGORIES } from './constants';
import { Search, Verified, LayoutDashboard, PawPrint, Users, FileText, Plane, User, Menu } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState(() => localStorage.getItem('activePage') || 'home');
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('activePage', activePage);
    window.scrollTo(0, 0);
  }, [activePage]);

  const handleLoginSuccess = (role: string, user: any) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    const targetPage = role === 'admin' ? 'admin' : 'owner';
    setActivePage(targetPage);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setActivePage('home');
  };

  const HomeView = () => (
    <main>
      <Hero 
        title="WORLD SERVICE ANIMAL REGISTRY"
        subtitle="Global Accreditation Authority"
        description="We lead the international community in setting the highest standards for assistance dog training and public access. Join the most trusted registry for service animals worldwide."
        bgImage="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1600"
        primaryBtn={{ 
          text: 'Verify Certificate', 
          icon: <Verified className="w-5 h-5" />,
          onClick: () => setActivePage('verify')
        }}
        secondaryBtn={{ 
          text: 'Apply Now', 
          icon: <Search className="w-5 h-5" />,
          onClick: () => setActivePage('apply')
        }}
      />
      <StatsBar />
      <LegacySection />
      <MissionSection />
      <DogTypesSection />
      <HistoryTimeline />
      <ServicesSection />
      <StepsSection />
      <RegionalMembers onNavigate={setActivePage} />
      
      <section className="py-24 bg-brand-surface">
        <div className="max-w-3xl mx-auto px-6">
          <SectionHeading title="Frequently Asked Questions" centered />
          <FaqAccordion items={FAQ} />
        </div>
      </section>
      
      <JoinFamilySection inverse onNavigate={setActivePage} />
    </main>
  );

  const VerifyView = () => (
    <main>
      <VerifyHero />
      <VerifyFeatures />
      <JoinFamilySection inverse onNavigate={setActivePage} />
    </main>
  );

  const ApplyView = () => (
    <main>
      <ApplyHero />
      <ApplyForm />
      <StepsSection />
      <JoinFamilySection inverse onNavigate={setActivePage} />
    </main>
  );

  const MembersView = () => (
    <main>
      <MembersHero />
      <MembersDirectory />
      <MembersCTA onNavigate={setActivePage} />
      <JoinFamilySection inverse onNavigate={setActivePage} />
    </main>
  );

  const LoginView = () => (
    <main>
      <LoginHero />
      <LoginForm onLoginSuccess={handleLoginSuccess} />
      <JoinFamilySection inverse onNavigate={setActivePage} />
    </main>
  );

  const AdminDashboardView = () => {
    const [adminActiveTab, setAdminActiveTab] = useState('dashboard');
    const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
    
    return (
      <div className="flex min-h-screen bg-brand-surface font-sans text-brand-primary overflow-x-hidden">
        <AdminSidebar 
          activeTab={adminActiveTab} 
          setActiveTab={(tab) => {
            setAdminActiveTab(tab);
            setIsAdminSidebarOpen(false);
          }} 
          isOpen={isAdminSidebarOpen}
          onClose={() => setIsAdminSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <main className={`flex-grow min-h-screen flex flex-col transition-all duration-300 ${isAdminSidebarOpen ? 'ml-0' : 'ml-0 md:ml-64'} min-w-0`}>
          <AdminHeader 
            title={adminActiveTab === 'dashboard' ? 'Dashboard Overview' : adminActiveTab.charAt(0).toUpperCase() + adminActiveTab.slice(1)} 
            onMenuClick={() => setIsAdminSidebarOpen(true)}
          />
          <div className="p-4 md:p-10 pb-28 md:pb-10 space-y-10 max-w-7xl mx-auto w-full min-w-0">
            {adminActiveTab === 'dashboard' && (
              <>
                <AdminStats />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2">
                    <AdminRecentActivity />
                  </div>
                  <AdminQuickActions onTabChange={setAdminActiveTab} />
                </div>
                <AdminDashboardBanner />
              </>
            )}
            {adminActiveTab === 'animals' && <AdminAnimalsSection />}
            {adminActiveTab === 'members' && <AdminMembersSection />}
            {adminActiveTab === 'applications' && <AdminApplicationsSection />}
            {adminActiveTab === 'owners' && <AdminOwnersSection />}
            {['travel-requests'].includes(adminActiveTab) && (
              <div className="py-20 text-center">
                <SectionHeading 
                  subtitle="Coming Soon"
                  title={`${adminActiveTab.charAt(0).toUpperCase() + adminActiveTab.slice(1)} Management`}
                  description="This management module is currently under development."
                  centered
                />
              </div>
            )}
            <footer className="pt-10 flex justify-between items-center text-brand-primary/40">
              <p className="text-xs font-bold uppercase tracking-widest">© 2024 Service Animal Registry Authority</p>
              <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                <a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Audit Logs</a>
              </div>
            </footer>
          </div>
        </main>

        {/* Bottom Nav for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-primary/5 shadow-2xl flex justify-around items-center py-2 px-4 z-40">
          <button 
            onClick={() => setAdminActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-2 ${adminActiveTab === 'dashboard' ? 'text-brand-accent' : 'text-brand-primary/40'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button 
            onClick={() => setAdminActiveTab('animals')}
            className={`flex flex-col items-center gap-1 p-2 ${adminActiveTab === 'animals' ? 'text-brand-accent' : 'text-brand-primary/40'}`}
          >
            <PawPrint className="w-5 h-5" />
            <span className="text-[10px] font-bold">Animals</span>
          </button>
          <button 
            onClick={() => setAdminActiveTab('members')}
            className={`flex flex-col items-center gap-1 p-2 ${adminActiveTab === 'members' ? 'text-brand-accent' : 'text-brand-primary/40'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold">Members</span>
          </button>
          <button 
            onClick={() => setAdminActiveTab('applications')}
            className={`flex flex-col items-center gap-1 p-2 ${adminActiveTab === 'applications' ? 'text-brand-accent' : 'text-brand-primary/40'}`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-bold">Apps</span>
          </button>
          <button 
            onClick={() => setAdminActiveTab('owners')}
            className={`flex flex-col items-center gap-1 p-2 ${adminActiveTab === 'owners' ? 'text-brand-accent' : 'text-brand-primary/40'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold">Owners</span>
          </button>
        </div>
      </div>
    );
  };

  const OwnerDashboardView = () => {
    const [ownerActiveTab, setOwnerActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
      <div className="flex min-h-screen bg-brand-surface font-sans text-brand-primary overflow-x-hidden text-left">
        <OwnerSidebar 
          activeTab={ownerActiveTab} 
          setActiveTab={(tab) => {
            setOwnerActiveTab(tab);
            setIsSidebarOpen(false);
          }} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <main className={`flex-grow min-h-screen flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-0 md:ml-64'} min-w-0`}>
          <OwnerHeader 
            title={ownerActiveTab === 'dashboard' ? 'Dashboard Overview' : ownerActiveTab.charAt(0).toUpperCase() + ownerActiveTab.slice(1)} 
            setActiveTab={setOwnerActiveTab}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          <div className="p-4 md:p-10 pb-28 md:pb-10 space-y-10 max-w-7xl mx-auto w-full min-w-0">
            {ownerActiveTab === 'dashboard' && (
              <>
                <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-4xl font-bold tracking-tight">Welcome back, {currentUser?.name || 'Elena'}</h2>
                    <p className="text-xl text-brand-primary/60 font-light">Your service animals are ready for their next journey.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={() => setOwnerActiveTab('travel')}
                    className="px-10 py-4 shadow-xl shadow-brand-primary/10"
                  >
                    Submit Travel Request
                  </Button>
                </section>

                <OwnerStats />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8">
                    <OwnerAnimals />
                  </div>
                  <div className="lg:col-span-4">
                    <OwnerRecentActivity />
                  </div>
                </div>
              </>
            )}

            {ownerActiveTab === 'animals' && <OwnerAnimals />}
            {ownerActiveTab === 'travel' && <OwnerTravelSection />}
            {ownerActiveTab === 'profile' && <OwnerProfileSection />}
            {ownerActiveTab === 'settings' && <OwnerSettingsSection />}

            <footer className="pt-10 flex justify-between items-center text-brand-primary/40 border-t border-brand-primary/5">
              <p className="text-xs font-bold uppercase tracking-widest">© 2024 Service Animal Registry Authority</p>
              <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                <a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Support</a>
              </div>
            </footer>
          </div>
        </main>

        {/* Bottom Nav for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-primary/5 shadow-2xl flex justify-around items-center py-2 px-4 z-40">
          <button 
            onClick={() => setOwnerActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-2 ${ownerActiveTab === 'dashboard' ? 'text-brand-accent' : 'text-brand-primary/40'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button 
            onClick={() => setOwnerActiveTab('animals')}
            className={`flex flex-col items-center gap-1 p-2 ${ownerActiveTab === 'animals' ? 'text-brand-accent' : 'text-brand-primary/40'}`}
          >
            <PawPrint className="w-5 h-5" />
            <span className="text-[10px] font-bold">Animals</span>
          </button>
          <button 
            onClick={() => setOwnerActiveTab('travel')}
            className={`flex flex-col items-center gap-1 p-2 ${ownerActiveTab === 'travel' ? 'text-brand-accent' : 'text-brand-primary/40'}`}
          >
            <Plane className="w-5 h-5" />
            <span className="text-[10px] font-bold">Travel</span>
          </button>
          <button 
            onClick={() => setOwnerActiveTab('profile')}
            className={`flex flex-col items-center gap-1 p-2 ${ownerActiveTab === 'profile' ? 'text-brand-accent' : 'text-brand-primary/40'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </div>
    );
  };

  const GuideView = () => (
    <main>
      <GuideHero />
      <WhatIsAdi />
      <DogTypesSection />
      <TrainingStandardsVisual />
      <PublicAccessSection />
      <ProcessTimeline />
      <AccreditationSection />
      
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <SectionHeading title="Frequently Asked Questions" centered />
          <FaqAccordion items={[
            {
              question: "What's the difference between a service dog and an ESA?",
              answer: "Service dogs are trained to perform specific tasks that mitigate their handler's disability. They have legal public access rights under the ADA. Emotional support animals (ESAs) provide comfort through their presence but are NOT trained to perform specific tasks and do not have the same access rights."
            },
            {
              question: "How long does it take to train an assistance dog?",
              answer: "Training an assistance dog typically takes 18-24 months from birth to placement. This includes breeding selection, puppy socialization, basic obedience, task-specific training, and handler training."
            },
            {
              question: "Can any dog breed be an assistance dog?",
              answer: "While Labradors, Goldens, and GSDs are common, any breed with the right temperament, health, and abilities can become an assistance dog. ADI does not specify breed requirements."
            },
            {
              question: "What is 'intelligent disobedience'?",
              answer: "Intelligent disobedience is the ability of a guide dog to refuse a command if following it would put the handler in danger, such as sensing an approaching vehicle at a crossing despite a 'forward' command."
            }
          ]} />
        </div>
      </section>
      
      <section className="py-24 bg-brand-surface border-t border-brand-primary/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <SectionHeading 
            title="Ready to Get Started?" 
            description="Whether you need certification, verification, or want to learn more about ADI standards, we're here to help."
            centered
          />
          <div className="flex flex-wrap justify-center gap-6">
            <Button variant="primary" className="px-12 py-4">Apply Now</Button>
            <Button variant="outline" className="px-12 py-4 shadow-sm">Verify Certificate</Button>
          </div>
        </div>
      </section>
    </main>
  );

  if (activePage === 'admin') {
    return <AdminDashboardView />;
  }

  if (activePage === 'owner') {
    return <OwnerDashboardView />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-primary scroll-smooth">
      <Navbar activePage={activePage} onNavigate={setActivePage} />
      
      <div className="flex-grow">
        {activePage === 'home' && <HomeView />}
        {activePage === 'guide' && <GuideView />}
        {activePage === 'verify' && <VerifyView />}
        {activePage === 'apply' && <ApplyView />}
        {activePage === 'members' && <MembersView />}
        {activePage === 'login' && <LoginView />}
        {['admin'].includes(activePage) && (
          <div className="pt-40 pb-40 text-center">
            <SectionHeading 
              subtitle="Coming Soon"
              title={`${activePage.charAt(0).toUpperCase() + activePage.slice(1)} Portal`}
              description="We are currently upgrading our digital systems to better serve our community."
              centered
            />
            <Button onClick={() => setActivePage('home')}>Return Home</Button>
          </div>
        )}
      </div>

      <Footer onNavigate={setActivePage} />
    </div>
  );
}
