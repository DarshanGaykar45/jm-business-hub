import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/public/Navbar';
import Footer from '../components/public/Footer';
import LeadCaptureModal from '../components/public/LeadCaptureModal';

export default function PublicLayout() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    division: 'construction',
    defaultRequirement: '',
    title: 'Instant Inquiry & Quotation'
  });

  const openLeadModal = (division = 'construction', defaultRequirement = '', title = 'Request Instant Quotation') => {
    setModalState({
      isOpen: true,
      division,
      defaultRequirement,
      title
    });
  };

  const closeLeadModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Navbar onOpenLeadModal={openLeadModal} />

      <main className="flex-grow">
        {/* Pass modal trigger down to all child page routes */}
        <Outlet context={{ openLeadModal }} />
      </main>

      <Footer onOpenLeadModal={openLeadModal} />

      <LeadCaptureModal
        isOpen={modalState.isOpen}
        onClose={closeLeadModal}
        initialDivision={modalState.division}
        title={modalState.title}
        defaultRequirement={modalState.defaultRequirement}
      />
    </div>
  );
}
