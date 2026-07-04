/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowUpRight, 
  Search, 
  FileText, 
  BookOpen, 
  Building2,
  Users,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Filter,
  MoreHorizontal,
  Download,
  Verified,
  History,
  Workflow,
  Eye,
  Edit,
  Trash2,
  Activity,
  Brain,
  Zap,
  Ear,
  Accessibility,
  Heart,
  Stethoscope,
  Clock,
  PawPrint,
  Menu,
  Globe,
  MapPin,
  Phone,
  Mail,
  Lock,
  LayoutDashboard,
  Settings,
  Bell,
  LogOut,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  Plane,
  User,
  ImagePlus,
  ClipboardCheck,
  XCircle,
  Calendar,
  Share2,
  UploadCloud,
  Upload,
  ExternalLink
} from 'lucide-react';
import { SectionHeading, Button, ExternalButton } from './UI';

export const AddAnimalModal = ({ isOpen, onClose, onAdd, initialOwner = '' }: { isOpen: boolean, onClose: () => void, onAdd?: () => void, initialOwner?: string }) => {
  const [searchOwner, setSearchOwner] = React.useState(initialOwner);
  const [selectedOwner, setSelectedOwner] = React.useState<any>(null);
  const [owners, setOwners] = React.useState<any[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);

  // Members (facility) search states
  const [members, setMembers] = React.useState<any[]>([]);
  const [searchFacility, setSearchFacility] = React.useState('');
  const [selectedFacility, setSelectedFacility] = React.useState<any>(null);
  const [showFacilityDropdown, setShowFacilityDropdown] = React.useState(false);

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Document file names
  const [attestationFileName, setAttestationFileName] = React.useState('');
  const [certificateFileName, setCertificateFileName] = React.useState('');
  const [idDocFileName, setIdDocFileName] = React.useState('');
  const [otherFileName, setOtherFileName] = React.useState('');

  // Form states
  const [formData, setFormData] = React.useState({
    name: '',
    breed: '',
    gender: 'Male',
    weight: '25kg',
    microchip: '',
    date_of_birth: '',
    color: '',
    rabies_expiration: '',
    rabies_serial: '',
    rabies_brand: '',
    rabies_type: '3-Year Vaccine',
    facility_name: '',
    trainer_name: '',
    trained_task: '',
    completion_date: '',
    status: 'Certified',
    img: '',
    doc_attestation: '',
    doc_certificate: '',
    doc_id: '',
    doc_other: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDocChange = (field: 'doc_attestation' | 'doc_certificate' | 'doc_id' | 'doc_other', file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, [field]: '' }));
      if (field === 'doc_attestation') setAttestationFileName('');
      if (field === 'doc_certificate') setCertificateFileName('');
      if (field === 'doc_id') setIdDocFileName('');
      if (field === 'doc_other') setOtherFileName('');
      return;
    }

    if (field === 'doc_attestation') setAttestationFileName(file.name);
    if (field === 'doc_certificate') setCertificateFileName(file.name);
    if (field === 'doc_id') setIdDocFileName(file.name);
    if (field === 'doc_other') setOtherFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/owners')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOwners(data.owners);
            if (initialOwner) {
              const matched = data.owners.find((o: any) => o.name.toLowerCase() === initialOwner.toLowerCase());
              if (matched) {
                setSelectedOwner(matched);
                setSearchOwner(matched.name);
              }
            }
          }
        })
        .catch(err => console.error('Error fetching owners:', err));

      // Fetch members list for facility dropdown
      fetch('/api/admin/members')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMembers(data.members);
          }
        })
        .catch(err => console.error('Error fetching members:', err));
    } else {
      setSearchOwner('');
      setSelectedOwner(null);
      setShowDropdown(false);
      setPreviewUrl(null);
      setAttestationFileName('');
      setCertificateFileName('');
      setIdDocFileName('');
      setOtherFileName('');
      setFormData({
        name: '',
        breed: '',
        gender: 'Male',
        weight: '25kg',
        microchip: '',
        date_of_birth: '',
        color: '',
        rabies_expiration: '',
        rabies_serial: '',
        rabies_brand: '',
        rabies_type: '3-Year Vaccine',
        facility_name: '',
        trainer_name: '',
        trained_task: '',
        completion_date: '',
        status: 'Certified',
        img: '',
        doc_attestation: '',
        doc_certificate: '',
        doc_id: '',
        doc_other: ''
      });
    }
  }, [isOpen, initialOwner]);

  if (!isOpen) return null;

  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(searchOwner.toLowerCase()) ||
    (owner.registry_id || '').toLowerCase().includes(searchOwner.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOwner) {
      alert('Please select a verified owner from the list first.');
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          handler_id: selectedOwner.id
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Service animal registered successfully!');
        onAdd?.();
        onClose();
      } else {
        alert(data.error || 'Failed to register animal.');
      }
    } catch (err) {
      console.error('Error registering animal:', err);
      alert('Network error. Failed to register animal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5 flex flex-col max-h-[95vh] md:max-h-[90vh]"
      >
        {/* Sticky Header */}
        <div className="p-5 sm:p-8 md:px-12 md:pt-10 md:pb-6 border-b border-brand-primary/5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Register New Service Animal</h3>
            <p className="text-[10px] font-black text-brand-primary/30 uppercase tracking-widest">Administrative Entry Portal</p>
          </div>
          <button onClick={onClose} className="p-3 bg-brand-surface rounded-2xl hover:bg-brand-primary/5 transition-colors">
            <LogOut className="w-5 h-5 rotate-180" />
          </button>
        </div>

        <form className="flex flex-col flex-grow overflow-hidden" onSubmit={handleSubmit}>
          {/* Scrollable Form Body */}
          <div className="flex-grow overflow-y-auto p-5 sm:p-8 md:p-12 space-y-8 sm:space-y-12">
            {/* SECTION 1: OWNER SEARCH & INFO */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Owner Identification</h4>
              </div>

              <div className="space-y-6 relative">
                <div className="flex gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/20 w-5 h-5" />
                    <input 
                      type="text" 
                      value={searchOwner}
                      onChange={(e) => {
                        setSearchOwner(e.target.value);
                        setSelectedOwner(null);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search owner by legal name or ID..." 
                      className="w-full pl-12 pr-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none" 
                    />
                  </div>
                </div>

                {showDropdown && searchOwner.length > 0 && (
                  <div className="absolute left-0 right-0 z-50 bg-white rounded-2xl shadow-2xl p-4 border border-brand-primary/5 space-y-2 max-h-[200px] overflow-y-auto">
                    {filteredOwners.map((owner, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedOwner(owner);
                          setSearchOwner(owner.name);
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-brand-surface rounded-xl transition-colors text-left group"
                      >
                        <div>
                          <p className="text-brand-primary font-bold">{owner.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">{owner.registry_id} • {owner.email}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-brand-accent opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                      </button>
                    ))}
                    {filteredOwners.length === 0 && (
                      <div className="p-4 text-center text-xs font-bold text-brand-primary/30">No owners found.</div>
                    )}
                  </div>
                )}

                {selectedOwner && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-8 bg-brand-surface rounded-2xl sm:rounded-[2rem] border border-brand-primary/5"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Owner Full Name</label>
                      <p className="text-sm font-bold">{selectedOwner.name}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Registry Member ID</label>
                      <p className="text-sm font-bold">{selectedOwner.registry_id}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Email Address</label>
                      <p className="text-sm font-bold">{selectedOwner.email}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Verification Status</label>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-status-success/10 text-status-success rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Verified Handler
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* SECTION 2: ANIMAL INFORMATION */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <PawPrint className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Animal Details</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Pet Photo</label>
                  <div className="aspect-square w-full bg-brand-surface rounded-3xl border-2 border-dashed border-brand-primary/10 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-primary/5 transition-all text-brand-primary/20 hover:text-brand-primary/40 group relative overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <>
                        <ImagePlus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-center">Click to upload photo</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          const url = URL.createObjectURL(file);
                          setPreviewUrl(url);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({ ...prev, img: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                  </div>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Pet Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Max" 
                      className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Breed</label>
                    <input 
                      type="text" 
                      required
                      value={formData.breed}
                      onChange={e => setFormData({ ...formData, breed: e.target.value })}
                      placeholder="e.g. Golden Retriever" 
                      className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary/10 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Weight (kg/lbs)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.weight}
                      onChange={e => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g. 25kg" 
                      className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Microchip ID</label>
                    <input 
                      type="text" 
                      required
                      value={formData.microchip}
                      onChange={e => setFormData({ ...formData, microchip: e.target.value })}
                      placeholder="15-digit ID" 
                      className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Date of Birth</label>
                    <input 
                      type="date" 
                      required
                      value={formData.date_of_birth}
                      onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Color / Markings</label>
                <input 
                  type="text" 
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Primary fur color and identifying marks" 
                  className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
                />
              </div>
            </div>

            {/* SECTION 3: RABIES VACCINATION INFORMATION */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Rabies Vaccination Information</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Expiration Date</label>
                  <input 
                    type="date" 
                    value={formData.rabies_expiration}
                    onChange={e => setFormData({ ...formData, rabies_expiration: e.target.value })}
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Serial Number</label>
                  <input 
                    type="text" 
                    value={formData.rabies_serial}
                    onChange={e => setFormData({ ...formData, rabies_serial: e.target.value })}
                    placeholder="Tag or lot number" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Brand</label>
                  <input 
                    type="text" 
                    value={formData.rabies_brand}
                    onChange={e => setFormData({ ...formData, rabies_brand: e.target.value })}
                    placeholder="Vaccine manufacturer" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Type</label>
                  <select 
                    value={formData.rabies_type}
                    onChange={e => setFormData({ ...formData, rabies_type: e.target.value })}
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary/10 outline-none"
                  >
                    <option value="1-Year Vaccine">1-Year Vaccine</option>
                    <option value="3-Year Vaccine">3-Year Vaccine</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 4: TRAINING FACILITY */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Training & Accreditation</h4>
              </div>

              {/* Facility Search Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Accredited Facility (Search Member Programs)</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/30 w-4 h-4" />
                  <input 
                    type="text" 
                    value={searchFacility}
                    onChange={e => {
                      setSearchFacility(e.target.value);
                      setShowFacilityDropdown(true);
                      if (!e.target.value) {
                        setSelectedFacility(null);
                        setFormData(prev => ({ ...prev, facility_name: '' }));
                      }
                    }}
                    onFocus={() => setShowFacilityDropdown(true)}
                    placeholder="Search accredited member programs..." 
                    className="w-full pl-11 pr-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
                  />
                </div>
                {showFacilityDropdown && searchFacility && !selectedFacility && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-brand-primary/10 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                    {members.filter(m => m.name.toLowerCase().includes(searchFacility.toLowerCase())).map((m: any) => (
                      <button 
                        key={m.id} 
                        type="button" 
                        className="w-full text-left px-5 py-3.5 hover:bg-brand-surface flex items-center gap-4 border-b border-brand-primary/5 last:border-0 transition-colors"
                        onClick={() => {
                          setSelectedFacility(m);
                          setSearchFacility(m.name);
                          setShowFacilityDropdown(false);
                          setFormData(prev => ({ ...prev, facility_name: m.name }));
                        }}
                      >
                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-brand-primary/10 shrink-0 bg-brand-surface">
                          {m.img && <img src={m.img} className="w-full h-full object-cover" alt={m.name} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-brand-primary truncate">{m.name}</p>
                          <p className="text-[10px] text-brand-primary/40 font-bold">{m.country} • {m.registry_id}</p>
                        </div>
                      </button>
                    ))}
                    {members.filter(m => m.name.toLowerCase().includes(searchFacility.toLowerCase())).length === 0 && (
                      <div className="p-4 text-center text-xs font-bold text-brand-primary/30">No member programs found.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Facility Info Card */}
              {selectedFacility && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 sm:p-6 bg-brand-surface rounded-2xl sm:rounded-[2rem] border border-brand-primary/5"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Facility Name</label>
                    <p className="text-sm font-bold">{selectedFacility.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Registry ID</label>
                    <p className="text-sm font-bold">{selectedFacility.registry_id}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Country</label>
                    <p className="text-sm font-bold">{selectedFacility.country}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Phone</label>
                    <p className="text-sm font-bold">{selectedFacility.phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Website</label>
                    <p className="text-sm font-bold text-brand-primary/60">{selectedFacility.website || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Status</label>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit ${selectedFacility.status === 'Active' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'}`}>
                      {selectedFacility.status}
                    </span>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Lead Trainer Name</label>
                  <input 
                    type="text" 
                    value={formData.trainer_name}
                    onChange={e => setFormData({ ...formData, trainer_name: e.target.value })}
                    placeholder="Certified Professional Trainer" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Trained Task</label>
                  <input 
                    type="text" 
                    value={formData.trained_task}
                    onChange={e => setFormData({ ...formData, trained_task: e.target.value })}
                    placeholder="e.g. Mobility Assistance" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Completion Date</label>
                  <input 
                    type="date" 
                    value={formData.completion_date}
                    onChange={e => setFormData({ ...formData, completion_date: e.target.value })}
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: ACCREDITATION & DOCUMENTS UPLOAD */}
            <div className="space-y-8 pb-6">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Required Documents</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {/* Attestation Letter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Attestation Letter</label>
                  <div className="relative border-2 border-dashed border-brand-primary/10 rounded-2xl p-4 bg-brand-surface hover:bg-brand-primary/5 transition-all text-center flex flex-col items-center justify-center min-h-[120px] cursor-pointer group">
                    <UploadCloud className="w-6 h-6 text-brand-primary/20 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-bold text-brand-primary/60 truncate max-w-full px-2">
                      {attestationFileName || 'Upload Attestation Letter (PDF/Image)'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={(e) => handleDocChange('doc_attestation', e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                </div>

                {/* Certificate */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Certificate</label>
                  <div className="relative border-2 border-dashed border-brand-primary/10 rounded-2xl p-4 bg-brand-surface hover:bg-brand-primary/5 transition-all text-center flex flex-col items-center justify-center min-h-[120px] cursor-pointer group">
                    <UploadCloud className="w-6 h-6 text-brand-primary/20 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-bold text-brand-primary/60 truncate max-w-full px-2">
                      {certificateFileName || 'Upload Certificate (PDF/Image)'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={(e) => handleDocChange('doc_certificate', e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                </div>

                {/* Service Animal ID */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Service Animal ID</label>
                  <div className="relative border-2 border-dashed border-brand-primary/10 rounded-2xl p-4 bg-brand-surface hover:bg-brand-primary/5 transition-all text-center flex flex-col items-center justify-center min-h-[120px] cursor-pointer group">
                    <UploadCloud className="w-6 h-6 text-brand-primary/20 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-bold text-brand-primary/60 truncate max-w-full px-2">
                      {idDocFileName || 'Upload Service Animal ID (PDF/Image)'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={(e) => handleDocChange('doc_id', e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                </div>

                {/* Other Documents */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Other Documents</label>
                  <div className="relative border-2 border-dashed border-brand-primary/10 rounded-2xl p-4 bg-brand-surface hover:bg-brand-primary/5 transition-all text-center flex flex-col items-center justify-center min-h-[120px] cursor-pointer group">
                    <UploadCloud className="w-6 h-6 text-brand-primary/20 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-bold text-brand-primary/60 truncate max-w-full px-2">
                      {otherFileName || 'Upload Other Documents (PDF/Image)'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={(e) => handleDocChange('doc_other', e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 border-t border-brand-primary/5 p-6 md:px-12 flex gap-4 justify-end bg-brand-surface/50">
            <button 
              type="button"
              onClick={onClose} 
              className="px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-brand-primary/5 hover:bg-brand-surface transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3 rounded-xl bg-brand-primary text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Registering...' : 'Register Animal'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const ViewAnimalModal = ({ isOpen, onClose, animal }: { isOpen: boolean, onClose: () => void, animal: any }) => {
  const [facilityMember, setFacilityMember] = React.useState<any>(null);
  const [enlargedPhoto, setEnlargedPhoto] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && animal?.facility_name) {
      fetch('/api/admin/members')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const matched = data.members.find((m: any) => m.name === animal.facility_name);
            setFacilityMember(matched || null);
          }
        })
        .catch(err => console.error('Error fetching members:', err));
    } else {
      setFacilityMember(null);
    }
  }, [isOpen, animal]);

  if (!isOpen || !animal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {enlargedPhoto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setEnlargedPhoto(null)}>
          <img src={enlargedPhoto} className="max-w-full max-h-full rounded-2xl shadow-2xl" alt="Enlarged" />
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5 flex flex-col max-h-[95vh] md:max-h-[90vh]"
      >
        {/* Sticky Header */}
        <div className="p-5 sm:p-8 md:px-12 md:pt-10 md:pb-6 border-b border-brand-primary/5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-bold tracking-tight mb-1">Service Animal Profile</h3>
            <p className="text-[10px] font-black text-brand-primary/30 uppercase tracking-widest">Registry ID: {animal.registry_id || animal.id}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-brand-surface rounded-2xl hover:bg-brand-primary/5 transition-colors">
            <LogOut className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Scrollable Profile Body */}
        <div className="flex-grow overflow-y-auto p-5 sm:p-8 md:p-12 space-y-8 sm:space-y-10">
          {/* Header section with photo, name & status */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start border-b border-brand-primary/5 pb-8">
            <div 
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-primary/5 shadow-lg shrink-0 cursor-pointer hover:border-brand-accent transition-colors"
              onClick={() => setEnlargedPhoto(animal.img || 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=200')}
            >
              <img src={animal.img || 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=200'} alt={animal.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center sm:text-left space-y-4">
              <div>
                <h4 className="text-3xl font-bold text-brand-primary">{animal.name}</h4>
                <p className="text-sm font-semibold text-brand-primary/60">{animal.breed} • {animal.gender}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                  animal.status === 'Certified' ? 'bg-status-success/10 text-status-success' :
                  animal.status === 'Pending' ? 'bg-status-warning/10 text-status-warning' :
                  'bg-status-error/10 text-status-error'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    animal.status === 'Certified' ? 'bg-status-success' :
                    animal.status === 'Pending' ? 'bg-status-warning' :
                    'bg-status-error'
                  }`} />
                  {animal.status}
                </span>
                <span className="px-4 py-1.5 bg-brand-surface rounded-full text-[10px] font-black uppercase tracking-widest text-brand-primary/60">
                  {animal.weight}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Owner Details */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-widest text-brand-primary/40">Handler / Owner</h5>
              <div className="p-6 bg-brand-surface rounded-2xl border border-brand-primary/5 space-y-2">
                <p className="text-sm font-bold text-brand-primary">{animal.handler || 'No handler linked'}</p>
                <p className="text-xs text-brand-primary/50">Associated Registry Handler Account</p>
              </div>
            </div>

            {/* Microchip Details */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-widest text-brand-primary/40">Microchip Identification</h5>
              <div className="p-6 bg-brand-surface rounded-2xl border border-brand-primary/5 space-y-2">
                <p className="text-sm font-mono font-bold text-brand-primary">{animal.microchip}</p>
                <p className="text-xs text-brand-primary/50">15-Digit RFID Transponder</p>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-widest text-brand-primary/40">Date of Birth</h5>
              <div className="p-6 bg-brand-surface rounded-2xl border border-brand-primary/5 space-y-2">
                <p className="text-sm font-bold text-brand-primary">{animal.date_of_birth ? new Date(animal.date_of_birth).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            {/* Color / Markings */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-widest text-brand-primary/40">Color / Markings</h5>
              <div className="p-6 bg-brand-surface rounded-2xl border border-brand-primary/5 space-y-2">
                <p className="text-sm font-bold text-brand-primary">{animal.color || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Health & Rabies Details */}
          <div className="space-y-4">
            <h5 className="text-xs font-black uppercase tracking-widest text-brand-primary/40">Rabies Vaccination Information</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Expiration Date</p>
                <p className="text-sm font-bold">{animal.rabies_expiration ? new Date(animal.rabies_expiration).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Serial Number</p>
                <p className="text-sm font-bold">{animal.rabies_serial || 'N/A'}</p>
              </div>
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Vaccine Brand / Type</p>
                <p className="text-sm font-bold">{animal.rabies_brand ? `${animal.rabies_brand} (${animal.rabies_type})` : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Training Facility Details */}
          <div className="space-y-4">
            <h5 className="text-xs font-black uppercase tracking-widest text-brand-primary/40">Accredited Training Details</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Facility Name</p>
                <p className="text-sm font-bold">{animal.facility_name || 'N/A'}</p>
              </div>
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Trainer Name</p>
                <p className="text-sm font-bold">{animal.trainer_name || 'N/A'}</p>
              </div>
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Trained Task</p>
                <p className="text-sm font-bold">{animal.trained_task || 'N/A'}</p>
              </div>
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Accreditation Date</p>
                <p className="text-sm font-bold">{animal.completion_date ? new Date(animal.completion_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              {facilityMember && (
                <>
                  <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Facility Country</p>
                    <p className="text-sm font-bold">{facilityMember.country || 'N/A'}</p>
                  </div>
                  <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Facility Phone</p>
                    <p className="text-sm font-bold">{facilityMember.phone || 'N/A'}</p>
                  </div>
                  <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5 md:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Facility Website</p>
                    <p className="text-sm font-bold text-brand-primary/60">{facilityMember.website || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Submitted Documents */}
          <div className="space-y-4 pb-4">
            <h5 className="text-xs font-black uppercase tracking-widest text-brand-primary/40">Submitted Documents</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Attestation Document */}
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5 flex flex-col justify-between min-h-[110px]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Attestation Letter</p>
                  <p className="text-xs text-brand-primary/60 truncate max-w-full">
                    {animal.doc_attestation ? animal.doc_attestation.split('/').pop() : 'Not uploaded'}
                  </p>
                </div>
                {animal.doc_attestation && (
                  <a 
                    href={animal.doc_attestation} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-brand-primary/80 flex items-center gap-1.5 w-fit border-b border-brand-primary/20 pb-0.5"
                  >
                    View Document
                  </a>
                )}
              </div>

              {/* Certificate Document */}
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5 flex flex-col justify-between min-h-[110px]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Certificate</p>
                  <p className="text-xs text-brand-primary/60 truncate max-w-full">
                    {animal.doc_certificate ? animal.doc_certificate.split('/').pop() : 'Not uploaded'}
                  </p>
                </div>
                {animal.doc_certificate && (
                  <a 
                    href={animal.doc_certificate} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-brand-primary/80 flex items-center gap-1.5 w-fit border-b border-brand-primary/20 pb-0.5"
                  >
                    View Document
                  </a>
                )}
              </div>

              {/* ID Document */}
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5 flex flex-col justify-between min-h-[110px]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Service Animal ID</p>
                  <p className="text-xs text-brand-primary/60 truncate max-w-full">
                    {animal.doc_id ? animal.doc_id.split('/').pop() : 'Not uploaded'}
                  </p>
                </div>
                {animal.doc_id && (
                  <a 
                    href={animal.doc_id} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-brand-primary/80 flex items-center gap-1.5 w-fit border-b border-brand-primary/20 pb-0.5"
                  >
                    View Document
                  </a>
                )}
              </div>

              {/* Other Documents */}
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5 flex flex-col justify-between min-h-[110px]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Other Documents</p>
                  <p className="text-xs text-brand-primary/60 truncate max-w-full">
                    {animal.doc_other ? animal.doc_other.split('/').pop() : 'Not uploaded'}
                  </p>
                </div>
                {animal.doc_other && (
                  <a 
                    href={animal.doc_other} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-brand-primary/80 flex items-center gap-1.5 w-fit border-b border-brand-primary/20 pb-0.5"
                  >
                    View Document
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-brand-primary/5 p-5 sm:p-6 md:px-12 flex justify-end bg-brand-surface/30">
          <button 
            onClick={onClose} 
            className="px-10 py-3 rounded-xl bg-brand-primary text-white font-bold text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform"
          >
            Close Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const EditAnimalModal = ({ isOpen, onClose, onUpdate, animal }: { isOpen: boolean, onClose: () => void, onUpdate?: () => void, animal: any }) => {
  const [searchOwner, setSearchOwner] = React.useState('');
  const [selectedOwner, setSelectedOwner] = React.useState<any>(null);
  const [owners, setOwners] = React.useState<any[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Members (facility) search states
  const [members, setMembers] = React.useState<any[]>([]);
  const [searchFacility, setSearchFacility] = React.useState('');
  const [selectedFacility, setSelectedFacility] = React.useState<any>(null);
  const [showFacilityDropdown, setShowFacilityDropdown] = React.useState(false);

  // Document file names
  const [attestationFileName, setAttestationFileName] = React.useState('');
  const [certificateFileName, setCertificateFileName] = React.useState('');
  const [idDocFileName, setIdDocFileName] = React.useState('');
  const [otherFileName, setOtherFileName] = React.useState('');

  // Form states
  const [formData, setFormData] = React.useState({
    name: '',
    breed: '',
    gender: 'Male',
    weight: '25kg',
    microchip: '',
    date_of_birth: '',
    color: '',
    rabies_expiration: '',
    rabies_serial: '',
    rabies_brand: '',
    rabies_type: '3-Year Vaccine',
    facility_name: '',
    trainer_name: '',
    trained_task: '',
    completion_date: '',
    status: 'Certified',
    img: '',
    doc_attestation: '',
    doc_certificate: '',
    doc_id: '',
    doc_other: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDocChange = (field: 'doc_attestation' | 'doc_certificate' | 'doc_id' | 'doc_other', file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, [field]: '' }));
      if (field === 'doc_attestation') setAttestationFileName('');
      if (field === 'doc_certificate') setCertificateFileName('');
      if (field === 'doc_id') setIdDocFileName('');
      if (field === 'doc_other') setOtherFileName('');
      return;
    }

    if (field === 'doc_attestation') setAttestationFileName(file.name);
    if (field === 'doc_certificate') setCertificateFileName(file.name);
    if (field === 'doc_id') setIdDocFileName(file.name);
    if (field === 'doc_other') setOtherFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    if (isOpen && animal) {
      // Format dates (YYYY-MM-DD) for inputs
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      setPreviewUrl(animal.img || null);
      
      const getFileBasename = (url: string) => {
        if (!url) return '';
        return url.split('/').pop() || 'Uploaded Document';
      };
      
      setAttestationFileName(getFileBasename(animal.doc_attestation));
      setCertificateFileName(getFileBasename(animal.doc_certificate));
      setIdDocFileName(getFileBasename(animal.doc_id));
      setOtherFileName(getFileBasename(animal.doc_other));

      setFormData({
        name: animal.name || '',
        breed: animal.breed || '',
        gender: animal.gender || 'Male',
        weight: animal.weight || '25kg',
        microchip: animal.microchip || '',
        date_of_birth: formatDate(animal.date_of_birth),
        color: animal.color || '',
        rabies_expiration: formatDate(animal.rabies_expiration),
        rabies_serial: animal.rabies_serial || '',
        rabies_brand: animal.rabies_brand || '',
        rabies_type: animal.rabies_type || '3-Year Vaccine',
        facility_name: animal.facility_name || '',
        trainer_name: animal.trainer_name || '',
        trained_task: animal.trained_task || '',
        completion_date: formatDate(animal.completion_date),
        status: animal.status || 'Certified',
        img: animal.img || '',
        doc_attestation: animal.doc_attestation || '',
        doc_certificate: animal.doc_certificate || '',
        doc_id: animal.doc_id || '',
        doc_other: animal.doc_other || ''
      });

      // Load owners list to resolve/match the current handler
      fetch('/api/admin/owners')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOwners(data.owners);
            if (animal.handler_id) {
              const matched = data.owners.find((o: any) => o.id === animal.handler_id);
              if (matched) {
                setSelectedOwner(matched);
                setSearchOwner(matched.name);
              }
            }
          }
        })
        .catch(err => console.error('Error fetching owners:', err));

      // Fetch members list for facility dropdown and pre-select current facility
      fetch('/api/admin/members')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMembers(data.members);
            if (animal.facility_name) {
              const matched = data.members.find((m: any) => m.name === animal.facility_name);
              if (matched) {
                setSelectedFacility(matched);
                setSearchFacility(matched.name);
              } else {
                setSearchFacility(animal.facility_name);
              }
            }
          }
        })
        .catch(err => console.error('Error fetching members:', err));
    }
  }, [isOpen, animal]);

  if (!isOpen || !animal) return null;

  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(searchOwner.toLowerCase()) ||
    (owner.registry_id || '').toLowerCase().includes(searchOwner.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/animals/${animal.db_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          handler_id: selectedOwner ? selectedOwner.id : null
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Service animal details updated successfully!');
        onUpdate?.();
        onClose();
      } else {
        alert(data.error || 'Failed to update animal details.');
      }
    } catch (err) {
      console.error('Error updating animal:', err);
      alert('Network error. Failed to update animal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5 flex flex-col max-h-[95vh] md:max-h-[90vh]"
      >
        {/* Sticky Header */}
        <div className="p-5 sm:p-8 md:px-12 md:pt-10 md:pb-6 border-b border-brand-primary/5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Edit Service Animal Details</h3>
            <p className="text-[10px] font-black text-brand-primary/30 uppercase tracking-widest">Registry ID: {animal.registry_id}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-brand-surface rounded-2xl hover:bg-brand-primary/5 transition-colors">
            <LogOut className="w-5 h-5 rotate-180" />
          </button>
        </div>

        <form className="flex flex-col flex-grow overflow-hidden" onSubmit={handleSubmit}>
          {/* Scrollable Form Body */}
          <div className="flex-grow overflow-y-auto p-5 sm:p-8 md:p-12 space-y-8 sm:space-y-12">
            {/* SECTION 1: OWNER SEARCH & INFO */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Owner Identification</h4>
              </div>

              <div className="space-y-6 relative">
                <div className="flex gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/20 w-5 h-5" />
                    <input 
                      type="text" 
                      value={searchOwner}
                      onChange={(e) => {
                        setSearchOwner(e.target.value);
                        setSelectedOwner(null);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search owner by legal name or ID..." 
                      className="w-full pl-12 pr-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none" 
                    />
                  </div>
                </div>

                {showDropdown && searchOwner.length > 0 && (
                  <div className="absolute left-0 right-0 z-50 bg-white rounded-2xl shadow-2xl p-4 border border-brand-primary/5 space-y-2 max-h-[200px] overflow-y-auto">
                    {filteredOwners.map((owner, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedOwner(owner);
                          setSearchOwner(owner.name);
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-brand-surface rounded-xl transition-colors text-left group"
                      >
                        <div>
                          <p className="text-brand-primary font-bold">{owner.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">{owner.registry_id} • {owner.email}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-brand-accent opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                      </button>
                    ))}
                    {filteredOwners.length === 0 && (
                      <div className="p-4 text-center text-xs font-bold text-brand-primary/30">No owners found.</div>
                    )}
                  </div>
                )}

                {selectedOwner && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-8 bg-brand-surface rounded-2xl sm:rounded-[2rem] border border-brand-primary/5"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Owner Full Name</label>
                      <p className="text-sm font-bold">{selectedOwner.name}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Registry Member ID</label>
                      <p className="text-sm font-bold">{selectedOwner.registry_id}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Email Address</label>
                      <p className="text-sm font-bold">{selectedOwner.email}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Verification Status</label>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-status-success/10 text-status-success rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Verified Handler
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* SECTION 2: ANIMAL INFORMATION */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <PawPrint className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Animal Details</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Pet Photo</label>
                  <div className="aspect-square w-full bg-brand-surface rounded-3xl border-2 border-dashed border-brand-primary/10 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-primary/5 transition-all text-brand-primary/20 hover:text-brand-primary/40 group relative overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <>
                        <ImagePlus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-center">Click to upload photo</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          const url = URL.createObjectURL(file);
                          setPreviewUrl(url);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({ ...prev, img: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                  </div>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Pet Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Max" 
                      className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Breed</label>
                    <input 
                      type="text" 
                      required
                      value={formData.breed}
                      onChange={e => setFormData({ ...formData, breed: e.target.value })}
                      placeholder="e.g. Golden Retriever" 
                      className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary/10 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Weight (kg/lbs)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.weight}
                      onChange={e => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g. 25kg" 
                      className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Microchip ID</label>
                    <input 
                      type="text" 
                      required
                      value={formData.microchip}
                      onChange={e => setFormData({ ...formData, microchip: e.target.value })}
                      placeholder="15-digit ID" 
                      className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Date of Birth</label>
                    <input 
                      type="date" 
                      required
                      value={formData.date_of_birth}
                      onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Color / Markings</label>
                <input 
                  type="text" 
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Primary fur color and identifying marks" 
                  className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary/10 outline-none"
                >
                  <option value="Certified">Certified</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>

            {/* SECTION 3: RABIES VACCINATION INFORMATION */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Rabies Vaccination Information</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Expiration Date</label>
                  <input 
                    type="date" 
                    value={formData.rabies_expiration}
                    onChange={e => setFormData({ ...formData, rabies_expiration: e.target.value })}
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Serial Number</label>
                  <input 
                    type="text" 
                    value={formData.rabies_serial}
                    onChange={e => setFormData({ ...formData, rabies_serial: e.target.value })}
                    placeholder="Tag or lot number" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Brand</label>
                  <input 
                    type="text" 
                    value={formData.rabies_brand}
                    onChange={e => setFormData({ ...formData, rabies_brand: e.target.value })}
                    placeholder="Vaccine manufacturer" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Type</label>
                  <select 
                    value={formData.rabies_type}
                    onChange={e => setFormData({ ...formData, rabies_type: e.target.value })}
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary/10 outline-none"
                  >
                    <option value="1-Year Vaccine">1-Year Vaccine</option>
                    <option value="3-Year Vaccine">3-Year Vaccine</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 4: TRAINING FACILITY */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Training & Accreditation</h4>
              </div>

              {/* Facility Search Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Accredited Facility (Search Member Programs)</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/30 w-4 h-4" />
                  <input 
                    type="text" 
                    value={searchFacility}
                    onChange={e => {
                      setSearchFacility(e.target.value);
                      setShowFacilityDropdown(true);
                      if (!e.target.value) {
                        setSelectedFacility(null);
                        setFormData(prev => ({ ...prev, facility_name: '' }));
                      }
                    }}
                    onFocus={() => setShowFacilityDropdown(true)}
                    placeholder="Search accredited member programs..." 
                    className="w-full pl-11 pr-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
                  />
                </div>
                {showFacilityDropdown && searchFacility && !selectedFacility && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-brand-primary/10 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                    {members.filter(m => m.name.toLowerCase().includes(searchFacility.toLowerCase())).map((m: any) => (
                      <button 
                        key={m.id} 
                        type="button" 
                        className="w-full text-left px-5 py-3.5 hover:bg-brand-surface flex items-center gap-4 border-b border-brand-primary/5 last:border-0 transition-colors"
                        onClick={() => {
                          setSelectedFacility(m);
                          setSearchFacility(m.name);
                          setShowFacilityDropdown(false);
                          setFormData(prev => ({ ...prev, facility_name: m.name }));
                        }}
                      >
                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-brand-primary/10 shrink-0 bg-brand-surface">
                          {m.img && <img src={m.img} className="w-full h-full object-cover" alt={m.name} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-brand-primary truncate">{m.name}</p>
                          <p className="text-[10px] text-brand-primary/40 font-bold">{m.country} • {m.registry_id}</p>
                        </div>
                      </button>
                    ))}
                    {members.filter(m => m.name.toLowerCase().includes(searchFacility.toLowerCase())).length === 0 && (
                      <div className="p-4 text-center text-xs font-bold text-brand-primary/30">No member programs found.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Facility Info Card */}
              {selectedFacility && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 sm:p-6 bg-brand-surface rounded-2xl sm:rounded-[2rem] border border-brand-primary/5"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Facility Name</label>
                    <p className="text-sm font-bold">{selectedFacility.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Registry ID</label>
                    <p className="text-sm font-bold">{selectedFacility.registry_id}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Country</label>
                    <p className="text-sm font-bold">{selectedFacility.country}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Phone</label>
                    <p className="text-sm font-bold">{selectedFacility.phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Website</label>
                    <p className="text-sm font-bold text-brand-primary/60">{selectedFacility.website || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Status</label>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit ${selectedFacility.status === 'Active' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'}`}>
                      {selectedFacility.status}
                    </span>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Lead Trainer Name</label>
                  <input 
                    type="text" 
                    value={formData.trainer_name}
                    onChange={e => setFormData({ ...formData, trainer_name: e.target.value })}
                    placeholder="Certified Professional Trainer" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Trained Task</label>
                  <input 
                    type="text" 
                    value={formData.trained_task}
                    onChange={e => setFormData({ ...formData, trained_task: e.target.value })}
                    placeholder="e.g. Mobility Assistance" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Completion Date</label>
                  <input 
                    type="date" 
                    value={formData.completion_date}
                    onChange={e => setFormData({ ...formData, completion_date: e.target.value })}
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/10 outline-none" 
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: ACCREDITATION & DOCUMENTS UPLOAD */}
            <div className="space-y-8 pb-6">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Required Documents</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {/* Attestation Letter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Attestation Letter</label>
                  <div className="relative border-2 border-dashed border-brand-primary/10 rounded-2xl p-4 bg-brand-surface hover:bg-brand-primary/5 transition-all text-center flex flex-col items-center justify-center min-h-[120px] cursor-pointer group">
                    <UploadCloud className="w-6 h-6 text-brand-primary/20 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-bold text-brand-primary/60 truncate max-w-full px-2">
                      {attestationFileName || 'Upload Attestation Letter (PDF/Image)'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={(e) => handleDocChange('doc_attestation', e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                </div>

                {/* Certificate */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Certificate</label>
                  <div className="relative border-2 border-dashed border-brand-primary/10 rounded-2xl p-4 bg-brand-surface hover:bg-brand-primary/5 transition-all text-center flex flex-col items-center justify-center min-h-[120px] cursor-pointer group">
                    <UploadCloud className="w-6 h-6 text-brand-primary/20 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-bold text-brand-primary/60 truncate max-w-full px-2">
                      {certificateFileName || 'Upload Certificate (PDF/Image)'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={(e) => handleDocChange('doc_certificate', e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                </div>

                {/* Service Animal ID */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Service Animal ID</label>
                  <div className="relative border-2 border-dashed border-brand-primary/10 rounded-2xl p-4 bg-brand-surface hover:bg-brand-primary/5 transition-all text-center flex flex-col items-center justify-center min-h-[120px] cursor-pointer group">
                    <UploadCloud className="w-6 h-6 text-brand-primary/20 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-bold text-brand-primary/60 truncate max-w-full px-2">
                      {idDocFileName || 'Upload Service Animal ID (PDF/Image)'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={(e) => handleDocChange('doc_id', e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                </div>

                {/* Other Documents */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Other Documents</label>
                  <div className="relative border-2 border-dashed border-brand-primary/10 rounded-2xl p-4 bg-brand-surface hover:bg-brand-primary/5 transition-all text-center flex flex-col items-center justify-center min-h-[120px] cursor-pointer group">
                    <UploadCloud className="w-6 h-6 text-brand-primary/20 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-bold text-brand-primary/60 truncate max-w-full px-2">
                      {otherFileName || 'Upload Other Documents (PDF/Image)'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={(e) => handleDocChange('doc_other', e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 border-t border-brand-primary/5 p-6 md:px-12 flex gap-4 justify-end bg-brand-surface/50">
            <button 
              type="button"
              onClick={onClose} 
              className="px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-brand-primary/5 hover:bg-brand-surface transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3 rounded-xl bg-brand-primary text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const DeleteAnimalModal = ({ isOpen, onClose, onDelete, animal }: { isOpen: boolean, onClose: () => void, onDelete?: () => void, animal: any }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen || !animal) return null;

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/animals/${animal.db_id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert('Service animal deleted from registry successfully.');
        onDelete?.();
        onClose();
      } else {
        alert(data.error || 'Failed to delete animal.');
      }
    } catch (err) {
      console.error('Error deleting animal:', err);
      alert('Network error. Failed to delete animal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl overflow-hidden border border-brand-primary/5 p-6 sm:p-8 text-center space-y-6"
      >
        <div className="w-16 h-16 bg-status-error/10 text-status-error rounded-full flex items-center justify-center mx-auto">
          <Trash2 className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-brand-primary">Delete Service Animal?</h3>
          <p className="text-sm text-brand-primary/60">
            Are you sure you want to delete <span className="font-bold text-brand-primary">{animal.name}</span> (Microchip ID: <span className="font-mono">{animal.microchip}</span>)?
          </p>
          <p className="text-xs text-status-error font-semibold">
            This action is permanent and cannot be undone.
          </p>
        </div>

        <div className="flex gap-4 pt-2">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-brand-surface rounded-xl text-brand-primary font-bold text-[10px] uppercase tracking-widest border border-brand-primary/5 hover:bg-brand-primary/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={handleDelete}
            className="flex-1 py-3 bg-status-error text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-status-error/20 hover:bg-status-error/90 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Deleting...' : 'Delete Entry'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const AdminAnimalsSection = () => {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [ownerSearch, setOwnerSearch] = React.useState('');
  const [isOwnerSelected, setIsOwnerSelected] = React.useState(false);
  const [selectedOwner, setSelectedOwner] = React.useState<any>(null);
  
  const [activeDropdownId, setActiveDropdownId] = React.useState<number | null>(null);
  const [viewAnimal, setViewAnimal] = React.useState<any>(null);
  const [editAnimal, setEditAnimal] = React.useState<any>(null);
  const [deleteAnimal, setDeleteAnimal] = React.useState<any>(null);
  
  const [animals, setAnimals] = React.useState<any[]>([]);
  const [ownersList, setOwnersList] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<any>({
    activeRegistrations: '0',
    newApplications: '0',
    certificationsIssued: '0',
    auditLogs: '0'
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState('All Statuses');
  const [breedFilter, setBreedFilter] = React.useState('All Breeds');

  const fetchAnimals = React.useCallback(() => {
    setIsLoading(true);
    fetch('/api/admin/animals')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAnimals(data.animals);
        }
      })
      .catch(err => console.error('Error fetching admin animals:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const fetchOwners = React.useCallback(() => {
    fetch('/api/admin/owners')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOwnersList(data.owners);
        }
      })
      .catch(err => console.error('Error fetching owners list:', err));
  }, []);

  const fetchStats = React.useCallback(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch(err => console.error('Error fetching admin stats:', err));
  }, []);

  React.useEffect(() => {
    fetchAnimals();
    fetchOwners();
    fetchStats();
  }, [fetchAnimals, fetchOwners, fetchStats]);

  const uniqueBreeds = React.useMemo(() => {
    const breeds = new Set<string>();
    animals.forEach(a => {
      if (a.breed) breeds.add(a.breed);
    });
    return Array.from(breeds);
  }, [animals]);

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = 
      (animal.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (animal.id || '').toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (animal.microchip || '').includes(searchQuery) ||
      (animal.handler || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All Statuses' || animal.status === statusFilter;
    const matchesBreed = breedFilter === 'All Breeds' || animal.breed === breedFilter;

    return matchesSearch && matchesStatus && matchesBreed;
  });

  const handleAddAnimalSuccess = () => {
    fetchAnimals();
    fetchStats();
  };

  return (
    <div className="space-y-10">
      <AddAnimalModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setOwnerSearch('');
          setIsOwnerSelected(false);
          setSelectedOwner(null);
        }} 
        onAdd={handleAddAnimalSuccess}
        initialOwner={isOwnerSelected && selectedOwner ? selectedOwner.name : ''}
      />
      
      <ViewAnimalModal 
        isOpen={!!viewAnimal}
        onClose={() => setViewAnimal(null)}
        animal={viewAnimal}
      />
      
      <EditAnimalModal 
        isOpen={!!editAnimal}
        onClose={() => setEditAnimal(null)}
        onUpdate={fetchAnimals}
        animal={editAnimal}
      />
      
      <DeleteAnimalModal 
        isOpen={!!deleteAnimal}
        onClose={() => setDeleteAnimal(null)}
        onDelete={() => {
          fetchAnimals();
          fetchStats();
        }}
        animal={deleteAnimal}
      />
      
      {/* Animal Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Registrations', value: stats.activeRegistrations, trend: '+4.2%', icon: <CheckCircle2 />, color: 'brand-accent' },
          { label: 'New Applications', value: stats.newApplications, trend: 'Pending Review', icon: <Clock />, color: 'status-warning' },
          { label: 'Certifications Issued', value: stats.certificationsIssued, trend: 'Last 30 days', icon: <Verified />, color: 'status-success' },
          { label: 'Audit Logs', value: stats.auditLogs, trend: 'System activities', icon: <History />, color: 'brand-primary' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-primary/5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-brand-primary/5 rounded-xl text-brand-primary">
                {React.cloneElement(stat.icon as React.ReactElement, { className: 'w-5 h-5' })}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${stat.color === 'status-warning' ? 'text-status-warning' : stat.color === 'status-success' ? 'text-status-success' : 'text-brand-accent'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="w-full max-w-full bg-white rounded-[2rem] border border-brand-primary/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-primary/5 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary/20 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search microchip, name, or handler..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-brand-surface border-none rounded-xl text-xs font-bold w-full md:w-64 placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none"
              />
            </div>
            <div className="relative w-full md:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary/20 w-4 h-4" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto pl-10 pr-8 py-2 bg-brand-surface border-none rounded-xl text-xs font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Certified">Certified</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
            <div className="relative w-full md:w-auto">
              <PawPrint className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary/20 w-4 h-4" />
              <select 
                value={breedFilter}
                onChange={(e) => setBreedFilter(e.target.value)}
                className="w-full md:w-auto pl-10 pr-8 py-2 bg-brand-surface border-none rounded-xl text-xs font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none"
              >
                <option value="All Breeds">All Breeds</option>
                {uniqueBreeds.map((breed, idx) => (
                  <option key={idx} value={breed}>{breed}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto justify-end">
            <Button 
              variant="secondary" 
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 text-xs shadow-lg shadow-brand-accent/20 group w-full sm:w-auto whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" /> 
              Add Service Animal
            </Button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="bg-brand-surface/50 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary/40">
                <th className="px-8 py-5 min-w-[200px]">Animal Name</th>
                <th className="px-8 py-5 min-w-[140px]">Microchip ID</th>
                <th className="px-8 py-5 min-w-[140px]">Breed</th>
                <th className="px-8 py-5 min-w-[160px]">Handler</th>
                <th className="px-8 py-5 min-w-[110px]">Status</th>
                <th className="px-8 py-5 text-right min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-primary/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-xs font-bold text-brand-primary/30 uppercase tracking-widest">
                    Loading service animals...
                  </td>
                </tr>
              ) : filteredAnimals.map((animal, i) => (
                <tr key={i} className="hover:bg-brand-surface group transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-primary/5 group-hover:border-brand-accent transition-all">
                        <img src={animal.img || 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=100'} alt={animal.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{animal.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">ID: {animal.registry_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono text-xs text-brand-primary/60">{animal.microchip}</td>
                  <td className="px-8 py-5 text-sm font-medium text-brand-primary/60">{animal.breed}</td>
                  <td className="px-8 py-5 text-sm font-medium text-brand-primary/60">{animal.handler || 'No Handler Linked'}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                      animal.status === 'Certified' ? 'bg-status-success/10 text-status-success' :
                      animal.status === 'Pending' ? 'bg-status-warning/10 text-status-warning' :
                      'bg-status-error/10 text-status-error'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        animal.status === 'Certified' ? 'bg-status-success' :
                        animal.status === 'Pending' ? 'bg-status-warning' :
                        'bg-status-error'
                      }`} />
                      {animal.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <div className="relative inline-block text-left">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(activeDropdownId === animal.db_id ? null : animal.db_id);
                        }}
                        className="text-brand-primary/40 hover:text-brand-primary transition-colors p-2 hover:bg-brand-surface rounded-xl"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {activeDropdownId === animal.db_id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)}></div>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-brand-primary/5 py-2 z-20 text-left">
                            <button 
                              onClick={() => {
                                setViewAnimal(animal);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-3 text-xs font-bold text-brand-primary hover:bg-brand-surface transition-colors flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4 text-brand-primary/40" /> View Details
                            </button>
                            <button 
                              onClick={() => {
                                setEditAnimal(animal);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-3 text-xs font-bold text-brand-primary hover:bg-brand-surface transition-colors flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4 text-brand-primary/40" /> Edit Info
                            </button>
                            <div className="border-t border-brand-primary/5 my-1"></div>
                            <button 
                              onClick={() => {
                                setDeleteAnimal(animal);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-3 text-xs font-bold text-status-error hover:bg-status-error/5 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4 text-status-error/60" /> Delete Animal
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredAnimals.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-brand-primary/20">
                      <Search className="w-12 h-12" />
                      <p className="text-sm font-bold uppercase tracking-widest">No animals found matching "{searchQuery}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 border-t border-brand-primary/5 flex items-center justify-between text-brand-primary/30">
          <p className="text-[10px] font-black uppercase tracking-widest">Showing {filteredAnimals.length} of {animals.length} animals</p>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-brand-surface rounded-lg disabled:opacity-20 transition-colors" disabled><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 rounded-lg bg-brand-primary text-white font-bold text-xs">1</button>
            <button className="p-2 hover:bg-brand-surface rounded-lg disabled:opacity-20 transition-colors" disabled><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminSidebar = ({ activeTab, setActiveTab, onLogout, isOpen, onClose }: { activeTab: string, setActiveTab: (tab: string) => void, onLogout?: () => void, isOpen?: boolean, onClose?: () => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'animals', label: 'Animals', icon: <PawPrint className="w-5 h-5" /> },
    { id: 'members', label: 'Members', icon: <Users className="w-5 h-5" /> },
    { id: 'applications', label: 'Applications', icon: <FileText className="w-5 h-5" /> },
    { id: 'owners', label: 'Owners', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-brand-primary/20 backdrop-blur-sm z-[100] md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-brand-primary/5 flex flex-col p-6 z-[101] transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-12 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-brand-primary leading-tight">Registry Admin</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Management Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-brand-primary/40 hover:text-brand-primary">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-grow space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={`#/admin/${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'text-brand-primary/40 hover:bg-brand-primary/5'
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>

        <div className="pt-6 border-t border-brand-primary/5 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-brand-primary/40 hover:bg-brand-primary/5 transition-all">
            <BookOpen className="w-5 h-5" />
            Support
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-status-error/60 hover:bg-status-error/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", 
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", 
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", 
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", 
  "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", 
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", 
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", 
  "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", 
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", 
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", 
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", 
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", 
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", 
  "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", 
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", 
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", 
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", 
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", 
  "Yemen", "Zambia", "Zimbabwe"
];

export const IssueCredentialsModal = ({ isOpen, onClose, onOnboard }: { isOpen: boolean, onClose: () => void, onOnboard?: () => void }) => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [country, setCountry] = React.useState('United States of America');
  const [address, setAddress] = React.useState('');
  const [password, setPassword] = React.useState('S3rv1c3!Auth2024');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setName('');
      setEmail('');
      setPhone('');
      setCountry('United States of America');
      setAddress('');
      setPassword('S3rv1c3!Auth2024');
    }
  }, [isOpen]);

  const handleGeneratePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          residential_country: country,
          address,
          password
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`New owner onboarded successfully!\nRegistry ID: ${data.registryId}`);
        onOnboard?.();
        onClose();
      } else {
        alert(data.error || 'Failed to onboard owner.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to onboard owner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5 flex flex-col"
      >
        <div className="shrink-0 bg-brand-primary p-5 sm:p-8 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-2xl font-bold tracking-tight">Issue New Credentials</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <LogOut className="w-5 h-5 rotate-180" />
            </button>
          </div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Securely onboard a new service animal owner</p>
        </div>

        <form className="flex-grow flex flex-col min-h-0" onSubmit={handleSubmit}>
          <div className="flex-grow overflow-y-auto p-5 sm:p-10 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Owner Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Robert Smith" 
                  className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="robert@example.com" 
                  className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (000) 000-0000" 
                  className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Residential Country</label>
                <div className="relative">
                  <select 
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-accent/20 outline-none"
                  >
                    {countries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/20 rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Complete Address</label>
              <input 
                type="text" 
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Street, City, State, Zip Code" 
                className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Initial Password</label>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Secure Password"
                  className="flex-grow px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-mono font-bold text-brand-primary/60 outline-none" 
                />
                <button 
                  type="button" 
                  onClick={handleGeneratePassword}
                  className="px-6 rounded-2xl bg-brand-surface text-[10px] font-black uppercase tracking-widest text-brand-primary/40 hover:bg-brand-primary/5 transition-colors"
                >
                  Auto-generate
                </button>
              </div>
            </div>
          </div>

          <div className="shrink-0 p-5 sm:p-6 md:px-10 border-t border-brand-primary/5 bg-brand-surface/30 flex gap-4 justify-end">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-brand-primary/5 hover:bg-brand-surface transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3 rounded-xl bg-brand-primary text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Onboarding...' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const IssueOwnerCredentialsModal = ({ isOpen, onClose, owner, onIssue }: { isOpen: boolean, onClose: () => void, owner: any, onIssue?: () => void }) => {
  const [password, setPassword] = React.useState('S3rv1c3!Auth2024');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setPassword('S3rv1c3!Auth2024');
    }
  }, [isOpen]);

  const handleGeneratePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/owners/${owner.id}/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Credentials issued successfully for ${owner.name}!`);
        onIssue?.();
        onClose();
      } else {
        alert(data.error || 'Failed to issue credentials.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to issue credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !owner) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5 flex flex-col"
      >
        <div className="shrink-0 bg-brand-primary p-5 sm:p-8 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-2xl font-bold tracking-tight">Issue Credentials</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <LogOut className="w-5 h-5 rotate-180" />
            </button>
          </div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Update credentials for {owner.name}</p>
        </div>

        <form className="flex-grow flex flex-col" onSubmit={handleSubmit}>
          <div className="p-5 sm:p-10 space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Owner Name</label>
              <input 
                type="text" 
                disabled 
                value={owner.name}
                className="w-full px-6 py-4 bg-brand-surface/50 border-none rounded-2xl text-sm font-bold text-brand-primary/50 outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Email Address</label>
              <input 
                type="text" 
                disabled 
                value={owner.email}
                className="w-full px-6 py-4 bg-brand-surface/50 border-none rounded-2xl text-sm font-bold text-brand-primary/50 outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Password</label>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="flex-grow px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-mono font-bold text-brand-primary/60 outline-none" 
                />
                <button 
                  type="button" 
                  onClick={handleGeneratePassword}
                  className="px-6 rounded-2xl bg-brand-surface text-[10px] font-black uppercase tracking-widest text-brand-primary/40 hover:bg-brand-primary/5 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          <div className="shrink-0 p-5 sm:p-6 md:px-10 border-t border-brand-primary/5 bg-brand-surface/30 flex gap-4 justify-end">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-brand-primary/5 hover:bg-brand-surface transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3 rounded-xl bg-brand-primary text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Updating...' : 'Issue'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const ViewOwnerModal = ({ isOpen, onClose, owner }: { isOpen: boolean, onClose: () => void, owner: any }) => {
  const [animals, setAnimals] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && owner) {
      setIsLoading(true);
      fetch(`/api/admin/owners/${owner.id}/animals`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAnimals(data.animals);
          }
        })
        .catch(err => console.error('Error fetching owner animals:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, owner]);

  if (!isOpen || !owner) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5 flex flex-col max-h-[95vh] md:max-h-[90vh]"
      >
        {/* Sticky Header */}
        <div className="p-5 sm:p-8 md:px-12 md:pt-10 md:pb-6 border-b border-brand-primary/5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-bold tracking-tight mb-1">Owner Registry Profile</h3>
            <p className="text-[10px] font-black text-brand-primary/30 uppercase tracking-widest">Member ID: {owner.registry_id}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-brand-surface rounded-2xl hover:bg-brand-primary/5 transition-colors">
            <LogOut className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-grow overflow-y-auto p-5 sm:p-8 md:p-12 space-y-8 sm:space-y-10">
          {/* Header section with photo, name & status */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start border-b border-brand-primary/5 pb-8">
            <div className="w-24 h-24 rounded-full bg-brand-surface flex items-center justify-center border-4 border-brand-primary/5 shadow-lg shrink-0 text-brand-primary/40">
              <User className="w-12 h-12" />
            </div>
            <div className="text-center sm:text-left space-y-4">
              <div>
                <h4 className="text-3xl font-bold text-brand-primary">{owner.name}</h4>
                <p className="text-sm font-semibold text-brand-primary/60">Registered Member since {owner.member_since}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                  owner.status === 'Active' ? 'bg-status-success/10 text-status-success' : 
                  owner.status === 'Suspended' ? 'bg-status-error/10 text-status-error' : 
                  'bg-status-warning/10 text-status-warning'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    owner.status === 'Active' ? 'bg-status-success' : 
                    owner.status === 'Suspended' ? 'bg-status-error' : 
                    'bg-status-warning'
                  }`} />
                  {owner.status}
                </span>
                <span className="px-4 py-1.5 bg-brand-surface rounded-full text-[10px] font-black uppercase tracking-widest text-brand-primary/60">
                  {owner.animal_count} Linked Animals
                </span>
              </div>
            </div>
          </div>

          {/* Details columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Email Address</span>
                <p className="text-sm font-bold text-brand-primary">{owner.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Phone Number</span>
                <p className="text-sm font-bold text-brand-primary">{owner.phone || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">ID Type</span>
                <p className="text-sm font-bold text-brand-primary">{owner.id_type || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Country</span>
                <p className="text-sm font-bold text-brand-primary">{owner.residential_country || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Address</span>
                <p className="text-sm font-bold text-brand-primary">{owner.address || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Last 4 Digits of ID</span>
                <p className="text-sm font-bold font-mono text-brand-primary">{owner.id_last4 ? `•••• ${owner.id_last4}` : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Uploaded ID Document */}
          <div className="space-y-4 pt-6 border-t border-brand-primary/5">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary/40">Uploaded ID Document</h4>
            <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5 flex flex-col justify-between min-h-[80px]">
              <div>
                <p className="text-xs text-brand-primary/60 truncate max-w-full">
                  {owner.id_doc ? owner.id_doc.split('/').pop() : 'Not uploaded'}
                </p>
              </div>
              {owner.id_doc && (
                <a 
                  href={owner.id_doc} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-brand-primary/80 flex items-center gap-1.5 w-fit border-b border-brand-primary/20 pb-0.5"
                >
                  View Document
                </a>
              )}
            </div>
          </div>

          {/* Linked Animals Section */}
          <div className="space-y-4 pt-6 border-t border-brand-primary/5">
            <h4 className="text-lg font-bold tracking-tight text-brand-primary">Linked Animals</h4>
            {isLoading ? (
              <p className="text-xs font-bold text-brand-primary/30 uppercase tracking-widest animate-pulse">Loading linked animals...</p>
            ) : animals.length === 0 ? (
              <p className="text-xs font-bold text-brand-primary/30 uppercase tracking-widest">No service animals linked to this account.</p>
            ) : (
              <div className="w-full overflow-x-auto border border-brand-primary/5 rounded-2xl bg-brand-surface/30">
                <table className="w-full min-w-[600px] text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-surface/80 border-b border-brand-primary/5">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Animal Name</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Microchip ID</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Breed</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-primary/5">
                    {animals.map((a, idx) => (
                      <tr key={idx} className="hover:bg-brand-surface/60 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-brand-primary">{a.name}</td>
                        <td className="px-6 py-4 text-xs font-mono text-brand-primary/60">{a.microchip}</td>
                        <td className="px-6 py-4 text-xs text-brand-primary/60">{a.breed}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            a.status === 'Certified' ? 'bg-status-success/10 text-status-success' : 
                            a.status === 'Pending' ? 'bg-status-warning/10 text-status-warning' :
                            'bg-status-error/10 text-status-error'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-brand-primary/5 p-5 sm:p-6 md:px-12 flex justify-end bg-brand-surface/30">
          <button 
            onClick={onClose} 
            className="px-10 py-3 rounded-xl bg-brand-primary text-white font-bold text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform"
          >
            Close Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const EditOwnerModal = ({ isOpen, onClose, onUpdate, owner }: { isOpen: boolean, onClose: () => void, onUpdate?: () => void, owner: any }) => {
  const [idDocFileName, setIdDocFileName] = React.useState('');
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    residential_country: '',
    address: '',
    status: 'Active',
    id_type: '',
    id_last4: '',
    id_doc: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && owner) {
      setFormData({
        name: owner.name || '',
        email: owner.email || '',
        phone: owner.phone || '',
        residential_country: owner.residential_country || '',
        address: owner.address || '',
        status: owner.status || 'Active',
        id_type: owner.id_type || '',
        id_last4: owner.id_last4 || '',
        id_doc: owner.id_doc || ''
      });
      setIdDocFileName(owner.id_doc ? (owner.id_doc.split('/').pop() || '') : '');
    }
  }, [isOpen, owner]);

  if (!isOpen || !owner) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/owners/${owner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Owner details updated successfully!');
        onUpdate?.();
        onClose();
      } else {
        alert(data.error || 'Failed to update owner details.');
      }
    } catch (err) {
      console.error('Error updating owner:', err);
      alert('Network error. Failed to update owner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5 flex flex-col max-h-[95vh] md:max-h-[90vh]"
      >
        {/* Sticky Header */}
        <div className="p-5 sm:p-8 md:px-12 md:pt-10 md:pb-6 border-b border-brand-primary/5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-bold tracking-tight mb-1">Edit Owner Details</h3>
            <p className="text-[10px] font-black text-brand-primary/30 uppercase tracking-widest">Member ID: {owner.registry_id}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-brand-surface rounded-2xl hover:bg-brand-primary/5 transition-colors">
            <LogOut className="w-5 h-5 rotate-180" />
          </button>
        </div>

        <form className="flex flex-col flex-grow overflow-hidden" onSubmit={handleSubmit}>
          {/* Scrollable Form Body */}
          <div className="flex-grow overflow-y-auto p-5 sm:p-8 md:p-12 space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jane Doe" 
                className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Email Address</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. jane.doe@example.com" 
                className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Phone Number</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +1 555-0199" 
                className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Country</label>
              <input 
                type="text" 
                value={formData.residential_country}
                onChange={e => setFormData({ ...formData, residential_country: e.target.value })}
                placeholder="e.g. United States" 
                className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Address</label>
              <textarea 
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, apartment, city, state" 
                rows={2}
                className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none resize-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Account Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary/10 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">ID Type</label>
                <select 
                  value={formData.id_type}
                  onChange={e => setFormData({ ...formData, id_type: e.target.value })}
                  className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary/10 outline-none"
                >
                  <option value="">Select ID Type</option>
                  <option value="Passport">Passport</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="National ID">National ID</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Last 4 Digits of ID</label>
                <input 
                  type="text" 
                  maxLength={4}
                  value={formData.id_last4}
                  onChange={e => setFormData({ ...formData, id_last4: e.target.value })}
                  placeholder="0000" 
                  className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/10 transition-all outline-none" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Upload Official ID Document</label>
              <div className="relative border-2 border-dashed border-brand-primary/10 rounded-2xl p-4 bg-brand-surface hover:bg-brand-primary/5 transition-all text-center flex flex-col items-center justify-center min-h-[100px] cursor-pointer group">
                <UploadCloud className="w-6 h-6 text-brand-primary/20 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[10px] font-bold text-brand-primary/60 truncate max-w-full px-2">
                  {idDocFileName || 'Upload ID scan (PDF/Image)'}
                </span>
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIdDocFileName(file.name);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, id_doc: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 border-t border-brand-primary/5 p-5 sm:p-6 md:px-12 flex gap-4 justify-end bg-brand-surface/50">
            <button 
              type="button"
              onClick={onClose} 
              className="px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-brand-primary/5 hover:bg-brand-surface transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3 rounded-xl bg-brand-primary text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const DeleteOwnerModal = ({ isOpen, onClose, onDelete, owner }: { isOpen: boolean, onClose: () => void, onDelete?: () => void, owner: any }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen || !owner) return null;

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/owners/${owner.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert('Owner account deleted from registry successfully.');
        onDelete?.();
        onClose();
      } else {
        alert(data.error || 'Failed to delete owner account.');
      }
    } catch (err) {
      console.error('Error deleting owner:', err);
      alert('Network error. Failed to delete owner account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl overflow-hidden border border-brand-primary/5 p-6 sm:p-8 text-center space-y-6"
      >
        <div className="w-16 h-16 bg-status-error/10 text-status-error rounded-full flex items-center justify-center mx-auto">
          <Trash2 className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-brand-primary">Delete Owner Account?</h3>
          <p className="text-sm text-brand-primary/60">
            Are you sure you want to delete <span className="font-bold text-brand-primary">{owner.name}</span> (ID: <span className="font-mono">{owner.registry_id}</span>)?
          </p>
          <p className="text-xs text-status-error font-semibold">
            All linked animals may lose handler credentials. This action is permanent.
          </p>
        </div>

        <div className="flex gap-4 pt-2">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-brand-surface rounded-xl text-brand-primary font-bold text-[10px] uppercase tracking-widest border border-brand-primary/5 hover:bg-brand-primary/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={handleDelete}
            className="flex-1 py-3 bg-status-error text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-status-error/20 hover:bg-status-error/90 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Deleting...' : 'Delete Owner'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const AdminOwnersSection = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [ownersList, setOwnersList] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [activeDropdownId, setActiveDropdownId] = React.useState<number | null>(null);
  const [viewOwner, setViewOwner] = React.useState<any>(null);
  const [editOwner, setEditOwner] = React.useState<any>(null);
  const [deleteOwner, setDeleteOwner] = React.useState<any>(null);
  const [issueCredentialsOwner, setIssueCredentialsOwner] = React.useState<any>(null);

  const fetchOwners = React.useCallback(() => {
    setIsLoading(true);
    fetch('/api/admin/owners')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOwnersList(data.owners);
        }
      })
      .catch(err => console.error('Error fetching admin owners:', err))
      .finally(() => setIsLoading(false));
  }, []);

  React.useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const filteredOwners = ownersList.filter(o => 
    (o.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (o.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.registry_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOwners = ownersList.length;
  const activeOwners = ownersList.filter(o => (o.animal_count || 0) > 0).length;
  const pendingOnboard = ownersList.filter(o => (o.animal_count || 0) === 0).length;

  return (
    <div className="space-y-10">
      <IssueCredentialsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onOnboard={fetchOwners}
      />

      <ViewOwnerModal 
        isOpen={!!viewOwner}
        onClose={() => setViewOwner(null)}
        owner={viewOwner}
      />

      <EditOwnerModal 
        isOpen={!!editOwner}
        onClose={() => setEditOwner(null)}
        onUpdate={fetchOwners}
        owner={editOwner}
      />

      <DeleteOwnerModal 
        isOpen={!!deleteOwner}
        onClose={() => setDeleteOwner(null)}
        onDelete={fetchOwners}
        owner={deleteOwner}
      />

      <IssueOwnerCredentialsModal 
        isOpen={!!issueCredentialsOwner}
        onClose={() => setIssueCredentialsOwner(null)}
        onIssue={fetchOwners}
        owner={issueCredentialsOwner}
      />

      {/* Global Lookup Header */}
      <section className="bg-brand-primary rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-status-success rounded-full -ml-32 -mb-32 blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-grow space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 text-brand-accent rounded-full border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-bold text-[10px] uppercase tracking-widest">Registry Authority Controls</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight">Owner Registry Lookup</h2>
            <p className="text-white/60 font-medium max-w-xl">Search the global database for verified handlers and manage their access credentials in real-time.</p>
          </div>
          <div className="w-full md:w-[400px]">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 w-6 h-6 group-focus-within:text-brand-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Find owner by name, ID or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-6 bg-white/10 backdrop-blur-xl border-2 border-white/10 rounded-3xl text-lg font-medium placeholder:text-white/30 focus:bg-white focus:text-brand-primary focus:border-brand-accent transition-all outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Summary Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-primary/5 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-brand-primary/5 rounded-2xl text-brand-primary">
              <User className="w-6 h-6" />
            </div>
            <span className="text-status-success text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <h3 className="text-brand-primary/40 font-black text-[10px] uppercase tracking-widest mb-1">Total Owners</h3>
          <p className="text-4xl font-bold tracking-tight">{totalOwners}</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-primary/5 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-brand-accent/10 rounded-2xl text-brand-primary">
              <LogOut className="w-6 h-6 rotate-180" />
            </div>
            <span className="text-brand-primary/40 text-[10px] font-black uppercase tracking-widest">With Animals</span>
          </div>
          <h3 className="text-brand-primary/40 font-black text-[10px] uppercase tracking-widest mb-1">Active Handlers</h3>
          <p className="text-4xl font-bold tracking-tight">{activeOwners}</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-primary/5 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-status-warning/10 rounded-2xl text-status-warning">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-accent text-brand-primary font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full hover:bg-brand-accent/80 transition-colors"
            >
              Issue
            </button>
          </div>
          <h3 className="text-brand-primary/40 font-black text-[10px] uppercase tracking-widest mb-1">No Animals Linked</h3>
          <p className="text-4xl font-bold tracking-tight">{pendingOnboard}</p>
        </div>
      </section>

      {/* Directory Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-primary">Registry Directory</h2>
          <p className="text-brand-primary/40 font-medium">Manage verified service animal owners and access credentials.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 rounded-xl shadow-lg shadow-brand-primary/10 group"
        >
          <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" /> 
          Issue Credentials
        </Button>
      </div>

      {/* Main Table Section */}
      <section className="w-full max-w-full bg-white rounded-[2rem] border border-brand-primary/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-primary/5 bg-brand-surface/30">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/20 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search registry records..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-white border-none rounded-xl text-xs font-bold placeholder:text-brand-primary/20 shadow-sm focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="bg-brand-surface/50">
                <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30 min-w-[200px]">Owner Name</th>
                <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30 min-w-[160px]">Contact</th>
                <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30 text-center min-w-[80px]">Animals</th>
                <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30 min-w-[140px]">Country</th>
                <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30 min-w-[120px]">Account Status</th>
                <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30 text-right min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-primary/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-xs font-bold text-brand-primary/30 uppercase tracking-widest">
                    Loading registry directory...
                  </td>
                </tr>
              ) : filteredOwners.map((owner, i) => (
                <tr key={i} className="hover:bg-brand-surface group transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center shadow-sm ring-2 ring-brand-primary/5 text-brand-primary/40 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-brand-primary">{owner.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">ID: {owner.registry_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-xs text-brand-primary/60">{owner.email}</p>
                    <p className="text-[10px] font-bold text-brand-primary/30 tracking-tight">{owner.phone}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-primary/5 text-brand-primary font-black text-[10px] border border-brand-primary/5 shadow-sm">
                      {owner.animal_count}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-xs text-brand-primary/60">{owner.residential_country}</p>
                    <p className="text-[10px] font-bold text-brand-primary/20 uppercase tracking-widest">{owner.address}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      owner.status === 'Active' 
                        ? 'bg-status-success/10 text-status-success border-status-success/20' 
                        : owner.status === 'Suspended'
                        ? 'bg-status-error/10 text-status-error border-status-error/20'
                        : 'bg-status-warning/10 text-status-warning border-status-warning/20'
                    }`}>
                      {owner.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <div className="relative inline-block text-left">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(activeDropdownId === owner.id ? null : owner.id);
                        }}
                        className="text-brand-primary/40 hover:text-brand-primary transition-colors p-2 hover:bg-brand-surface rounded-xl"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {activeDropdownId === owner.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)}></div>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-brand-primary/5 py-2 z-20 text-left">
                            <button 
                              onClick={() => {
                                setViewOwner(owner);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-3 text-xs font-bold text-brand-primary hover:bg-brand-surface transition-colors flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4 text-brand-primary/40" /> View Details
                            </button>
                            <button 
                              onClick={() => {
                                setEditOwner(owner);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-3 text-xs font-bold text-brand-primary hover:bg-brand-surface transition-colors flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4 text-brand-primary/40" /> Edit Info
                            </button>
                            <button 
                              onClick={() => {
                                setIssueCredentialsOwner(owner);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-3 text-xs font-bold text-brand-primary hover:bg-brand-surface transition-colors flex items-center gap-2"
                            >
                              <ShieldCheck className="w-4 h-4 text-brand-primary/40" /> Issue Credentials
                            </button>
                            <div className="border-t border-brand-primary/5 my-1"></div>
                            <button 
                              onClick={() => {
                                setDeleteOwner(owner);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-3 text-xs font-bold text-status-error hover:bg-status-error/5 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4 text-status-error/60" /> Delete Owner
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 bg-brand-surface/30 flex items-center justify-between text-brand-primary/30 border-t border-brand-primary/5">
          <p className="text-[10px] font-black uppercase tracking-widest">Showing {filteredOwners.length} of {ownersList.length} owners</p>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white rounded-lg disabled:opacity-20 transition-all shadow-sm" disabled><ChevronLeft className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-white rounded-lg disabled:opacity-20 transition-all shadow-sm" disabled><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </section>
    </div>
  );
};

export const isPlaceholderImg = (imgUrl: string) => {
  if (!imgUrl) return true;
  if (imgUrl.trim() === '') return true;
  if (imgUrl.includes('photo-1544568100-847a948585b9')) return true;
  return false;
};

export const getRegionAvatar = (region: string, name: string) => {
  let gradient = 'from-blue-500 to-indigo-600';
  let label = 'NA';
  
  const cleanRegion = (region || 'North America').toLowerCase();
  if (cleanRegion.includes('europe')) {
    gradient = 'from-emerald-500 to-teal-600';
    label = 'EU';
  } else if (cleanRegion.includes('asia') || cleanRegion.includes('pacific')) {
    gradient = 'from-amber-500 to-orange-600';
    label = 'AP';
  } else if (cleanRegion.includes('latin') || cleanRegion.includes('south america')) {
    gradient = 'from-rose-500 to-pink-600';
    label = 'LA';
  } else if (cleanRegion.includes('middle') || cleanRegion.includes('africa')) {
    gradient = 'from-violet-500 to-purple-600';
    label = 'ME';
  } else {
    gradient = 'from-blue-500 to-indigo-600';
    label = 'NA';
  }

  let initials = label;
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1) {
      initials = parts[0].slice(0, 2).toUpperCase();
    }
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} text-white flex flex-col items-center justify-center font-black rounded-lg uppercase shadow-inner text-center select-none`}>
      <span className="text-[14px] tracking-wider leading-none">{initials}</span>
      <span className="text-[7px] text-white/70 tracking-widest font-black uppercase mt-0.5 leading-none">{label}</span>
    </div>
  );
};

export const AddMemberModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd?: () => void }) => {
  const [name, setName] = React.useState('');
  const [website, setWebsite] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [region, setRegion] = React.useState('North America');
  const [assistanceDogType, setAssistanceDogType] = React.useState('');
  const [facilityType, setFacilityType] = React.useState('Non-Profit');
  const [disabilities, setDisabilities] = React.useState<string[]>([]);
  const [demographics, setDemographics] = React.useState<string[]>([]);
  const [geoArea, setGeoArea] = React.useState('National');
  const [otherInfo, setOtherInfo] = React.useState('');
  const [status, setStatus] = React.useState('Active');
  const [img, setImg] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setWebsite('');
      setPhone('');
      setCountry('');
      setAddress('');
      setRegion('North America');
      setAssistanceDogType('');
      setFacilityType('Non-Profit');
      setDisabilities([]);
      setDemographics([]);
      setGeoArea('National');
      setOtherInfo('');
      setStatus('Active');
      setImg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      return alert('Image size must be less than 2MB.');
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImg(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleDisability = (d: string) => {
    setDisabilities(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const toggleDemographic = (d: string) => {
    setDemographics(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter a facility name.');
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          website,
          phone,
          country,
          address,
          region,
          assistance_dog_type: assistanceDogType,
          facility_type: facilityType,
          disabilities_serviced: disabilities.join(', '),
          demographic_served: demographics.join(', '),
          geographical_area: geoArea,
          other_info: otherInfo,
          status,
          img
        })
      });
      const data = await res.json();
      if (data.success) {
        onAdd?.();
        onClose();
      } else {
        alert(data.error || 'Failed to create member program.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to add member program.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabilityOptions = ['Visual', 'Hearing', 'Mobility', 'Autism', 'Diabetes', 'Seizures', 'PTSD-Military', 'PTSD-Civilian', 'Psychiatric', 'Other Medical'];
  const demographicOptions = ['Children', 'Adult', 'Senior', 'Veterans', 'Active-Military', 'First Responders', 'All Age'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5 flex flex-col"
      >
        <div className="shrink-0 bg-brand-primary p-5 sm:p-8 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-2xl font-bold tracking-tight">Add New Member Program</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <LogOut className="w-5 h-5 rotate-180" />
            </button>
          </div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Oversee global ADI-accredited service animal facilities</p>
        </div>

        <form className="flex-grow flex flex-col min-h-0" onSubmit={handleSubmit}>
          <div className="flex-grow overflow-y-auto p-5 sm:p-10 space-y-8 sm:space-y-12">
            {/* FACILITY BASIC INFO */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Facility Information</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {/* Logo Upload Area */}
                <div className="sm:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Logo / Image</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl border border-brand-primary/5 bg-brand-surface p-2 flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {!isPlaceholderImg(img) ? (
                        <img src={img} alt="Logo preview" className="w-full h-full object-cover" />
                      ) : (
                        getRegionAvatar(region, name)
                      )}
                    </div>
                    <div className="flex-grow space-y-2">
                      <div className="flex gap-3">
                        <label className="px-5 py-2.5 bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary font-bold text-xs rounded-xl cursor-pointer transition-colors border border-brand-primary/5">
                          Choose Logo
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            className="hidden" 
                          />
                        </label>
                        {!isPlaceholderImg(img) && (
                          <button 
                            type="button" 
                            onClick={() => setImg('')}
                            className="px-5 py-2.5 bg-status-error/5 hover:bg-status-error/10 text-status-error font-bold text-xs rounded-xl transition-colors border border-status-error/5"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-brand-primary/40 font-medium">PNG or JPG under 2MB. If empty, the system will generate a custom region icon.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Facility Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Assistance Dogs International" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Website</label>
                  <input 
                    type="url" 
                    value={website} 
                    onChange={e => setWebsite(e.target.value)} 
                    placeholder="https://www.example.org" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Phone</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="+1 (000) 000-0000" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Country</label>
                  <input 
                    type="text" 
                    value={country} 
                    onChange={e => setCountry(e.target.value)} 
                    placeholder="e.g. Australia" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Region</label>
                  <select 
                    value={region} 
                    onChange={e => setRegion(e.target.value)} 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-accent/20 outline-none"
                  >
                    <option value="North America">North America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia Pacific">Asia Pacific</option>
                    <option value="Latin America">Latin America</option>
                    <option value="Middle East & Africa">Middle East & Africa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Accreditation Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)} 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-accent/20 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Address</label>
                  <textarea 
                    rows={2} 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    placeholder="e.g. 123 Main St, City, Country" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none resize-none" 
                  />
                </div>
              </div>
            </div>

            {/* ADDITIONAL INFORMATION */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Additional Information</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2 text-wrap">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Assistance Dogs Type</label>
                  <input 
                    type="text" 
                    value={assistanceDogType} 
                    onChange={e => setAssistanceDogType(e.target.value)} 
                    placeholder="e.g. Service, Guide, Hearing" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Facility Type</label>
                  <select 
                    value={facilityType} 
                    onChange={e => setFacilityType(e.target.value)} 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-accent/20 outline-none"
                  >
                    <option value="Non-Profit">Non-Profit</option>
                    <option value="Private Facility">Private Facility</option>
                    <option value="Government Agency">Government Agency</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Disabilities Serviced</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {disabilityOptions.map(d => (
                      <label key={d} className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl cursor-pointer hover:bg-brand-primary/5 transition-colors group">
                        <input 
                          type="checkbox" 
                          checked={disabilities.includes(d)} 
                          onChange={() => toggleDisability(d)} 
                          className="w-4 h-4 rounded border-brand-primary/10 text-brand-primary focus:ring-brand-primary/20" 
                        />
                        <span className="text-sm font-bold text-brand-primary group-hover:text-brand-primary/80">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Demographics Served</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {demographicOptions.map(d => (
                      <label key={d} className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl cursor-pointer hover:bg-brand-primary/5 transition-colors group">
                        <input 
                          type="checkbox" 
                          checked={demographics.includes(d)} 
                          onChange={() => toggleDemographic(d)} 
                          className="w-4 h-4 rounded border-brand-primary/10 text-brand-primary focus:ring-brand-primary/20" 
                        />
                        <span className="text-sm font-bold text-brand-primary group-hover:text-brand-primary/80">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Geographical Area</label>
                  <input 
                    type="text" 
                    value={geoArea} 
                    onChange={e => setGeoArea(e.target.value)} 
                    placeholder="e.g. National, Regional, Global" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">General Use / Other Information</label>
                <textarea 
                  rows={3} 
                  value={otherInfo} 
                  onChange={e => setOtherInfo(e.target.value)} 
                  placeholder="Additional details about the facility..." 
                  className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none resize-none" 
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 p-5 sm:p-6 md:px-10 border-t border-brand-primary/5 bg-brand-surface/30 flex gap-4 justify-end">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-brand-primary/5 hover:bg-brand-surface transition-colors"
            >
              Cancel
            </button>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="px-10 py-3 rounded-xl shadow-lg shadow-brand-primary/10">
              {isSubmitting ? 'Adding...' : 'Add Program'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const ViewMemberModal = ({ isOpen, onClose, member }: { isOpen: boolean, onClose: () => void, member: any }) => {
  if (!isOpen || !member) return null;
  
  const disabilities = member.disabilities_serviced ? member.disabilities_serviced.split(',').map((x: string) => x.trim()).filter(Boolean) : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-3xl max-h-[95vh] md:max-h-[90vh] bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5 flex flex-col"
      >
        <div className="shrink-0 bg-brand-primary p-5 sm:p-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl border border-white/10 bg-white p-2 flex items-center justify-center overflow-hidden shrink-0">
              {!isPlaceholderImg(member.img) ? (
                <img src={member.img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                getRegionAvatar(member.region, member.name)
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{member.name}</h3>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1">ID: {member.registry_id}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-5 sm:p-10 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-brand-surface p-6 rounded-2xl">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-1">Accreditation Status</p>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                member.status === 'Active' 
                  ? 'bg-status-success/10 text-status-success' 
                  : 'bg-status-warning/10 text-status-warning'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-status-success' : 'bg-status-warning'}`} />
                {member.status}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-1">Region / Country</p>
              <p className="font-bold text-sm text-brand-primary">{member.region || 'North America'} / {member.country}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-1">Address</p>
              <p className="font-bold text-sm text-brand-primary whitespace-pre-wrap">{member.address || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary/40 border-b border-brand-primary/5 pb-2">Contact Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Primary Contact</p>
                <p className="font-bold text-sm text-brand-primary">{member.contact || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Phone Number</p>
                <p className="font-bold text-sm text-brand-primary">{member.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Website</p>
                {member.website ? (
                  <a href={member.website} target="_blank" rel="noopener noreferrer" className="font-bold text-sm text-brand-accent hover:underline flex items-center gap-1">
                    Visit Site <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <p className="font-bold text-sm text-brand-primary/40">N/A</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary/40 border-b border-brand-primary/5 pb-2">Facility & Training Specifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-1">Assistance Dogs Trained</p>
                <p className="font-bold text-sm text-brand-primary">{member.assistance_dog_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-1">Facility Type</p>
                <p className="font-bold text-sm text-brand-primary">{member.facility_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-1">Demographics Served</p>
                <p className="font-bold text-sm text-brand-primary">{member.demographic_served || 'All Age'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-1">Geographical Scope</p>
                <p className="font-bold text-sm text-brand-primary">{member.geographical_area || 'National'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary/40 border-b border-brand-primary/5 pb-2">Disabilities Serviced</h4>
            <div className="flex flex-wrap gap-2">
              {disabilities.length > 0 ? (
                disabilities.map((d: string) => (
                  <span key={d} className="px-3.5 py-1.5 bg-brand-primary/5 text-brand-primary font-bold text-xs rounded-xl border border-brand-primary/5">
                    {d}
                  </span>
                ))
              ) : (
                <p className="font-bold text-xs text-brand-primary/40">No specific disability types defined.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary/40 border-b border-brand-primary/5 pb-2">General Info / Notes</h4>
            <p className="text-sm text-brand-primary/70 leading-relaxed font-medium bg-brand-surface/40 p-4 rounded-xl">
              {member.other_info || 'No additional information has been provided for this member program.'}
            </p>
          </div>
        </div>

        <div className="shrink-0 p-5 sm:p-6 md:px-10 border-t border-brand-primary/5 bg-brand-surface/30 flex justify-end">
          <Button variant="primary" onClick={onClose} className="px-10 py-3 rounded-xl shadow-lg shadow-brand-primary/10">
            Close Profile
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export const EditMemberModal = ({ isOpen, onClose, member, onEdit }: { isOpen: boolean, onClose: () => void, member: any, onEdit?: () => void }) => {
  const [name, setName] = React.useState('');
  const [website, setWebsite] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [region, setRegion] = React.useState('North America');
  const [assistanceDogType, setAssistanceDogType] = React.useState('');
  const [facilityType, setFacilityType] = React.useState('Non-Profit');
  const [disabilities, setDisabilities] = React.useState<string[]>([]);
  const [demographics, setDemographics] = React.useState<string[]>([]);
  const [geoArea, setGeoArea] = React.useState('National');
  const [otherInfo, setOtherInfo] = React.useState('');
  const [status, setStatus] = React.useState('Active');
  const [img, setImg] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && member) {
      setName(member.name || '');
      setWebsite(member.website || '');
      setPhone(member.phone || '');
      setCountry(member.country || '');
      setAddress(member.address || '');
      setRegion(member.region || 'North America');
      setAssistanceDogType(member.assistance_dog_type || '');
      setFacilityType(member.facility_type || 'Non-Profit');
      setDisabilities(member.disabilities_serviced ? member.disabilities_serviced.split(',').map((x: string) => x.trim()).filter(Boolean) : []);
      setDemographics(member.demographic_served ? member.demographic_served.split(',').map((x: string) => x.trim()).filter(Boolean) : []);
      setGeoArea(member.geographical_area || 'National');
      setOtherInfo(member.other_info || '');
      setStatus(member.status || 'Active');
      setImg(member.img || '');
    }
  }, [isOpen, member]);

  if (!isOpen || !member) return null;

  const handleImageUpload = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      return alert('Image size must be less than 2MB.');
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImg(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleDisability = (d: string) => {
    setDisabilities(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const toggleDemographic = (d: string) => {
    setDemographics(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter a facility name.');
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          website,
          phone,
          country,
          address,
          region,
          assistance_dog_type: assistanceDogType,
          facility_type: facilityType,
          disabilities_serviced: disabilities.join(', '),
          demographic_served: demographics.join(', '),
          geographical_area: geoArea,
          other_info: otherInfo,
          status,
          img
        })
      });
      const data = await res.json();
      if (data.success) {
        onEdit?.();
        onClose();
      } else {
        alert(data.error || 'Failed to update member program.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to update member program.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5 flex flex-col"
      >
        <div className="shrink-0 bg-brand-primary p-5 sm:p-8 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-2xl font-bold tracking-tight">Edit Member Program</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <LogOut className="w-5 h-5 rotate-180" />
            </button>
          </div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Update ADI-accredited service animal facility details</p>
        </div>

        <form className="flex-grow flex flex-col min-h-0" onSubmit={handleSubmit}>
          <div className="flex-grow overflow-y-auto p-5 sm:p-10 space-y-8 sm:space-y-12">
            {/* FACILITY BASIC INFO */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Facility Information</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {/* Logo Upload Area */}
                <div className="sm:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Logo / Image</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl border border-brand-primary/5 bg-brand-surface p-2 flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {!isPlaceholderImg(img) ? (
                        <img src={img} alt="Logo preview" className="w-full h-full object-cover" />
                      ) : (
                        getRegionAvatar(region, name)
                      )}
                    </div>
                    <div className="flex-grow space-y-2">
                      <div className="flex gap-3">
                        <label className="px-5 py-2.5 bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary font-bold text-xs rounded-xl cursor-pointer transition-colors border border-brand-primary/5">
                          Choose Logo
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            className="hidden" 
                          />
                        </label>
                        {!isPlaceholderImg(img) && (
                          <button 
                            type="button" 
                            onClick={() => setImg('')}
                            className="px-5 py-2.5 bg-status-error/5 hover:bg-status-error/10 text-status-error font-bold text-xs rounded-xl transition-colors border border-status-error/5"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-brand-primary/40 font-medium">PNG or JPG under 2MB. If empty, the system will generate a custom region icon.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Facility Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Assistance Dogs International" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Website</label>
                  <input 
                    type="url" 
                    value={website} 
                    onChange={e => setWebsite(e.target.value)} 
                    placeholder="https://www.example.org" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Phone</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="+1 (000) 000-0000" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Country</label>
                  <input 
                    type="text" 
                    value={country} 
                    onChange={e => setCountry(e.target.value)} 
                    placeholder="e.g. Australia" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Region</label>
                  <select 
                    value={region} 
                    onChange={e => setRegion(e.target.value)} 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-accent/20 outline-none"
                  >
                    <option value="North America">North America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia Pacific">Asia Pacific</option>
                    <option value="Latin America">Latin America</option>
                    <option value="Middle East & Africa">Middle East & Africa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Accreditation Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)} 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-accent/20 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Address</label>
                  <textarea 
                    rows={2} 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    placeholder="e.g. 123 Main St, City, Country" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none resize-none" 
                  />
                </div>
              </div>
            </div>

            {/* ADDITIONAL INFORMATION */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-brand-primary">Additional Information</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2 text-wrap">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Assistance Dogs Type</label>
                  <input 
                    type="text" 
                    value={assistanceDogType} 
                    onChange={e => setAssistanceDogType(e.target.value)} 
                    placeholder="e.g. Service, Guide, Hearing" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Facility Type</label>
                  <select 
                    value={facilityType} 
                    onChange={e => setFacilityType(e.target.value)} 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-accent/20 outline-none"
                  >
                    <option value="Non-Profit">Non-Profit</option>
                    <option value="Private Facility">Private Facility</option>
                    <option value="Government Agency">Government Agency</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Disabilities Serviced</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {['Visual', 'Hearing', 'Mobility', 'Autism', 'Diabetes', 'Seizures', 'PTSD-Military', 'PTSD-Civilian', 'Psychiatric', 'Other Medical'].map(d => (
                      <label key={d} className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl cursor-pointer hover:bg-brand-primary/5 transition-colors group">
                        <input 
                          type="checkbox" 
                          checked={disabilities.includes(d)} 
                          onChange={() => toggleDisability(d)} 
                          className="w-4 h-4 rounded border-brand-primary/10 text-brand-primary focus:ring-brand-primary/20" 
                        />
                        <span className="text-sm font-bold text-brand-primary group-hover:text-brand-primary/80">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Demographics Served</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {['Children', 'Adult', 'Senior', 'Veterans', 'Active-Military', 'First Responders', 'All Age'].map(d => (
                      <label key={d} className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl cursor-pointer hover:bg-brand-primary/5 transition-colors group">
                        <input 
                          type="checkbox" 
                          checked={demographics.includes(d)} 
                          onChange={() => toggleDemographic(d)} 
                          className="w-4 h-4 rounded border-brand-primary/10 text-brand-primary focus:ring-brand-primary/20" 
                        />
                        <span className="text-sm font-bold text-brand-primary group-hover:text-brand-primary/80">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Geographical Area</label>
                  <input 
                    type="text" 
                    value={geoArea} 
                    onChange={e => setGeoArea(e.target.value)} 
                    placeholder="e.g. National, Regional, Global" 
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">General Use / Other Information</label>
                <textarea 
                  rows={3} 
                  value={otherInfo} 
                  onChange={e => setOtherInfo(e.target.value)} 
                  placeholder="Additional details about the facility..." 
                  className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none resize-none" 
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 p-5 sm:p-6 md:px-10 border-t border-brand-primary/5 bg-brand-surface/30 flex gap-4 justify-end">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-brand-primary/5 hover:bg-brand-surface transition-colors"
            >
              Cancel
            </button>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="px-10 py-3 rounded-xl shadow-lg shadow-brand-primary/10">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const AdminMembersSection = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [regionFilter, setRegionFilter] = React.useState('All Regions');
  const [statusFilter, setStatusFilter] = React.useState('Status: All');
  const [members, setMembers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [selectedMember, setSelectedMember] = React.useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/members');
      const data = await res.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete member program "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Member program deleted successfully.');
        fetchMembers();
      } else {
        alert(data.error || 'Failed to delete member program.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to delete member program.');
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.registry_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === 'All Regions' || m.region === regionFilter;
    const matchesStatus = statusFilter === 'Status: All' || m.status === statusFilter;
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const totalPrograms = members.length;
  const pendingAccreditation = members.filter(m => m.status === 'Under Review').length;
  
  const naCount = members.filter(m => m.region === 'North America').length;
  const euCount = members.filter(m => m.region === 'Europe').length;
  const naPercent = totalPrograms > 0 ? Math.round((naCount / totalPrograms) * 100) : 0;
  const euPercent = totalPrograms > 0 ? Math.round((euCount / totalPrograms) * 100) : 0;

  return (
    <div className="space-y-10">
      <AddMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={fetchMembers} />
      <ViewMemberModal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedMember(null); }} member={selectedMember} />
      <EditMemberModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedMember(null); }} member={selectedMember} onEdit={fetchMembers} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-2">
            <span>Portal</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-primary">Member Programs</span>
          </nav>
          <h2 className="text-4xl font-bold tracking-tight text-brand-primary mb-1">Member Program Management</h2>
          <p className="text-brand-primary/40 font-medium">Oversee and validate global ADI-accredited service animal facilities.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
          <Button 
            variant="secondary" 
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = async (event) => {
                  const text = event.target?.result as string;
                  if (!text) return;
                  
                  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
                  if (lines.length < 2) return alert('CSV must contain a header and at least one data row.');
                  
                  const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
                  const membersList = [];
                  
                  for (let j = 1; j < lines.length; j++) {
                    const row = lines[j];
                    const values: string[] = [];
                    let currentVal = '';
                    let inQuotes = false;
                    
                    for (let charIndex = 0; charIndex < row.length; charIndex++) {
                      const char = row[charIndex];
                      if (char === '"' || char === "'") {
                        inQuotes = !inQuotes;
                      } else if (char === ',' && !inQuotes) {
                        values.push(currentVal.trim());
                        currentVal = '';
                      } else {
                        currentVal += char;
                      }
                    }
                    values.push(currentVal.trim());

                    const memberObj: any = {};
                    headers.forEach((header, index) => {
                      const cleanHeader = header.toLowerCase().replace(/[\s_-]+/g, '');
                      let val = values[index] || '';
                      val = val.replace(/^["']|["']$/g, '').trim();
                      
                      if (cleanHeader.includes('name')) {
                        memberObj.name = val;
                      } else if (cleanHeader.includes('country')) {
                        memberObj.country = val;
                      } else if (cleanHeader.includes('region')) {
                        memberObj.region = val;
                      } else if (cleanHeader.includes('contact')) {
                        memberObj.contact = val;
                      } else if (cleanHeader.includes('phone')) {
                        memberObj.phone = val;
                      } else if (cleanHeader.includes('website') || cleanHeader.includes('url')) {
                        memberObj.website = val;
                      } else if (cleanHeader.includes('dogtype') || cleanHeader.includes('assistance')) {
                        memberObj.assistance_dog_type = val;
                      } else if (cleanHeader.includes('facility')) {
                        memberObj.facility_type = val;
                      } else if (cleanHeader.includes('disabilit')) {
                        memberObj.disabilities_serviced = val;
                      } else if (cleanHeader.includes('demographic')) {
                        memberObj.demographic_served = val;
                      } else if (cleanHeader.includes('geo') || cleanHeader.includes('area')) {
                        memberObj.geographical_area = val;
                      } else if (cleanHeader.includes('info') || cleanHeader.includes('note')) {
                        memberObj.other_info = val;
                      } else if (cleanHeader.includes('address')) {
                        memberObj.address = val;
                      }
                    });
                    
                    if (memberObj.name) {
                      membersList.push(memberObj);
                    }
                  }

                  if (membersList.length === 0) return alert('No valid member records found in the CSV.');

                  try {
                    const res = await fetch('/api/admin/members/import', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ members: membersList })
                    });
                    const data = await res.json();
                    if (data.success) {
                      alert(`Successfully imported ${membersList.length} members!`);
                      fetchMembers();
                    } else {
                      alert(data.error || 'Failed to import members.');
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Error importing CSV.');
                  }
                };
                reader.readAsText(file);
              };
              input.click();
            }}
            className="px-4 sm:px-8 py-3 rounded-xl shadow-sm border border-brand-primary/5 bg-white hover:bg-brand-surface text-brand-primary font-bold text-xs w-full sm:w-auto"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setIsModalOpen(true)}
            className="px-4 sm:px-8 py-3 rounded-xl shadow-lg shadow-brand-primary/10 group w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" /> 
            Add New Member
          </Button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-t-2 border-brand-accent hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-brand-primary/5 rounded-2xl text-brand-primary">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-brand-primary/40 font-black text-[10px] uppercase tracking-widest mb-1">Total Programs</p>
          <h3 className="text-5xl font-bold tracking-tight mb-2">{totalPrograms}</h3>
          <p className="text-[10px] font-bold text-brand-primary/30">Active global facilities</p>
          <Building2 className="absolute -right-4 -bottom-4 w-32 h-32 text-brand-primary/5 rotate-12" />
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-t-2 border-status-warning hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-status-warning/10 rounded-2xl text-status-warning">
              <ClipboardCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-brand-primary/40 font-black text-[10px] uppercase tracking-widest mb-1">Pending Accreditation</p>
          <h3 className="text-5xl font-bold tracking-tight mb-2">{pendingAccreditation}</h3>
          <p className="text-[10px] font-bold text-brand-primary/30">Requires administrative review</p>
          <ClipboardCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-brand-primary/5 rotate-12" />
        </div>

        <div className="bg-brand-primary p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden group">
          <p className="text-white/40 font-black text-[10px] uppercase tracking-widest mb-6">Global Distribution</p>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>North America</span>
                <span>{naPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${naPercent}%` }} className="h-full bg-brand-accent rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Europe</span>
                <span>{euPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${euPercent}%` }} className="h-full bg-brand-accent rounded-full" />
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
        </div>
      </section>

      {/* Directory Table */}
      <section className="w-full max-w-full bg-white rounded-[2rem] border border-brand-primary/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-primary/5 flex flex-wrap gap-4 items-center justify-between bg-brand-surface/30">
          <div className="flex flex-wrap gap-4 items-center flex-grow max-w-3xl w-full">
            <div className="relative w-full md:w-auto md:flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/20 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search program name or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-white border-none rounded-xl text-xs font-bold placeholder:text-brand-primary/20 shadow-sm focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none"
              />
            </div>
            <select 
              value={regionFilter} 
              onChange={e => setRegionFilter(e.target.value)}
              className="w-full md:w-auto px-6 py-3 bg-white border-none rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm focus:ring-2 focus:ring-brand-accent/20 outline-none cursor-pointer"
            >
              <option value="All Regions">All Regions</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia Pacific">Asia Pacific</option>
              <option value="Latin America">Latin America</option>
              <option value="Middle East & Africa">Middle East & Africa</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full md:w-auto px-6 py-3 bg-white border-none rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm focus:ring-2 focus:ring-brand-accent/20 outline-none cursor-pointer"
            >
              <option value="Status: All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead>
              <tr className="bg-brand-surface/50">
                <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30 min-w-[240px]">Program Name</th>
                <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30 min-w-[150px]">Region / Country</th>
                <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30 min-w-[150px]">Accreditation Status</th>
                <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30 min-w-[150px]">Primary Contact</th>
                <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30 min-w-[120px]">Last Audit</th>
                <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30 text-right min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-primary/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-xs font-bold text-brand-primary/30 uppercase tracking-widest">
                    Loading member programs...
                  </td>
                </tr>
              ) : filteredMembers.map((member, i) => (
                <tr key={i} className="hover:bg-brand-surface group transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl border border-brand-primary/5 bg-white p-2 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                        {!isPlaceholderImg(member.img) ? (
                          <img src={member.img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          getRegionAvatar(member.region, member.name)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-brand-primary">{member.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">ID: {member.registry_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-xs text-brand-primary/60">{member.region}</p>
                    <p className="text-[10px] font-bold text-brand-primary/30 uppercase">{member.country}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                      member.status === 'Active' 
                        ? 'bg-status-success/10 text-status-success' 
                        : member.status === 'Under Review'
                        ? 'bg-status-warning/10 text-status-warning'
                        : 'bg-status-error/10 text-status-error'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        member.status === 'Active' ? 'bg-status-success' : member.status === 'Under Review' ? 'bg-status-warning' : 'bg-status-error'
                      }`} />
                      {member.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-xs text-brand-primary/60">{member.contact}</p>
                    <p className="text-[10px] font-bold text-brand-primary/30">{member.phone}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-xs text-brand-primary/60">{member.lastAudit}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setSelectedMember(member); setIsViewModalOpen(true); }} className="p-2 text-brand-primary/40 hover:text-brand-primary hover:bg-white rounded-lg transition-all shadow-hover" title="View Profile"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => { setSelectedMember(member); setIsEditModalOpen(true); }} className="p-2 text-brand-primary/40 hover:text-brand-primary hover:bg-white rounded-lg transition-all shadow-hover" title="Edit Facility"><Settings className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(member.id, member.name)} className="p-2 text-status-error hover:bg-white rounded-lg transition-all shadow-hover" title="Delete Facility"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-brand-primary/20">
                      <Search className="w-12 h-12" />
                      <p className="text-sm font-bold uppercase tracking-widest">No programs found matching filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 bg-brand-surface/30 flex items-center justify-between text-brand-primary/30 border-t border-brand-primary/5">
          <p className="text-[10px] font-black uppercase tracking-widest">Showing {filteredMembers.length} of {totalPrograms} programs</p>
        </div>
      </section>
    </div>
  );
};

export const ViewApplicationModal = ({ isOpen, onClose, app, type }: { isOpen: boolean, onClose: () => void, app: any, type: 'general' | 'airline' }) => {
  if (!isOpen || !app) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5 flex flex-col"
      >
        <div className="shrink-0 bg-brand-primary p-5 sm:p-8 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">
              {type === 'general' ? 'General Registration Application' : 'Travel / Airline Request'}
            </h3>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1">ID: {app.id}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <XCircle className="w-6 h-6 rotate-180" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-5 sm:p-10 space-y-8 sm:space-y-12">
          {/* General App Content */}
          {type === 'general' ? (
            <>
              {/* Pet Photo & Main Info */}
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start pb-8 border-b border-brand-primary/5">
                <div className="w-28 h-28 sm:w-36 sm:h-36 bg-brand-surface rounded-2xl sm:rounded-[2rem] border border-brand-primary/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {app.pet_photo ? (
                    <img src={app.pet_photo} alt={app.pet_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-brand-primary/20">
                      <ImagePlus className="w-8 h-8" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">No Photo</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4 flex-grow">
                  <div className="flex flex-wrap gap-3 items-center">
                    <h4 className="text-3xl font-bold tracking-tight text-brand-primary">{app.pet_name}</h4>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                      app.status === 'Approved' || app.status === 'Verified' || app.status === 'Certified'
                        ? 'bg-status-success/10 text-status-success' 
                        : app.status === 'Pending' || app.status === 'New'
                        ? 'bg-status-warning/10 text-status-warning'
                        : 'bg-status-error/10 text-status-error'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        app.status === 'Approved' || app.status === 'Verified' || app.status === 'Certified' ? 'bg-status-success' : app.status === 'Pending' || app.status === 'New' ? 'bg-status-warning' : 'bg-status-error'
                      }`} />
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-brand-primary/60">{app.pet_breed || 'Unknown breed'} • {app.pet_gender || 'Male'} • {app.pet_weight ? `${app.pet_weight} lbs` : 'Weight N/A'}</p>
                  <p className="text-xs font-medium text-brand-primary/40">Submitted Date: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                </div>
              </div>

              {/* Handler/Owner details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-brand-primary/5 pb-3">
                  <User className="w-5 h-5 text-brand-primary/40" />
                  <h5 className="font-bold text-sm text-brand-primary uppercase tracking-wider">Handler / Owner Information</h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Full Name</p>
                    <p className="font-bold text-sm text-brand-primary">{app.handler_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Email Address</p>
                    <p className="font-bold text-sm text-brand-primary">{app.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Phone Number</p>
                    <p className="font-bold text-sm text-brand-primary">{app.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Country / Address</p>
                    <p className="font-bold text-sm text-brand-primary">{app.country || 'N/A'}{app.address ? ` • ${app.address}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">ID Verification Info</p>
                    <p className="font-bold text-sm text-brand-primary">{app.id_type || 'Passport'} (Ending in {app.id_last4 || 'XXXX'})</p>
                  </div>
                </div>
              </div>

              {/* Animal Specific Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-brand-primary/5 pb-3">
                  <PawPrint className="w-5 h-5 text-brand-primary/40" />
                  <h5 className="font-bold text-sm text-brand-primary uppercase tracking-wider">Animal Registration Details</h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Microchip ID</p>
                    <p className="font-bold text-sm text-brand-primary">{app.pet_microchip || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Date of Birth</p>
                    <p className="font-bold text-sm text-brand-primary">{app.pet_dob ? new Date(app.pet_dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Coat Color</p>
                    <p className="font-bold text-sm text-brand-primary">{app.pet_color || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Rabies details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-brand-primary/5 pb-3">
                  <ShieldCheck className="w-5 h-5 text-brand-primary/40" />
                  <h5 className="font-bold text-sm text-brand-primary uppercase tracking-wider">Rabies Vaccination Status</h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Vaccine Brand / Manufacturer</p>
                    <p className="font-bold text-sm text-brand-primary">{app.rabies_brand || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Serial / Batch Number</p>
                    <p className="font-bold text-sm text-brand-primary">{app.rabies_serial || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Vaccine Type</p>
                    <p className="font-bold text-sm text-brand-primary">{app.rabies_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Expiration Date</p>
                    <p className="font-bold text-sm text-brand-accent">{app.rabies_expiration ? new Date(app.rabies_expiration).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Facility & Training info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-brand-primary/5 pb-3">
                  <Building2 className="w-5 h-5 text-brand-primary/40" />
                  <h5 className="font-bold text-sm text-brand-primary uppercase tracking-wider">Accredited Training Facility Details</h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Training Facility Name</p>
                    <p className="font-bold text-sm text-brand-primary">{app.facility_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Lead Trainer Name</p>
                    <p className="font-bold text-sm text-brand-primary">{app.trainer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Trained Tasks / Actions</p>
                    <p className="font-bold text-sm text-brand-primary">{app.trained_task || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Accreditation Completion Date</p>
                    <p className="font-bold text-sm text-brand-primary">{app.completion_date ? new Date(app.completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Airline Request Content */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pb-8 border-b border-brand-primary/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-1">Status</p>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                    app.status === 'Verified' || app.status === 'Approved'
                      ? 'bg-status-success/10 text-status-success' 
                      : 'bg-status-warning/10 text-status-warning'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'Verified' || app.status === 'Approved' ? 'bg-status-success' : 'bg-status-warning'}`} />
                    {app.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-1">Departure Date</p>
                  <p className="font-bold text-sm text-brand-accent">{app.departureDate || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-brand-primary/5 pb-3">
                  <User className="w-5 h-5 text-brand-primary/40" />
                  <h5 className="font-bold text-sm text-brand-primary uppercase tracking-wider">Traveler Details</h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Primary Passenger</p>
                    <p className="font-bold text-sm text-brand-primary">{app.applicant}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Email Address</p>
                    <p className="font-bold text-sm text-brand-primary">{app.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-brand-primary/5 pb-3">
                  <Plane className="w-5 h-5 text-brand-primary/40" />
                  <h5 className="font-bold text-sm text-brand-primary uppercase tracking-wider">Flight Specifications</h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Flight Number</p>
                    <p className="font-bold text-sm text-brand-primary">{app.flight || app.detail?.match(/Flight #(.+)\)/)?.[1] || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Booking / Ticket Number</p>
                    <p className="font-bold text-sm text-brand-primary">{app.ticketNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-0.5">Route / Destinations</p>
                    <p className="font-bold text-sm text-brand-primary">{app.route || app.detail?.replace(/\(Flight #.+\)/, '').trim() || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="shrink-0 p-5 sm:p-6 md:px-10 border-t border-brand-primary/5 bg-brand-surface/30 flex justify-end">
          <Button variant="primary" onClick={onClose} className="px-10 py-3 rounded-xl shadow-lg shadow-brand-primary/10">
            Close Profiles
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export const AdminApplicationsSection = () => {
  const [activeTab, setActiveTab] = React.useState<'general' | 'airline'>('general');
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const [generalApplications, setGeneralApplications] = React.useState<any[]>([]);
  const [airlineRequests, setAirlineRequests] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [selectedApp, setSelectedApp] = React.useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);

  const fetchGeneral = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/applications');
      const data = await res.json();
      if (data.success) {
        setGeneralApplications(data.applications);
      }
    } catch (err) {
      console.error('Error fetching general apps:', err);
    }
  }, []);

  const fetchTravel = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/travel');
      const data = await res.json();
      if (data.success) {
        setAirlineRequests(data.requests);
      }
    } catch (err) {
      console.error('Error fetching travel requests:', err);
    }
  }, []);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    if (activeTab === 'general') {
      await fetchGeneral();
    } else {
      await fetchTravel();
    }
    setIsLoading(false);
  }, [activeTab, fetchGeneral, fetchTravel]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAction = async (id: string | number, status: string) => {
    try {
      const url = activeTab === 'general' 
        ? `/api/admin/applications/${id}` 
        : `/api/admin/travel/${id}`;
        
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Application status updated to ${status} successfully!`);
        loadData();
      } else {
        alert(data.error || 'Failed to update status.');
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      alert('Network error. Failed to update application status.');
    }
  };

  const currentData = activeTab === 'general' 
    ? generalApplications.map(app => ({
        id: app.id,
        applicant: app.handler_name || 'N/A',
        email: app.email || 'N/A',
        detail: `${app.pet_name} (${app.pet_breed || 'Unknown breed'})`,
        date: app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
        status: app.status,
        raw: app
      }))
    : airlineRequests.map(req => ({
        ...req,
        raw: req
      }));

  const filteredData = currentData.filter(item => 
    (item.applicant || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.id || '').toString().includes(searchQuery)
  );

  const pendingGeneral = generalApplications.filter(a => a.status === 'Pending').length;
  const pendingTravel = airlineRequests.filter(t => t.status === 'Pending' || t.status === 'Urgent').length;

  return (
    <div className="space-y-10">
      <ViewApplicationModal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedApp(null); }} app={selectedApp} type={activeTab} />

      {/* Statistics Portfolio */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-t-2 border-brand-primary hover:shadow-md transition-shadow group">
          <p className="text-brand-primary/40 font-black text-[10px] uppercase tracking-widest mb-1">Total Pending Apps</p>
          <h3 className="text-4xl font-bold tracking-tight text-brand-primary">{pendingGeneral}</h3>
          <p className="text-status-success text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-4">
            <TrendingUp className="w-3 h-3" /> Registration forms
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-t-2 border-brand-accent hover:shadow-md transition-shadow group">
          <p className="text-brand-primary/40 font-black text-[10px] uppercase tracking-widest mb-1">Pending Travel Requests</p>
          <h3 className="text-4xl font-bold tracking-tight text-brand-primary">{pendingTravel}</h3>
          <p className="text-brand-primary/20 text-[10px] font-black uppercase tracking-widest mt-4">Required for travel certification</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-t-2 border-status-warning hover:shadow-md transition-shadow group">
          <p className="text-brand-primary/40 font-black text-[10px] uppercase tracking-widest mb-1">Total Received</p>
          <h3 className="text-4xl font-bold tracking-tight text-brand-primary">{generalApplications.length}</h3>
          <p className="text-status-warning text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-4">
            <AlertCircle className="w-3 h-3" /> All time general entries
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-t-2 border-brand-primary/10 hover:shadow-md transition-shadow group">
          <p className="text-brand-primary/40 font-black text-[10px] uppercase tracking-widest mb-1">Total Travel</p>
          <h3 className="text-4xl font-bold tracking-tight text-brand-primary">{airlineRequests.length}</h3>
          <p className="text-brand-primary/20 text-[10px] font-black uppercase tracking-widest mt-4">Global Travel Sync Active</p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="w-full max-w-full bg-white rounded-[2rem] border border-brand-primary/5 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Tab Headers */}
        <div className="flex border-b border-brand-primary/5 px-8 relative">
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-8 py-5 text-xs font-bold transition-all relative z-10 ${
              activeTab === 'general' ? 'text-brand-primary' : 'text-brand-primary/30 hover:text-brand-primary/60'
            }`}
          >
            General Applications
            {activeTab === 'general' && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('airline')}
            className={`px-8 py-5 text-xs font-bold transition-all relative z-10 ${
              activeTab === 'airline' ? 'text-brand-primary' : 'text-brand-primary/30 hover:text-brand-primary/60'
            }`}
          >
            Airline Travel Requests
            {activeTab === 'airline' && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
            )}
          </button>
        </div>

        {/* Filters and Actions */}
        <div className="p-6 border-b border-brand-primary/5 bg-brand-surface/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 items-center flex-grow max-w-2xl w-full">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/20 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search passenger, pet, route or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-white border-none rounded-xl text-xs font-bold placeholder:text-brand-primary/20 shadow-sm focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none"
              />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Showing {filteredData.length} of {currentData.length} results</p>
        </div>

        {/* Dynamic Table */}
        <div className="w-full flex-1 overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead>
              <tr className="bg-brand-surface/50 text-[10px] font-black uppercase tracking-widest text-brand-primary/30">
                <th className="px-8 py-5 min-w-[200px]">Applicant Info</th>
                <th className="px-8 py-5 min-w-[240px]">{activeTab === 'general' ? 'Animal Information' : 'Route / Flight Details'}</th>
                <th className="px-8 py-5 min-w-[120px]">Submitted</th>
                {activeTab === 'airline' && <th className="px-8 py-5 min-w-[120px]">Departure</th>}
                <th className="px-8 py-5 min-w-[120px]">Status</th>
                <th className="px-8 py-5 text-right min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-primary/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-xs font-bold text-brand-primary/30 uppercase tracking-widest">
                    Loading applications...
                  </td>
                </tr>
              ) : filteredData.map((item, i) => (
                <tr key={i} className="hover:bg-brand-surface group transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary font-bold text-sm shadow-sm ring-2 ring-brand-primary/5">
                        {(item.applicant || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-brand-primary">{item.applicant}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">{item.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-xs text-brand-primary/60">{item.detail}</p>
                    {activeTab === 'airline' && (item as any).ticketNumber && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent mt-1">Ticket: {(item as any).ticketNumber}</p>
                    )}
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20 mt-0.5">ID: {item.id}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-brand-primary/40">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{item.date}</span>
                    </div>
                  </td>
                  {activeTab === 'airline' && (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-brand-accent">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{(item as any).departureDate}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      item.status === 'Urgent' ? 'bg-status-error/10 text-status-error' :
                      item.status === 'New' || item.status === 'Pending' ? 'bg-status-warning/10 text-status-warning' :
                      item.status === 'Approved' || item.status === 'Verified' || item.status === 'Certified' ? 'bg-status-success/10 text-status-success' :
                      'bg-brand-primary/5 text-brand-primary/40'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-bold text-xs">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => { setSelectedApp(item.raw); setIsViewModalOpen(true); }}
                        className="p-2 text-brand-primary/40 hover:text-brand-primary hover:bg-white rounded-lg transition-all shadow-hover" 
                        title="View Application Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(item.status === 'Pending' || item.status === 'New' || item.status === 'Urgent' || item.status === 'Verification') && (
                        <>
                          <button 
                            onClick={() => handleAction(item.id, activeTab === 'general' ? 'Approved' : 'Verified')}
                            className="p-2 text-status-success hover:bg-white rounded-lg transition-all shadow-hover" 
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleAction(item.id, 'Rejected')}
                            className="p-2 text-status-error hover:bg-white rounded-lg transition-all shadow-hover" 
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredData.length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'airline' ? 6 : 5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-brand-primary/20">
                      <Search className="w-12 h-12" />
                      <p className="text-sm font-bold uppercase tracking-widest">No applications found matching "{searchQuery}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export const AdminChangePasswordModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const userStr = localStorage.getItem('currentUser');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || !user.id) {
        setError('Admin session not found. Please log in again.');
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/admin/password/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to change password.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5 p-5 sm:p-8 flex flex-col gap-6"
      >
        <div className="flex justify-between items-center pb-4 border-b border-brand-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/5 text-brand-primary flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-brand-primary text-lg">Change Admin Password</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mt-0.5">Secure credential update</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-brand-primary/5 rounded-xl transition-colors text-brand-primary/40 hover:text-brand-primary">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-status-error/10 border border-status-error/20 text-status-error rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 bg-status-success/10 border border-status-success/20 text-status-success rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-1.5 block">Current Password</label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-brand-surface border-none rounded-xl text-sm font-semibold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-1.5 block">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-brand-surface border-none rounded-xl text-sm font-semibold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mb-1.5 block">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-brand-surface border-none rounded-xl text-sm font-semibold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-brand-primary/5">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const AdminHeader = ({ title = 'Dashboard Overview', onMenuClick }: { title?: string, onMenuClick?: () => void }) => {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  
  // App Viewer states for viewing applications directly from notifications
  const [selectedApp, setSelectedApp] = React.useState<any>(null);
  const [viewType, setViewType] = React.useState<'general' | 'airline'>('general');
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Check for new applications every 10s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleNotificationClick = async (notif: any) => {
    setIsNotificationsOpen(false);
    try {
      const url = notif.type === 'general' 
        ? `/api/admin/applications/${notif.rawId}`
        : `/api/admin/travel/${notif.rawId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        const appObj = notif.type === 'general' ? data.application : data.request;
        setSelectedApp(appObj);
        setViewType(notif.type);
        setIsViewModalOpen(true);
      } else {
        alert(data.error || 'Failed to fetch details.');
      }
    } catch (err) {
      console.error('Error fetching notification details:', err);
      alert('Network error. Failed to load details.');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-brand-primary/5 px-4 md:px-10 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 bg-brand-surface rounded-xl text-brand-primary/60 hover:text-brand-primary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-brand-primary truncate max-w-[150px] md:max-w-none">{title}</h2>
      </div>
      
      {/* Modal containers */}
      <AdminChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
      <ViewApplicationModal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedApp(null); }} app={selectedApp} type={viewType} />

      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/20 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search registry..." 
            className="pl-10 pr-4 py-2 bg-brand-surface border-none rounded-full text-xs font-bold w-64 placeholder:text-brand-primary/20"
          />
        </div>
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
              className={`p-2 rounded-xl transition-all relative ${isNotificationsOpen ? 'bg-brand-primary/5 text-brand-primary' : 'text-brand-primary/30 hover:text-brand-primary'}`}
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] bg-brand-accent text-brand-primary text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Container */}
            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-brand-primary/5 shadow-2xl overflow-hidden z-50 flex flex-col max-h-[400px]">
                  <div className="p-4 border-b border-brand-primary/5 bg-brand-surface/30 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Notifications</span>
                    {notifications.length > 0 && (
                      <span className="text-[8px] font-black bg-brand-accent/15 text-brand-accent px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {notifications.length} Pending
                      </span>
                    )}
                  </div>
                  <div className="overflow-y-auto divide-y divide-brand-primary/5 flex-grow">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-brand-primary/30">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-widest">All caught up!</p>
                      </div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => handleNotificationClick(notif)} 
                          className="w-full p-4 text-left hover:bg-brand-surface transition-colors flex gap-3 items-start group"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            notif.type === 'general' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-status-success/10 text-status-success'
                          }`}>
                            {notif.type === 'general' ? <FileText className="w-4 h-4" /> : <Plane className="w-4 h-4" />}
                          </div>
                          <div className="flex-grow">
                            <p className="text-xs font-semibold text-brand-primary group-hover:text-brand-accent transition-colors leading-normal">{notif.label}</p>
                            <span className="text-[8px] font-black uppercase tracking-widest text-brand-primary/35 mt-1 block">
                              {new Date(notif.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="p-2 text-brand-primary/30 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"
            title="Account Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-brand-primary/5"></div>
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-full border-2 border-brand-primary/5 overflow-hidden group-hover:border-brand-accent transition-all">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" 
                alt="Admin" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const AdminStats = () => {
  const [stats, setStats] = React.useState<any>({
    activeRegistrations: '0',
    newApplications: '0',
    certificationsIssued: '0',
    auditLogs: '0'
  });

  React.useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch(err => console.error('Error fetching admin stats:', err));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Active Registrations', value: stats.activeRegistrations || '0', trend: 'Registered', icon: <PawPrint />, color: 'brand-primary' },
        { label: 'Certifications Issued', value: stats.certificationsIssued || '0', trend: 'Verified', icon: <Building2 />, color: 'brand-accent' },
        { label: 'Pending Apps', value: stats.newApplications || '0', trend: parseInt(stats.newApplications || '0') > 0 ? 'Urgent' : 'Stable', icon: <Clock />, color: 'status-warning' },
        { label: 'Audit Logs', value: stats.auditLogs || '0', trend: 'Sync Active', icon: <Globe />, color: 'brand-primary' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-primary/5 hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 bg-brand-primary/5 rounded-xl text-brand-primary group-hover:scale-110 transition-transform`}>
              {React.cloneElement(stat.icon as React.ReactElement, { className: 'w-6 h-6' })}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${stat.trend === 'Urgent' ? 'text-status-error' : 'text-status-success'}`}>
              {stat.trend === 'Urgent' && <AlertCircle className="w-3 h-3 inline mr-1" />}
              {stat.trend}
            </span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">{stat.label}</p>
          <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
        </div>
      ))}
    </div>
  );
};

export const AdminRecentActivity = () => {
  const [activities, setActivities] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/admin/activities')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setActivities(data.activities);
        }
      })
      .catch(err => console.error('Error fetching admin activities:', err));
  }, []);

  const getRelativeTime = (createdStr: string) => {
    if (!createdStr) return 'Just now';
    const date = new Date(createdStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityConfig = (action: string, details: string) => {
    const act = (action || '').toLowerCase();
    const det = (details || '').toLowerCase();

    let type: 'success' | 'warning' | 'info' = 'info';
    let icon = <FileText className="w-5 h-5" />;

    if (act.includes('auth')) {
      type = 'success';
      icon = <CheckCircle2 className="w-5 h-5" />;
    } else if (act.includes('password')) {
      type = 'success';
      icon = <Lock className="w-5 h-5" />;
    } else if (act.includes('travel') || act.includes('airline')) {
      icon = <Plane className="w-5 h-5" />;
      if (det.includes('approved') || det.includes('verified')) {
        type = 'success';
      } else if (det.includes('rejected')) {
        type = 'warning';
      }
    } else if (act.includes('application')) {
      icon = <FileText className="w-5 h-5" />;
      if (det.includes('approved') || det.includes('verified')) {
        type = 'success';
      } else if (det.includes('rejected')) {
        type = 'warning';
      }
    } else if (act.includes('deletion') || act.includes('removal')) {
      type = 'warning';
      icon = <Trash2 className="w-5 h-5" />;
    } else if (act.includes('addition') || act.includes('registration') || act.includes('onboarding')) {
      type = 'success';
      icon = <PlusCircle className="w-5 h-5" />;
    } else if (act.includes('update')) {
      type = 'info';
      icon = <Edit className="w-5 h-5" />;
    }

    return { type, icon };
  };

  return (
    <div className="bg-white rounded-[2rem] border border-brand-primary/5 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-brand-primary/5 flex justify-between items-center">
        <h3 className="text-xl font-bold">Recent Activity</h3>
      </div>
      <div className="p-8 space-y-8 flex-grow overflow-y-auto max-h-[400px]">
        {activities.length === 0 ? (
          <p className="text-xs font-bold text-brand-primary/30 uppercase tracking-widest text-center py-10">No recent activities.</p>
        ) : activities.map((item, i) => {
          const { type, icon } = getActivityConfig(item.action, item.details);
          return (
            <div key={i} className="flex gap-4 text-left">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                type === 'success' ? 'bg-status-success/10 text-status-success' :
                type === 'warning' ? 'bg-status-warning/10 text-status-warning' :
                'bg-brand-primary/5 text-brand-primary'
              }`}>
                {icon}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start gap-4">
                  <p className="text-sm font-medium leading-relaxed text-brand-primary">{item.details}</p>
                  <span className="text-[10px] whitespace-nowrap font-bold text-brand-primary/30 uppercase tracking-widest" title={item.formatted_date}>
                    {getRelativeTime(item.created_at)}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-widest mt-1">Action: {item.action}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AdminQuickActions = ({ onTabChange }: { onTabChange?: (tab: string) => void }) => (
  <div className="bg-brand-primary rounded-[2rem] p-8 shadow-xl flex flex-col h-full text-white">
    <h3 className="text-xl font-bold mb-8">Quick Actions</h3>
    <div className="space-y-3 flex-grow">
      {[
        { id: 'animals', label: 'Register Animal', sub: 'Start a new certification', icon: <PlusCircle />, color: 'bg-brand-accent text-brand-primary' },
        { id: 'members', label: 'Search Members', sub: 'Find registered organizations', icon: <Search />, color: 'bg-white/10 text-white' },
        { id: 'applications', label: 'Generate Reports', sub: 'Monthly compliance summary', icon: <FileText />, color: 'bg-white/10 text-white' },
        { id: 'owners', label: 'Member Bulletin', sub: 'Send mass notification', icon: <Mail />, color: 'bg-white/10 text-white' }
      ].map((action, i) => (
        <a 
          key={i} 
          href={`#/admin/${action.id}`}
          onClick={() => onTabChange?.(action.id)}
          className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group text-left"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${action.color}`}>
            {React.cloneElement(action.icon as React.ReactElement, { className: 'w-5 h-5' })}
          </div>
          <div>
            <p className="font-bold text-sm">{action.label}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{action.sub}</p>
          </div>
        </a>
      ))}
    </div>
    <div className="mt-8 p-6 bg-white/5 rounded-[1.5rem] border border-white/5">
      <div className="flex items-center gap-3 mb-4">
        <ShieldCheck className="w-5 h-5 text-brand-accent" />
        <p className="font-bold text-sm tracking-tight">System Health</p>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-status-success w-[98%]"></div>
      </div>
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-3">All services operational • 99.9% Uptime</p>
    </div>
  </div>
);

export const AdminDashboardBanner = () => (
  <div className="relative w-full h-48 rounded-[2rem] overflow-hidden group shadow-xl">
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=1600" 
        alt="Banner" 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-primary/80 to-transparent"></div>
    </div>
    <div className="relative z-10 h-full flex flex-col justify-center px-12 md:px-20 text-white">
      <span className="inline-block py-1 px-3 bg-brand-accent text-brand-primary font-black text-[10px] uppercase tracking-widest rounded-lg mb-4 w-fit">Service Update</span>
      <h3 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight max-w-lg">New Airline Compliance Standards Released for 2025</h3>
      <p className="text-white/60 mb-6 font-light max-w-md">Review the updated documentation requirements for domestic emotional support travel.</p>
      <button className="flex items-center gap-2 font-bold text-brand-accent uppercase tracking-widest text-xs hover:gap-4 transition-all group">
        Review Changes <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export const OwnerSidebar = ({ activeTab, setActiveTab, onLogout, isOpen, onClose }: { activeTab: string, setActiveTab: (tab: string) => void, onLogout?: () => void, isOpen?: boolean, onClose?: () => void }) => {
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  React.useEffect(() => {
    const cached = localStorage.getItem('currentUser');
    if (cached) {
      setCurrentUser(JSON.parse(cached));
    }
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'animals', label: 'My Animals', icon: <PawPrint className="w-5 h-5" /> },
    { id: 'travel', label: 'Travel Requests', icon: <Plane className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-brand-primary/20 backdrop-blur-sm z-[100] md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-brand-primary/5 flex flex-col p-6 z-[101] transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-12 px-2">
          <h1 className="text-2xl font-bold text-brand-primary tracking-tight">ADI Global</h1>
          <button onClick={onClose} className="md:hidden p-2 text-brand-primary/40 hover:text-brand-primary">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <a href="#/owner/profile" className="flex items-center gap-3 mb-12 p-3 bg-brand-primary/5 rounded-2xl cursor-pointer hover:bg-brand-primary/10 transition-colors" onClick={() => setActiveTab('profile')}>
          <div className="w-10 h-10 rounded-full border-2 border-brand-accent overflow-hidden bg-brand-surface flex items-center justify-center">
            {currentUser?.img ? (
              <img 
                src={currentUser.img} 
                alt="Owner" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-6 h-6 text-brand-primary/30" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-brand-primary truncate">{currentUser?.name || 'Loading...'}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 truncate">ID: {currentUser?.registry_id || '...'}</p>
          </div>
        </a>

        <nav className="flex-grow space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={`#/owner/${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'text-brand-primary/40 hover:bg-brand-primary/5'
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>

        <div className="pt-6 border-t border-brand-primary/5 space-y-2">
          <a 
            href="#/owner/settings"
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'settings' 
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                : 'text-brand-primary/40 hover:bg-brand-primary/5'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </a>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-status-error/60 hover:bg-status-error/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export const OwnerHeader = ({ title, setActiveTab, onMenuClick }: { title: string, setActiveTab: (tab: string) => void, onMenuClick?: () => void }) => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  React.useEffect(() => {
    const cached = localStorage.getItem('currentUser');
    if (cached) {
      setCurrentUser(JSON.parse(cached));
    }
  }, []);

  const notifications = [
    { id: 1, title: 'Travel Authorization Approved', message: 'Your request for Flight AA123 has been approved.', date: 'Just now', unread: true },
  ];

  const displayName = currentUser?.name || 'Elena Rodriguez';
  const displayId = currentUser?.registry_id || 'REG-7721';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-brand-primary/5 px-4 md:px-10 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 bg-brand-surface rounded-xl text-brand-primary/60 hover:text-brand-primary transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-brand-primary truncate max-w-[150px] md:max-w-none">{title}</h2>
      </div>
      <div className="flex items-center gap-2 md:gap-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-brand-primary/30 hover:text-brand-primary transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-accent rounded-full border-2 border-white animate-pulse"></span>
          </button>

          {showNotifications && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-brand-primary/5 overflow-hidden ring-4 ring-brand-primary/5"
            >
              <div className="p-6 border-b border-brand-primary/5 bg-brand-surface/30">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary">Notifications</h4>
                  <span className="bg-brand-accent text-brand-primary text-[10px] font-black px-2 py-0.5 rounded-full">1 New</span>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-brand-primary/5">
                {notifications.map(n => (
                  <div key={n.id} className={`p-6 hover:bg-brand-surface transition-colors cursor-pointer ${n.unread ? 'bg-brand-accent/5' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-xs font-bold ${n.unread ? 'text-brand-primary' : 'text-brand-primary/60'}`}>{n.title}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20">{n.date}</p>
                    </div>
                    <p className="text-xs text-brand-primary/40 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-brand-surface border-t border-brand-primary/5 text-center">
                <button className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 hover:text-brand-primary transition-colors">Mark all as read</button>
              </div>
            </motion.div>
          )}
        </div>
        
        <a 
          href="#/owner/settings"
          onClick={() => setActiveTab('settings')}
          className="p-2 text-brand-primary/30 hover:text-brand-primary transition-colors"
        >
          <Settings className="w-5 h-5" />
        </a>
        
        <div className="w-px h-6 bg-brand-primary/5"></div>
        
        <a 
          href="#/owner/profile"
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full border-2 border-brand-primary/5 bg-brand-surface flex items-center justify-center group-hover:border-brand-accent transition-all ring-2 ring-brand-primary/5 text-brand-primary/40">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-brand-primary group-hover:text-brand-accent transition-colors">{displayName}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">Registry# {displayId}</p>
          </div>
        </a>
      </div>
    </header>
  );
};

export const OwnerProfileSection = () => {
  const [isSaving, setIsSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    residentialCountry: '',
    memberSince: '',
    status: '',
    img: ''
  });

  React.useEffect(() => {
    const cached = localStorage.getItem('currentUser');
    const user = cached ? JSON.parse(cached) : null;
    if (!user) return;

    setFormData({
      fullName: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      residentialCountry: user.residential_country || 'United States',
      memberSince: user.member_since || 'May 2026',
      status: user.status || 'Active',
      img: user.img || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200'
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const cached = localStorage.getItem('currentUser');
    const user = cached ? JSON.parse(cached) : null;
    if (!user) {
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/owner/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.phone,
          residential_country: formData.residentialCountry,
          address: formData.address
        })
      });
      const data = await res.json();
      if (data.success) {
        // Update local cache
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        alert('Profile updated successfully!');
      } else {
        alert(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      alert('Network error. Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-brand-primary mb-2">Profile Settings</h2>
        <p className="text-brand-primary/40 font-medium">Update your contact information and public registry profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-brand-primary/5 shadow-sm text-center space-y-6">
            <div className="relative inline-block group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-brand-surface flex items-center justify-center ring-4 ring-brand-primary/5 mx-auto text-brand-primary/40">
                <User className="w-16 h-16" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-primary">{formData.fullName}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mt-1">Verified Registry Member</p>
            </div>
            <div className="pt-6 border-t border-brand-primary/5 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-brand-primary/30 uppercase tracking-widest text-[9px]">ID Status</span>
                <span className="text-status-success bg-status-success/10 px-2 py-0.5 rounded-lg">{formData.status}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-brand-primary/30 uppercase tracking-widest text-[9px]">Member Since</span>
                <span className="text-brand-primary">{formData.memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-brand-primary/5 shadow-sm">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block ml-2">Full Legal Name</label>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block ml-2">Email Address (Read-only)</label>
                  <input 
                    type="email" 
                    readOnly
                    value={formData.email}
                    className="w-full px-6 py-4 bg-brand-surface/50 border-none rounded-2xl text-sm font-bold text-brand-primary/40 outline-none cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block ml-2">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block ml-2">Residential Country</label>
                  <input 
                    type="text" 
                    value={formData.residentialCountry}
                    onChange={e => setFormData({...formData, residentialCountry: e.target.value})}
                    className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block ml-2">Home Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-10 py-4 bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OwnerSettingsSection = () => {
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    const cached = localStorage.getItem('currentUser');
    const user = cached ? JSON.parse(cached) : null;
    if (!user) {
      setIsChangingPassword(false);
      return;
    }

    try {
      const res = await fetch(`/api/owner/password/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(data.error || 'Failed to update password.');
      }
    } catch (err) {
      console.error('Password change error:', err);
      alert('Network error. Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-brand-primary mb-2">Security Settings</h2>
        <p className="text-brand-primary/40 font-medium">Manage your password and account security preferences.</p>
      </div>

      <div className="space-y-10">
        <section className="bg-white p-10 rounded-[2.5rem] border border-brand-primary/5 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-status-warning/10 rounded-2xl flex items-center justify-center text-status-warning">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Change Password</h3>
              <p className="text-xs font-bold text-brand-primary/20 uppercase tracking-widest">Update your access credentials</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="max-w-xl space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block ml-2">Current Password</label>
              <input 
                type="password" 
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-accent/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block ml-2">New Password</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-accent/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block ml-2">Confirm New Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-accent/20 outline-none"
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isChangingPassword}
                className="px-10 py-4 bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
              >
                {isChangingPassword ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Update Password'}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white p-10 rounded-[2.5rem] border border-brand-primary/5 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Two-Factor Authentication</h3>
              <p className="text-xs font-bold text-brand-primary/20 uppercase tracking-widest">Recommended for high-security accounts</p>
            </div>
          </div>
          <button className="px-8 py-3 bg-brand-surface text-brand-primary/60 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/5 transition-all">
            Enable 2FA
          </button>
        </section>
      </div>
    </div>
  );
};

export const OwnerStats = () => {
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    const cached = localStorage.getItem('currentUser');
    const user = cached ? JSON.parse(cached) : null;
    if (!user) return;

    fetch(`/api/owner/stats/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch(err => console.error('Fetch owner stats error:', err));
  }, []);

  const items = [
    { label: 'Registered Animals', value: stats ? String(stats.animalsCount).padStart(2, '0') : '00', icon: <PawPrint />, color: 'brand-accent' },
    { label: 'Active Requests', value: stats ? String(stats.activeRequestsCount).padStart(2, '0') : '00', icon: <Plane />, color: 'brand-primary' },
    { label: 'Certifications', value: stats ? String(stats.animalsCount).padStart(2, '0') : '00', icon: <ShieldCheck />, color: 'status-success' },
    { label: 'Trips Completed', value: stats ? String(stats.completedTripsCount).padStart(2, '0') : '00', icon: <History />, color: 'brand-primary' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-primary/5 hover:shadow-xl transition-all group">
          <div className={`w-12 h-12 bg-brand-primary/5 rounded-2xl flex items-center justify-center mb-6 text-brand-primary group-hover:scale-110 transition-transform`}>
            {React.cloneElement(stat.icon as React.ReactElement, { className: 'w-6 h-6' })}
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">{stat.label}</p>
          <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
        </div>
      ))}
    </div>
  );
};

export const OwnerAddAnimalModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (animal: any) => void }) => {
  const [microchip, setMicrochip] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [foundAnimal, setFoundAnimal] = React.useState<any>(null);
  const [error, setError] = React.useState('');

  const handleSearch = async () => {
    if (!microchip) return;
    setIsSearching(true);
    setError('');
    setFoundAnimal(null);

    try {
      const res = await fetch(`/api/verify/${microchip}`);
      const data = await res.json();
      if (data.success) {
        setFoundAnimal({
          name: data.data.pet.name,
          breed: data.data.pet.breed,
          id: data.data.pet.registryId,
          microchip: data.data.pet.microchip,
          img: data.data.pet.photo
        });
      } else {
        setError(data.error || 'No certified record found for this microchip number.');
      }
    } catch (err) {
      setError('Connection failed. Please check your network.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!foundAnimal) return;
    const cached = localStorage.getItem('currentUser');
    const user = cached ? JSON.parse(cached) : null;
    if (!user) {
      setError('No active session. Please log in.');
      return;
    }

    try {
      const res = await fetch('/api/owner/animals/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: user.id, microchip: foundAnimal.microchip })
      });
      const data = await res.json();
      if (data.success) {
        onAdd({
          name: data.animal.name,
          breed: data.animal.breed,
          id: `#${data.animal.id}`,
          status: data.animal.status || 'Active',
          img: data.animal.img || data.animal.photo || 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=200'
        });
        setMicrochip('');
        setFoundAnimal(null);
        onClose();
      } else {
        setError(data.error || 'Failed to link animal.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5"
      >
        <div className="p-5 sm:p-10 space-y-6 sm:space-y-8">
          <div>
            <h3 className="text-3xl font-bold tracking-tight mb-2">Claim Service Animal</h3>
            <p className="text-xs font-bold text-brand-primary/30 uppercase tracking-widest">Search by microchip to link records</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Animal Microchip ID</label>
              <div className="flex gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/20 w-4 h-4" />
                  <input 
                    type="text" 
                    value={microchip}
                    onChange={(e) => setMicrochip(e.target.value)}
                    placeholder="15-digit ID" 
                    className="w-full pl-12 pr-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-6 rounded-2xl bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSearching ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Search'}
                </button>
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs font-bold text-status-error px-2"
              >
                {error}
              </motion.p>
            )}

            {foundAnimal && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-brand-surface rounded-[2rem] border border-brand-primary/5 space-y-6"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-primary/5">
                    <img src={foundAnimal.img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{foundAnimal.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30">{foundAnimal.breed}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20">Microchip</p>
                    <p className="text-xs font-mono font-bold text-brand-primary/60">{foundAnimal.microchip}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20">Registry ID</p>
                    <p className="text-xs font-mono font-bold text-brand-primary/60">{foundAnimal.id}</p>
                  </div>
                </div>
                <button 
                  onClick={handleAdd}
                  className="w-full py-4 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                >
                  Confirm & Link to Profile
                </button>
              </motion.div>
            )}
          </div>

          <div className="pt-4 flex justify-center">
            <button 
              onClick={onClose} 
              className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 hover:text-brand-primary transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


export const OwnerAnimals = () => {
  const [animals, setAnimals] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [viewAnimal, setViewAnimal] = React.useState<any>(null);

  const fetchAnimals = React.useCallback(() => {
    const cached = localStorage.getItem('currentUser');
    const user = cached ? JSON.parse(cached) : null;
    if (!user) return;

    fetch(`/api/owner/animals/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const mapped = data.animals.map((a: any) => ({
            ...a,
            handler: user.name,
            id: a.registry_id || a.id,
            img: a.img || 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=200'
          }));
          setAnimals(mapped);
        }
      })
      .catch(err => console.error('Fetch animals error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  React.useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  const handleAddAnimal = () => {
    fetchAnimals();
  };

  return (
    <div className="space-y-6">
      <OwnerAddAnimalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddAnimal} 
      />
      <ViewAnimalModal
        isOpen={!!viewAnimal}
        animal={viewAnimal}
        onClose={() => setViewAnimal(null)}
      />
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold tracking-tight">My Animals</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-brand-primary/40 hover:text-brand-primary transition-colors uppercase tracking-widest px-4 py-2 hover:bg-brand-primary/5 rounded-lg"
        >
          <PlusCircle className="w-4 h-4" /> Add New Animal
        </button>
      </div>
      {isLoading ? (
        <div className="py-20 text-center text-brand-primary/40 font-medium">Loading animals...</div>
      ) : animals.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[2rem] border border-brand-primary/5 shadow-sm text-brand-primary/40 font-medium">
          No registered animals linked to your profile yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {animals.map((animal, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-[2rem] border border-brand-primary/5 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="flex gap-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-brand-primary/5 group-hover:border-brand-accent transition-all">
                  <img src={animal.img} alt={animal.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-bold">{animal.name}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-status-success/10 text-status-success px-2 py-1 rounded-lg">{animal.status}</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-primary/30 mb-4">{animal.breed}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20">ID: {animal.id}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-brand-primary/5 flex gap-4">
                <button 
                  onClick={() => setViewAnimal(animal)}
                  className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-brand-accent transition-colors"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export const OwnerSubmitTravelModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (request: any) => void }) => {
  const [formData, setFormData] = React.useState({
    travelDate: '',
    flightNumber: '',
    confirmationNumber: '',
    route: '',
    animalId: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [animals, setAnimals] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!isOpen) return;
    const cached = localStorage.getItem('currentUser');
    const user = cached ? JSON.parse(cached) : null;
    if (!user) return;

    fetch(`/api/owner/animals/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAnimals(data.animals);
        }
      })
      .catch(err => console.error('Fetch animals for travel modal error:', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const cached = localStorage.getItem('currentUser');
    const user = cached ? JSON.parse(cached) : null;
    if (!user) {
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/owner/travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: user.id,
          animalId: Number(formData.animalId),
          travelDate: formData.travelDate,
          flightNumber: formData.flightNumber,
          confirmationNumber: formData.confirmationNumber,
          route: formData.route
        })
      });
      const data = await res.json();
      if (data.success) {
        onSubmit(data.request);
        setFormData({
          travelDate: '',
          flightNumber: '',
          confirmationNumber: '',
          route: '',
          animalId: ''
        });
        onClose();
      }
    } catch (err) {
      console.error('Submit travel request error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-primary/5"
      >
        <div className="bg-brand-primary p-5 sm:p-8 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-2xl font-bold tracking-tight text-white">Submit Travel Request</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <LogOut className="w-5 h-5 rotate-180" />
            </button>
          </div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Verify your service animal for upcoming flights</p>
        </div>

        <form className="p-5 sm:p-10 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Travel Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/20 w-4 h-4" />
                <input 
                  type="date" 
                  required
                  value={formData.travelDate}
                  onChange={e => setFormData({...formData, travelDate: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Flight Number</label>
              <div className="relative">
                <Plane className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/20 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="e.g. AA123"
                  required
                  value={formData.flightNumber}
                  onChange={e => setFormData({...formData, flightNumber: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Airline Confirmation Number</label>
            <input 
              type="text" 
              placeholder="6-character code"
              required
              value={formData.confirmationNumber}
              onChange={e => setFormData({...formData, confirmationNumber: e.target.value})}
              className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Route</label>
            <input 
              type="text" 
              placeholder="e.g. JFK to LHR"
              required
              value={formData.route}
              onChange={e => setFormData({...formData, route: e.target.value})}
              className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold placeholder:text-brand-primary/20 focus:ring-2 focus:ring-brand-accent/20 transition-all outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 block">Select Animal</label>
            <select 
              required
              value={formData.animalId}
              onChange={e => setFormData({...formData, animalId: e.target.value})}
              className="w-full px-6 py-4 bg-brand-surface border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-brand-accent/20 outline-none"
            >
              <option value="">Select Service Animal</option>
              {animals.map((animal) => (
                <option key={animal.id} value={animal.id}>{animal.name} ({animal.breed})</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-brand-primary/5 hover:bg-brand-surface transition-colors flex-grow"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-4 rounded-xl bg-brand-primary text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95 flex-grow-0 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : 'Submit Request'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const OwnerTravelSection = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [requests, setRequests] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchTravelRequests = React.useCallback(() => {
    const cached = localStorage.getItem('currentUser');
    const user = cached ? JSON.parse(cached) : null;
    if (!user) return;

    fetch(`/api/owner/travel/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const mapped = data.requests.map((r: any) => ({
            id: `AIR-${r.id}`,
            confirmationNumber: r.confirmation_number,
            flightNumber: r.flight_number,
            route: r.route,
            travelDate: r.travelDate,
            animalId: r.animalName,
            status: r.status,
            submittedAt: r.submittedAt
          }));
          setRequests(mapped);
        }
      })
      .catch(err => console.error('Fetch owner travel requests error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  React.useEffect(() => {
    fetchTravelRequests();
  }, [fetchTravelRequests]);

  const handleSubmit = () => {
    fetchTravelRequests();
  };

  return (
    <div className="space-y-10">
      <OwnerSubmitTravelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-2">
            <span>Portal</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-primary">Travel Requests</span>
          </nav>
          <h2 className="text-4xl font-bold tracking-tight text-brand-primary mb-1">Travel Authorization</h2>
          <p className="text-brand-primary/40 font-medium">Manage and monitor service animal airline certifications.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 rounded-xl shadow-lg shadow-brand-primary/10 group"
        >
          <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" /> 
          New Travel Request
        </Button>
      </div>

      <section className="w-full max-w-full bg-white rounded-[2rem] border border-brand-primary/5 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="py-20 text-center text-brand-primary/40 font-medium">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center text-brand-primary/40 font-medium">No travel requests found.</div>
          ) : (
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="bg-brand-surface/50">
                  <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30">Request ID</th>
                  <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30">Travel Details</th>
                  <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30">Animal</th>
                  <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30">Status</th>
                  <th className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-brand-primary/30 text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-primary/5">
                {requests.map((req, i) => (
                  <tr key={i} className="hover:bg-brand-surface group transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-sm text-brand-primary">{req.id}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent mt-0.5">Conf: {req.confirmationNumber}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3 mb-1">
                        <Plane className="w-3.5 h-3.5 text-brand-primary/40" />
                        <p className="font-bold text-xs text-brand-primary/70">{req.flightNumber}</p>
                      </div>
                      <p className="text-[10px] font-bold text-brand-primary/40 uppercase mb-2">{req.route}</p>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary/20">
                        <Calendar className="w-3 h-3" />
                        {req.travelDate}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-primary/5 flex items-center justify-center text-brand-primary font-bold text-[10px]">
                          {req.animalId ? req.animalId.charAt(0) : ''}
                        </div>
                        <p className="font-bold text-sm text-brand-primary">{req.animalId}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                        req.status === 'Approved' 
                          ? 'bg-status-success/10 text-status-success' 
                          : req.status === 'Rejected'
                          ? 'bg-status-error/10 text-status-error'
                          : 'bg-status-warning/10 text-status-warning'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          req.status === 'Approved' ? 'bg-status-success' : req.status === 'Rejected' ? 'bg-status-error' : 'bg-status-warning'
                        }`} />
                        {req.status === 'Approved' ? 'Verified' : req.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="font-bold text-xs text-brand-primary/40">{req.submittedAt}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export const OwnerRecentActivity = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold tracking-tight">Recent Activity</h3>
    <div className="bg-white rounded-[2rem] border border-brand-primary/5 shadow-sm divide-y divide-brand-primary/5 overflow-hidden">
      {[
        { title: 'Travel to JFK - Cleared', sub: 'Approved for Cooper on Oct 24, 2024', type: 'success', icon: <CheckCircle2 /> },
        { title: 'New Certification Pending', sub: 'Veterinary records for Bella under review', type: 'warning', icon: <Clock /> },
        { title: 'Bella Registered', sub: 'New animal profile created successfully', type: 'info', icon: <PlusCircle /> }
      ].map((item, i) => (
        <div key={i} className="p-6 flex gap-4 items-start hover:bg-brand-surface transition-colors cursor-pointer group">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            item.type === 'success' ? 'bg-status-success/10 text-status-success' :
            item.type === 'warning' ? 'bg-status-warning/10 text-status-warning' :
            'bg-brand-primary/5 text-brand-primary'
          } group-hover:scale-110 transition-transform`}>
            {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
          </div>
          <div>
            <p className="font-bold text-brand-primary text-sm tracking-tight">{item.title}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40 mt-1">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
import { DOG_CATEGORIES, HISTORY, STEPS } from '../constants';

export const Hero = ({ 
  title, 
  subtitle, 
  description, 
  bgImage,
  primaryBtn,
  secondaryBtn
}: {
  title: string,
  subtitle?: string,
  description: string,
  bgImage: string,
  primaryBtn?: { text: string, icon: React.ReactNode, onClick?: () => void, href?: string },
  secondaryBtn?: { text: string, icon: React.ReactNode, onClick?: () => void, href?: string }
}) => (
  <section className="relative min-h-[95vh] flex items-center justify-center pt-24 overflow-hidden">
    <div className="absolute inset-0 z-0">
      <img 
        src={bgImage} 
        alt="Hero Dog" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary via-brand-primary/60 to-brand-surface/10"></div>
      <div className="absolute inset-0 bg-black/40"></div>
    </div>
    
    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
      {subtitle && (
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block py-2 px-6 rounded-full bg-brand-accent text-brand-primary font-black text-[10px] uppercase tracking-[0.3em] mb-8 shadow-2xl shadow-brand-accent/20"
        >
          {subtitle}
        </motion.span>
      )}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-6xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tighter"
      >
        {title}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg md:text-2xl mb-12 text-white/80 max-w-2xl mx-auto font-medium"
      >
        {description}
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        {primaryBtn && (
          <Button 
            variant="secondary" 
            href={primaryBtn.href}
            onClick={primaryBtn.onClick}
            className="w-full sm:w-auto px-10 py-4 shadow-xl shadow-brand-accent/20"
          >
            {primaryBtn.icon}
            {primaryBtn.text}
          </Button>
        )}
        {secondaryBtn && (
          <Button 
            variant="ghost" 
            href={secondaryBtn.href}
            onClick={secondaryBtn.onClick}
            className="w-full sm:w-auto border border-white/30 text-white hover:bg-white/10 px-10 py-4 backdrop-blur-md"
          >
            {secondaryBtn.icon}
            {secondaryBtn.text}
          </Button>
        )}
      </motion.div>
    </div>
  </section>
);

export const VerifyHero = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleVerify = async () => {
    if (!searchTerm) return;
    
    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/verify/${searchTerm}`);
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || "No records found for this microchip number. Please ensure the number is correct and currently registered.");
      }
    } catch (err) {
      setError("Failed to connect to the verification registry. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="relative pt-48 pb-32 bg-[#022448] text-white overflow-hidden min-h-screen flex flex-col">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=1600" 
          alt="Decorative" 
          className="w-full h-full object-cover grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center w-full flex-grow flex flex-col items-center">
        {!result ? (
          <div className="max-w-3xl mx-auto w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 text-brand-accent rounded-full mb-8 border border-white/10 backdrop-blur-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="font-bold text-xs uppercase tracking-widest">Global Authentication Portal</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Secure Registry Validation
            </h1>
            <p className="text-lg text-white/70 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Instantly confirm the authenticity of ADI accredited service animal certificates. Access our secure global database for real-time verification.
            </p>

            <div className="max-w-xl mx-auto w-full">
              <motion.div 
                className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-left space-y-6">
                  <div>
                    <label className="block font-bold text-sm text-brand-primary/60 mb-3 uppercase tracking-wider">Microchip Number</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/30 w-5 h-5" />
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Enter Microchip Number"
                        className="w-full pl-12 pr-4 py-5 bg-brand-surface border border-brand-primary/10 rounded-2xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all text-lg font-medium text-brand-primary outline-none"
                        onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                      />
                    </div>
                    <p className="mt-3 text-xs text-brand-primary/40 font-medium italic">Example: 985112000012345 (9-15 digits only)</p>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-status-error/10 border border-status-error/20 rounded-xl flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-bold text-status-error leading-relaxed">{error}</p>
                    </motion.div>
                  )}

                  <Button 
                    variant="primary" 
                    onClick={handleVerify}
                    disabled={isSearching || !searchTerm}
                    className="w-full py-5 rounded-2xl text-lg shadow-xl shadow-brand-primary/20 disabled:opacity-50"
                  >
                    {isSearching ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-6 h-6" />
                        Verify Certificate
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
              
              <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-3">
                <span className="text-white/60">Don't have a registration yet?</span>
                <button className="text-brand-accent font-bold hover:underline flex items-center gap-1 group">
                  Apply for Registration
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mx-auto text-left"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <button 
                  onClick={() => setResult(null)}
                  className="flex items-center gap-2 text-white/60 hover:text-white font-bold mb-4 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back to Search
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-status-success rounded-2xl flex items-center justify-center text-white shadow-xl shadow-status-success/40">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Status: {result.pet.status}</h2>
                    <p className="text-white/60 font-medium">Verification ID: {result.verificationId} • Verified on {result.dateVerified}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
                <button className="px-6 py-3 bg-white text-brand-primary rounded-xl font-bold transition-all flex items-center gap-2 hover:scale-105 active:scale-95 shadow-xl shadow-white/20">
                  <Share2 className="w-4 h-4" /> Share Record
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Pet Card */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-primary/5">
                  <div className="h-4 bg-brand-accent w-full"></div>
                  <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-brand-primary">
                      <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-brand-primary/5 shadow-inner flex-shrink-0">
                        <img 
                          src={result.pet.photo} 
                          alt={result.pet.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow space-y-6 text-center md:text-left">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 mb-1">Service Animal Information</p>
                          <h3 className="text-4xl font-bold tracking-tight">{result.pet.name}</h3>
                          <p className="text-lg text-brand-primary/60 font-medium mb-1">{result.pet.breed}</p>
                          <p className="text-sm font-bold font-mono text-brand-primary/40">ID: {result.pet.registryId}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-brand-primary/5">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20 mb-1">Gender</p>
                            <p className="text-sm font-bold">{result.pet.gender}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20 mb-1">Weight</p>
                            <p className="text-sm font-bold">{result.pet.weight}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20 mb-1">Color / Markings</p>
                            <p className="text-sm font-bold">{result.pet.color}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20 mb-1">Microchip Number</p>
                            <p className="text-sm font-bold font-mono">{result.pet.microchip}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20 mb-1">Status</p>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit ${
                              result.pet.status.includes('Active') ? 'bg-status-success/10 text-status-success' :
                              result.pet.status.includes('Pending') ? 'bg-status-warning/10 text-status-warning' :
                              'bg-status-error/10 text-status-error'
                            }`}>
                              {result.pet.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rabies Vaccination Card */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-brand-primary/5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary/40 mb-6">Rabies Vaccination Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-4 bg-brand-surface rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20 mb-1">Expiration</p>
                      <p className="text-sm font-bold text-brand-primary">{result.pet.rabiesExpiration}</p>
                    </div>
                    <div className="p-4 bg-brand-surface rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20 mb-1">Serial Number</p>
                      <p className="text-sm font-bold text-brand-primary">{result.pet.rabiesSerial}</p>
                    </div>
                    <div className="p-4 bg-brand-surface rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20 mb-1">Brand</p>
                      <p className="text-sm font-bold text-brand-primary">{result.pet.rabiesBrand}</p>
                    </div>
                    <div className="p-4 bg-brand-surface rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/20 mb-1">Type</p>
                      <p className="text-sm font-bold text-brand-primary">{result.pet.rabiesType}</p>
                    </div>
                  </div>
                </div>

                {/* Facility Card */}
                <div className="bg-brand-primary rounded-[2.5rem] p-8 md:p-12 text-white border border-white/10 shadow-2xl">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                      <Building2 className="w-10 h-10 text-brand-accent" />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Accredited Training Facility</p>
                      <h4 className="text-2xl font-bold mb-1">{result.facility.name}</h4>
                      <p className="text-white/60 mb-4 font-medium">{result.facility.accreditation}</p>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-white/40">
                          <MapPin className="w-3.5 h-3.5" /> {result.facility.location}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-white/40">
                          <Phone className="w-3.5 h-3.5" /> {result.facility.contact}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-white/40">
                          <Globe className="w-3.5 h-3.5" /> {result.facility.website}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/10">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Lead Trainer</p>
                          <p className="text-sm font-bold">{result.facility.trainer}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Trained Task</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {(result.facility.trainedTask || '').split(',').map((task: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                {task.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Completion Date</p>
                          <p className="text-sm font-bold">{result.facility.completionDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Detail Sidebar */}
              <div className="space-y-8">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 text-brand-primary shadow-2xl border border-brand-primary/5 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden ring-4 ring-brand-primary/5 mx-auto bg-brand-surface flex items-center justify-center">
                      <User className="w-12 h-12 text-brand-primary/30" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1.5 bg-status-success text-white rounded-full border-2 border-white shadow-lg">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-1">{result.owner.name}</h4>
                  <p className="text-xs font-bold text-brand-primary/30 uppercase tracking-widest mb-6">{result.owner.status}</p>
                  
                  <div className="pt-6 border-t border-brand-primary/5 space-y-4 text-left">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-primary/30 font-black uppercase tracking-widest">Registry #</span>
                      <span className="font-bold">{result.owner.registryNumber}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-primary/30 font-black uppercase tracking-widest">Country</span>
                      <span className="font-bold">{result.owner.country}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-primary/30 font-black uppercase tracking-widest">Account Status</span>
                      <span className={`font-bold ${result.owner.accountStatus === 'Active' ? 'text-status-success' : 'text-status-warning'}`}>{result.owner.accountStatus}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-primary/30 font-black uppercase tracking-widest">ID Number</span>
                      <span className="font-bold">***-{result.owner.idLast4}</span>
                    </div>
                  </div>

                  <button className="w-full mt-8 py-3 bg-brand-surface border border-brand-primary/5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-primary/5 transition-all">
                    Contact Handler
                  </button>
                </div>

                <div className="bg-brand-accent rounded-[2.5rem] p-8 text-brand-primary">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-5 h-5" />
                    <p className="text-xs font-black uppercase tracking-widest">Registry Compliance</p>
                  </div>
                  <p className="text-sm font-medium leading-relaxed mb-6">
                    This animal and handler pair are fully compliant with ADI standards for 2024. All health certifications and public access testing are current.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 p-2 rounded-lg">
                    <Zap className="w-3 h-3" /> Real-time Verified
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export const VerifyFeatures = () => (
  <section className="py-24 bg-brand-surface border-y border-brand-primary/5">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-12 rounded-[2.5rem] border border-brand-primary/5 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-brand-primary/5 rounded-2xl flex items-center justify-center mb-8 text-brand-primary group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h3 className="text-3xl font-bold text-brand-primary mb-4 tracking-tight">Instantly Secure</h3>
          <p className="text-lg text-brand-primary/60 font-light leading-relaxed">
            Instantly verify certificates using microchip numbers through our secure database. Our system provides real-time access to records, ensuring that authorities and service providers can confirm status immediately.
          </p>
        </div>

        <div className="bg-white p-12 rounded-[2.5rem] border-t-8 border-brand-accent shadow-sm hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-brand-accent/10 rounded-2xl flex items-center justify-center mb-8 text-brand-accent group-hover:scale-110 transition-transform">
            <Verified className="w-9 h-9" />
          </div>
          <h3 className="text-3xl font-bold text-brand-primary mb-4 tracking-tight">Global Network</h3>
          <p className="text-lg text-brand-primary/60 font-light leading-relaxed">
            Our team verifies your application through ADI-member databases worldwide. This collaborative approach guarantees that certifications meet international standards and are recognized by partner organizations globally.
          </p>
        </div>
      </div>

      <div className="mt-20 flex flex-wrap justify-center gap-12 opacity-40 grayscale">
        <div className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em]">
          <Verified className="w-6 h-6" /> ADI Certified
        </div>
        <div className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em]">
          <Workflow className="w-6 h-6" /> Global Standard
        </div>
        <div className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em]">
          <ShieldCheck className="w-6 h-6" /> Verified Secure
        </div>
      </div>
    </div>
  </section>
);

export const StatsBar = () => {
  const stats = [
    { label: 'Certified Dogs', value: '100K+' },
    { label: 'Member Programs', value: '300+' },
    { label: 'Countries', value: '30+' },
    { label: 'Years Service', value: '33' }
  ];

  return (
    <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-brand-accent flex flex-col items-center text-center card-hover-lift"
          >
            <span className="text-3xl md:text-4xl font-bold text-brand-primary mb-2 tracking-tighter">{stat.value}</span>
            <span className="text-xs uppercase tracking-widest text-brand-primary/50 font-bold">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export const LegacySection = () => (
  <section className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <SectionHeading 
        subtitle="Our Legacy"
        title="About Assistance Dogs International"
        description="Assistance Dogs International (ADI) was founded in 1991 to promote the highest standards for assistance dog training, behavior, welfare, and ethics. Our mission is to improve the lives of people with disabilities through properly trained assistance dogs."
      />
      <p className="text-brand-primary/60 mb-10 leading-relaxed text-lg">
        With over 300 member programs across 30+ countries, ADI represents the gold standard in assistance dog training and placement worldwide. Every assistance dog team receives comprehensive training and lifetime support.
      </p>
      <div className="flex gap-4">
        <Button href="#/guide" variant="primary">Learn More</Button>
        <Button href="https://assistancedogsinternational.org/" target="_blank" rel="noopener noreferrer" variant="outline">Official ADI Site</Button>
      </div>
    </motion.div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-4 pt-12">
        <div className="h-64 rounded-3xl overflow-hidden shadow-md">
          <img 
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800" 
            alt="Dog 1" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="h-48 rounded-3xl bg-brand-accent/10 flex items-center justify-center p-8 text-center text-brand-primary/70 italic font-medium text-lg leading-snug">
          "Global coalition dedicated to improving lives through precision and care."
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-48 rounded-3xl bg-brand-primary text-white flex flex-col items-center justify-center p-8 text-center shadow-lg">
          <ShieldCheck className="w-12 h-12 mb-3 text-brand-accent" />
          <p className="font-bold text-xl uppercase tracking-wider">The Gold Standard</p>
        </div>
        <div className="h-64 rounded-3xl overflow-hidden shadow-md">
          <img 
            src="https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&q=80&w=800" 
            alt="Dog 2" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  </section>
);

export const MissionSection = () => (
  <section className="py-24 bg-brand-surface">
    <div className="max-w-7xl mx-auto px-6">
      <SectionHeading 
        title="Our Core Mission" 
        description="Improving lives through properly trained assistance dogs"
        centered 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <Workflow />, title: 'Standards', text: 'Establishing and maintaining the highest industry standards for assistance dog training and placement worldwide.' },
          { icon: <ShieldCheck />, title: 'Accreditation', text: 'Providing rigorous accreditation to qualifying organizations that meet our comprehensive, audited global standards.' },
          { icon: <BookOpen />, title: 'Education', text: 'Serving as a trusted informational resource for handlers, trainers, and the public across the globe.' }
        ].map((item, i) => (
          <motion.div 
            key={i}
            className="bg-white p-10 rounded-3xl card-hover-lift shadow-sm hover:shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-2xl bg-brand-primary/5 flex items-center justify-center mb-6 text-brand-primary">
              {React.cloneElement(item.icon as React.ReactElement, { className: 'w-8 h-8' })}
            </div>
            <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
            <p className="text-brand-primary/60 text-lg leading-relaxed">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export const DogTypesSection = () => (
  <section className="py-24 max-w-7xl mx-auto px-6">
    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
      <div className="max-w-2xl">
        <span className="text-brand-accent font-bold uppercase tracking-widest block mb-4">Expert Categories</span>
        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Types of Assistance Dogs</h2>
        <p className="text-xl text-brand-primary/60 font-light">ADI programs train dogs for various specialized roles to assist people with diverse disabilities.</p>
      </div>
      <Button variant="ghost" className="group border border-brand-primary/10 px-6">
        View Gallery <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {DOG_CATEGORIES.map((dog, i) => (
        <motion.div 
          key={i}
          className="group rounded-[2.5rem] overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500 border border-brand-primary/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="h-64 overflow-hidden relative">
            <img 
              src={dog.imageUrl} 
              alt={dog.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
              <span className="text-white font-bold flex items-center gap-2">View Details <ArrowUpRight className="w-4 h-4" /></span>
            </div>
          </div>
          <div className="p-8">
            <div className="flex items-center gap-2 text-brand-accent mb-3">
              <span className="w-6 h-6 rounded-full bg-brand-accent/10 flex items-center justify-center p-1">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span className="font-bold uppercase tracking-tighter text-sm">{dog.name}</span>
            </div>
            <p className="text-brand-primary/60 leading-relaxed text-lg">{dog.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export const HistoryTimeline = () => (
  <section className="py-24 bg-brand-primary text-white overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
      <div>
        <SectionHeading 
          title="Our History" 
          inverse 
        />
        <div className="space-y-12 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
          {HISTORY.map((item, i) => (
            <motion.div 
              key={i} 
              className="pl-12 relative"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-brand-accent border-4 border-brand-primary shadow-lg shadow-brand-accent/20"></div>
              <h4 className="text-4xl font-bold text-brand-accent mb-2 tracking-tighter">{item.year}</h4>
              <p className="text-white/70 text-xl font-light">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      <motion.div 
        className="bg-white/5 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-brand-accent flex items-center justify-center text-brand-primary shadow-lg shadow-brand-accent/20">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight">ADI Standards</h3>
        </div>
        
        <ul className="space-y-10">
          {[
            { label: 'Training', value: 'Minimum 120 hours over at least 6 months.' },
            { label: 'Public Access', value: 'Dogs must behave properly and focus in all public settings.' },
            { label: 'Welfare', value: 'Strict audited protocols for dog welfare and quality of life.' },
            { label: 'Trainer Certification', value: 'All trainers must be ADI certified and regularly reassessed.' }
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-5">
              <CheckCircle2 className="w-7 h-7 text-brand-accent shrink-0 mt-1" />
              <div>
                <span className="block font-bold text-brand-accent text-sm uppercase tracking-widest mb-2">{item.label}</span>
                <span className="text-white/80 text-xl leading-snug font-light">{item.value}</span>
              </div>
            </li>
          ))}
        </ul>
        
        <Button href="#/guide" variant="secondary" className="w-full mt-14 py-5 text-xl rounded-2xl shadow-xl shadow-brand-accent/10">View Full Standards</Button>
      </motion.div>
    </div>
  </section>
);

export const StepsSection = () => (
  <section className="py-24 bg-brand-surface">
    <div className="max-w-7xl mx-auto px-6">
      <SectionHeading 
        title="Get Certified in 3 Simple Steps" 
        centered 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {STEPS.map((step, i) => (
          <motion.div 
            key={i}
            className={`relative group p-10 lg:p-12 rounded-[2.5rem] shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl ${
              step.isFeatured ? 'bg-white border-t-8 border-brand-accent -translate-y-4 md:-translate-y-6 h-full' : 'bg-white/50 border border-brand-primary/5 h-full'
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="absolute -top-10 -left-10 text-[12rem] font-black text-brand-primary/5 select-none text-right w-full transition-transform group-hover:scale-105">
              {step.number}
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-brand-accent rounded-full flex items-center justify-center font-bold text-brand-primary mb-10 text-2xl shadow-lg shadow-brand-accent/20">
                {step.number}
              </div>
              <h4 className="text-2xl font-bold mb-6 tracking-tight">{step.title}</h4>
              <p className="text-brand-primary/60 leading-relaxed text-lg font-light">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export const ServicesSection = () => {
  const services = [
    { icon: <Search />, title: 'Verification', desc: 'Instantly verify certificates using microchip numbers through our database.', link: 'Verify now' },
    { icon: <Workflow />, title: 'Application', desc: 'Easy step-by-step process for service animal registration and status tracking.', link: 'Apply here' },
    { icon: <BookOpen />, title: 'Training Guide', desc: 'Comprehensive guide on ADI service dog training and behavioral standards.', link: 'Read guide' },
    { icon: <Building2 />, title: 'Members', desc: 'Find ADI accredited training facilities and member programs worldwide.', link: 'Find programs' }
  ];

  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <SectionHeading 
        title="Our Services" 
        description="Comprehensive solutions for service animal verification and professional registration."
        centered
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((item, i) => (
          <motion.div 
            key={i}
            className="p-10 bg-white rounded-[2rem] border border-brand-primary/10 hover:border-brand-accent transition-all card-hover-lift shadow-sm hover:shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="w-16 h-16 bg-brand-primary/5 text-brand-primary rounded-2xl flex items-center justify-center mb-8 shadow-sm">
              {React.cloneElement(item.icon as React.ReactElement, { className: 'w-9 h-9' })}
            </div>
            <h4 className="text-2xl font-bold mb-4 tracking-tight">{item.title}</h4>
            <p className="text-brand-primary/60 mb-8 leading-relaxed font-light">{item.desc}</p>
            <div className="mt-auto">
              <ExternalButton href="#">{item.link}</ExternalButton>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export const ApplyHero = () => (
  <section className="relative pt-48 pb-24 bg-[#01162d] overflow-hidden min-h-[550px] flex items-center">
    <div className="absolute inset-0 opacity-40 pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-accent/20 via-transparent to-transparent"></div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent"></div>
    <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
      <div className="text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Service Animal <br /> Registration Application
        </h1>
        <p className="text-xl text-white/70 mb-0 leading-relaxed font-light max-w-xl">
          Begin your official verification journey. Our precise certification process ensures your service animal meets international ADI standards for logistics and public access.
        </p>
      </div>
      <div className="hidden lg:block relative group">
        <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10 group-hover:scale-[1.02] transition-transform duration-700">
          <img 
            src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1000" 
            alt="Service Dog" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -bottom-6 -right-6 glass-effect p-6 rounded-2xl shadow-xl border-brand-accent/20 animate-bounce-slow">
          <ShieldCheck className="w-12 h-12 text-brand-accent" />
        </div>
      </div>
    </div>
  </section>
);

export const ApplyForm = () => {
  const [dragActive, setDragActive] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  
  const [formData, setFormData] = React.useState({
    handler_name: '',
    phone: '',
    email: '',
    country: 'United States of America',
    address: '',
    id_type: 'Passport',
    id_last4: '',
    pet_name: '',
    pet_breed: '',
    pet_gender: 'Male',
    pet_color: '',
    pet_dob: '',
    pet_weight: '',
    pet_microchip: '',
    rabies_expiration: '',
    rabies_serial: '',
    rabies_brand: '',
    rabies_type: '3-Year Vaccine',
    facility_name: 'Austin Assistance Dogs Training Center',
    trainer_name: 'Sarah Jenkins',
    trained_task: 'Mobility Assistance Dog',
    completion_date: '2023-10-10',
    pet_photo: ''
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, pet_photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
      } else {
        setError(data.error || 'Failed to submit application.');
      }
    } catch (err) {
      setError('Connection failed. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <section className="py-24 bg-brand-surface">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="bg-white rounded-[2rem] shadow-xl p-12 border-t-8 border-brand-accent space-y-6 animate-pulse-slow">
            <div className="w-20 h-20 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-brand-primary">Application Submitted!</h2>
            <p className="text-brand-primary/60 font-light leading-relaxed max-w-md mx-auto">
              Your registration request has been successfully recorded. The ADI Global Registrar will review the details and rabies vaccination records within 3 to 5 business days.
            </p>
            <div className="pt-6">
              <Button variant="primary" className="px-12 py-4 rounded-xl shadow-lg shadow-brand-primary/10" onClick={() => window.location.reload()}>
                Register Another Animal
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-brand-surface">
      <div className="max-w-4xl mx-auto px-6">
        {error && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/20 rounded-xl text-status-error text-xs font-bold uppercase tracking-wider text-center">
            {error}
          </div>
        )}
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Owner Information */}
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-t-8 border-brand-accent">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Owner Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Handler Name</label>
                  <input 
                    type="text" 
                    value={formData.handler_name}
                    onChange={(e) => setFormData({ ...formData, handler_name: e.target.value })}
                    placeholder="Full Legal Name" 
                    className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000" 
                    className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium" 
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com" 
                    className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium" 
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Residence (Country)</label>
                  <div className="relative">
                    <select 
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full p-4 pr-10 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium appearance-none outline-none cursor-pointer"
                    >
                      {countries.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/20 rotate-90 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Mailing Address</label>
                  <textarea 
                    rows={3} 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, City, State, Zip Code" 
                    className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium resize-none"
                    required
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">ID Type</label>
                  <select 
                    value={formData.id_type}
                    onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                    className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium appearance-none"
                  >
                    <option>Passport</option>
                    <option>Driver's License</option>
                    <option>National ID</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Last 4 Digits of ID</label>
                  <input 
                    type="text" 
                    maxLength={4} 
                    value={formData.id_last4}
                    onChange={(e) => setFormData({ ...formData, id_last4: e.target.value })}
                    placeholder="0000" 
                    className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium" 
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Upload Official ID</label>
                  <div className="border-2 border-dashed border-brand-primary/10 rounded-2xl p-8 bg-brand-surface text-center hover:border-brand-primary transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto mb-3 text-brand-primary/30 group-hover:text-brand-primary group-hover:scale-110 transition-all">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-brand-primary/60">Drag and drop or click to upload ID scan</p>
                    <p className="text-[10px] text-brand-primary/30 uppercase mt-1 font-black">Supported: PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pet Information */}
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-t-8 border-brand-accent">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <Heart className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Pet Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Pet Name</label>
                  <input 
                    type="text" 
                    value={formData.pet_name}
                    onChange={(e) => setFormData({ ...formData, pet_name: e.target.value })}
                    placeholder="e.g. Max" 
                    className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Breed</label>
                  <input 
                    type="text" 
                    value={formData.pet_breed}
                    onChange={(e) => setFormData({ ...formData, pet_breed: e.target.value })}
                    placeholder="e.g. Golden Retriever" 
                    className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium" 
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Pet Photo</label>
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-brand-surface border border-brand-primary/5 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative group">
                      {previewUrl ? (
                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="text-brand-primary/20">
                          <Verified className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow border-2 border-dashed border-brand-primary/10 rounded-2xl p-6 bg-brand-surface text-center hover:border-brand-primary transition-colors cursor-pointer relative">
                      <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                      <p className="text-sm font-bold text-brand-primary/60">Clear photo of your service animal</p>
                      <p className="text-[10px] text-brand-primary/30 uppercase mt-1 font-black">Face and body must be clearly visible</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Gender</label>
                  <select 
                    value={formData.pet_gender}
                    onChange={(e) => setFormData({ ...formData, pet_gender: e.target.value })}
                    className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium appearance-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Color</label>
                  <input 
                    type="text" 
                    value={formData.pet_color}
                    onChange={(e) => setFormData({ ...formData, pet_color: e.target.value })}
                    placeholder="Primary fur color" 
                    className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Date of Birth</label>
                  <input 
                    type="date" 
                    value={formData.pet_dob}
                    onChange={(e) => setFormData({ ...formData, pet_dob: e.target.value })}
                    className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Weight (kg/lbs)</label>
                  <input 
                    type="text" 
                    value={formData.pet_weight}
                    onChange={(e) => setFormData({ ...formData, pet_weight: e.target.value })}
                    placeholder="e.g. 25kg" 
                    className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium" 
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Microchip Number</label>
                  <input 
                    type="text" 
                    value={formData.pet_microchip}
                    onChange={(e) => setFormData({ ...formData, pet_microchip: e.target.value })}
                    placeholder="15-digit international format" 
                    className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium" 
                    required
                  />
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-brand-primary/5">
                <div className="flex items-center gap-3 mb-6">
                  <Stethoscope className="w-5 h-5 text-brand-primary" />
                  <h3 className="font-bold text-brand-primary uppercase tracking-wider text-sm">Rabies Vaccination Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Expiration Date</label>
                    <input 
                      type="date" 
                      value={formData.rabies_expiration}
                      onChange={(e) => setFormData({ ...formData, rabies_expiration: e.target.value })}
                      className="w-full p-3 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Serial Number</label>
                    <input 
                      type="text" 
                      value={formData.rabies_serial}
                      onChange={(e) => setFormData({ ...formData, rabies_serial: e.target.value })}
                      placeholder="Serial #"
                      className="w-full p-3 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Brand</label>
                    <input 
                      type="text" 
                      value={formData.rabies_brand}
                      onChange={(e) => setFormData({ ...formData, rabies_brand: e.target.value })}
                      placeholder="e.g. Merial"
                      className="w-full p-3 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium" 
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Validity</label>
                    <select 
                      value={formData.rabies_type}
                      onChange={(e) => setFormData({ ...formData, rabies_type: e.target.value })}
                      className="w-full p-3 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium appearance-none"
                    >
                      <option>1-Year Vaccine</option>
                      <option>3-Year Vaccine</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission */}
          <div className="flex flex-col items-center space-y-6 pt-4">
            <label className="flex items-start gap-3 max-w-2xl cursor-pointer text-center group">
              <input type="checkbox" className="mt-1 w-5 h-5 rounded border-brand-primary/10 text-brand-primary focus:ring-brand-accent transition-all shrink-0 cursor-pointer" required />
              <span className="text-sm text-brand-primary/60 leading-relaxed font-light select-none group-hover:text-brand-primary transition-colors">
                I certify that the above information is true and accurate to the best of my knowledge and that this animal is a trained service animal as defined by international standards.
              </span>
            </label>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-16 py-5 text-xl rounded-2xl shadow-2xl shadow-brand-primary/10 group disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              {!isSubmitting && <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />}
            </Button>
            <p className="text-[10px] text-brand-primary/40 font-black uppercase tracking-widest italic">Review process typically takes 3-5 business days.</p>
          </div>
        </form>
      </div>
    </section>
  );
};

export const MembersHero = () => (
  <section className="relative pt-56 pb-24 overflow-hidden text-center text-white">
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1600" 
        alt="Members Background" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-brand-primary/40 to-brand-surface/10"></div>
    </div>
    <div className="relative z-10 max-w-4xl mx-auto px-6">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-5xl md:text-7xl font-bold mb-6 tracking-tight uppercase"
      >
        ADI Member Programs
      </motion.h1>
      <p className="text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
        Find ADI-accredited assistance dog training facilities worldwide. We ensure the highest standards of excellence in service animal training.
      </p>
    </div>
  </section>
);

export const MembersDirectory = () => {
  const [members, setMembers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedMember, setSelectedMember] = React.useState<any>(null);
  const [isViewOpen, setIsViewOpen] = React.useState(false);

  // Filters state
  const [countryFilter, setCountryFilter] = React.useState('All Countries');
  const [dogTypeFilter, setDogTypeFilter] = React.useState('All Types');
  const [disabilityFilter, setDisabilityFilter] = React.useState('All Disabilities');

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/members');
      const data = await res.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMembers();
  }, []);

  // Get unique lists for filters from actual DB data
  const uniqueCountries = Array.from(new Set(members.map(m => m.country).filter(Boolean))).sort();
  
  // Filter logic
  const filteredMembers = members.filter(m => {
    if (m.status !== 'Active') return false; // only show Active members in the public directory!

    const matchesCountry = countryFilter === 'All Countries' || m.country === countryFilter;
    
    const matchesDogType = dogTypeFilter === 'All Types' || 
      (m.assistance_dog_type || '').toLowerCase().includes(dogTypeFilter.toLowerCase());
      
    const matchesDisability = disabilityFilter === 'All Disabilities' || 
      (m.disabilities_serviced || '').toLowerCase().includes(disabilityFilter.toLowerCase());

    return matchesCountry && matchesDogType && matchesDisability;
  });

  return (
    <section className="pb-24 bg-brand-surface relative">
      <ViewMemberModal isOpen={isViewOpen} onClose={() => { setIsViewOpen(false); setSelectedMember(null); }} member={selectedMember} />
      
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border-t-8 border-brand-accent mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Country</label>
              <select 
                value={countryFilter}
                onChange={e => setCountryFilter(e.target.value)}
                className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium appearance-none outline-none cursor-pointer"
              >
                <option value="All Countries">All Countries</option>
                {uniqueCountries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Dog Type</label>
              <select 
                value={dogTypeFilter}
                onChange={e => setDogTypeFilter(e.target.value)}
                className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium appearance-none outline-none cursor-pointer"
              >
                <option value="All Types">All Types</option>
                <option value="Guide">Guide Dogs</option>
                <option value="Service">Service Dogs</option>
                <option value="Hearing">Hearing Dogs</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">Disability</label>
              <select 
                value={disabilityFilter}
                onChange={e => setDisabilityFilter(e.target.value)}
                className="w-full p-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium appearance-none outline-none cursor-pointer"
              >
                <option value="All Disabilities">All Disabilities</option>
                <option value="Visual">Visual</option>
                <option value="Hearing">Hearing</option>
                <option value="Mobility">Mobility</option>
                <option value="Autism">Autism</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Seizures">Seizures</option>
                <option value="PTSD">PTSD</option>
                <option value="Psychiatric">Psychiatric</option>
              </select>
            </div>
            <Button 
              variant="primary" 
              onClick={() => {
                setCountryFilter('All Countries');
                setDogTypeFilter('All Types');
                setDisabilityFilter('All Disabilities');
              }}
              className="w-full py-4 text-sm rounded-xl group font-bold tracking-widest uppercase"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 lg:gap-24 mb-24 opacity-60">
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-black text-brand-primary tracking-tighter">
              {members.filter(m => m.status === 'Active').length}
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/50 mt-1">Accredited Programs</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-brand-primary/10 self-center"></div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-black text-brand-primary tracking-tighter">
              {new Set(members.filter(m => m.status === 'Active').map(m => m.country)).size}
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/50 mt-1">Countries</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-brand-primary/10 self-center"></div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-black text-brand-primary tracking-tighter">3</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary/50 mt-1">Primary Specialties</p>
          </div>
        </div>

        {/* Listings */}
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Accredited Member Programs</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-primary/40 uppercase tracking-wider bg-brand-primary/5 px-4 py-2 rounded-full">
              <Verified className="w-4 h-4 text-brand-accent" /> ADI-accredited training facilities
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-xs font-bold text-brand-primary/30 uppercase tracking-widest">
              Loading member listings...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-20 text-xs font-bold text-brand-primary/30 uppercase tracking-widest">
              No matching programs found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMembers.map((member, i) => {
                const disabilities = member.disabilities_serviced
                  ? member.disabilities_serviced.split(',').map((x: string) => x.trim()).filter(Boolean)
                  : [];
                return (
                  <motion.div 
                    key={member.id || i}
                    className="bg-white p-6 rounded-3xl border border-brand-primary/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl border border-brand-primary/5 bg-white p-2 flex items-center justify-center overflow-hidden shrink-0">
                          {!isPlaceholderImg(member.img) ? (
                            <img src={member.img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            getRegionAvatar(member.region, member.name)
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-brand-accent bg-brand-accent/5 px-2.5 py-1 rounded-full">
                          <Verified className="w-3 h-3" /> ADI Accredited
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold mb-1 tracking-tight text-brand-primary leading-snug group-hover:text-brand-accent transition-colors">
                        {member.name}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 text-brand-primary/50 text-xs font-bold uppercase tracking-wider mb-6">
                        <MapPin className="w-3.5 h-3.5 text-brand-primary/30" />
                        {member.country}
                      </div>

                      <div className="space-y-4 mb-6">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary/30 mb-1.5">Assistance Dog Type</p>
                          <p className="text-xs font-bold text-brand-primary/80">{member.assistance_dog_type || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary/30 mb-1.5">Geographical Area</p>
                          <p className="text-xs font-bold text-brand-primary/80">{member.geographical_area || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary/30 mb-2">Disabilities Serviced</p>
                          <div className="flex flex-wrap gap-1.5">
                            {disabilities.slice(0, 3).map((dog, di) => (
                              <span key={di} className="px-2.5 py-1 bg-brand-surface rounded-lg text-[10px] font-bold text-brand-primary/60">{dog}</span>
                            ))}
                            {disabilities.length > 3 && (
                              <span className="px-2.5 py-1 bg-brand-primary/5 rounded-lg text-[10px] font-black text-brand-primary/40">+{disabilities.length - 3} more</span>
                            )}
                            {disabilities.length === 0 && (
                              <span className="text-xs font-semibold text-brand-primary/30">N/A</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-brand-primary/5">
                      <Button 
                        variant="primary" 
                        onClick={() => { setSelectedMember(member); setIsViewOpen(true); }}
                        className="w-full py-3 text-xs rounded-xl font-bold tracking-widest uppercase shadow-md shadow-brand-primary/5 hover:shadow-lg transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> View More Info
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const MembersCTA = ({ onNavigate }: { onNavigate?: (page: string) => void }) => (
  <section className="py-24 max-w-7xl mx-auto px-6">
    <div className="bg-brand-primary rounded-[3rem] p-12 lg:p-20 relative overflow-hidden group">
      <div className="absolute inset-x-0 bottom-0 top-0 opacity-10 pointer-events-none">
        <Users className="w-[400px] h-[400px] absolute -right-20 -bottom-20 text-white transform rotate-12 transition-transform group-hover:scale-110 duration-700" />
      </div>
      <div className="relative z-10 max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
          Want Your Program Listed?
        </h2>
        <p className="text-xl text-white/70 mb-10 font-light leading-relaxed">
          Join our network of ADI-accredited member programs and help more people find the assistance they need with verified quality.
        </p>
        <Button 
          variant="secondary" 
          className="px-12 py-5 text-xl rounded-2xl shadow-2xl shadow-brand-accent/20"
          href="#/apply"
        >
          Apply for Membership
        </Button>
      </div>
    </div>
  </section>
);

export const LoginHero = () => (
  <section className="relative pt-56 pb-24 overflow-hidden flex items-center justify-center min-h-[450px]">
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1600" 
        alt="Login Background" 
        className="w-full h-full object-cover grayscale opacity-40"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-brand-primary/60 to-brand-surface/10"></div>
    </div>
    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-7xl font-bold text-brand-primary mb-4 tracking-tight uppercase"
      >
        Welcome Back
      </motion.h1>
      <p className="text-xl text-brand-primary/60 max-w-2xl mx-auto font-light leading-relaxed">
        Access the ADI Member & Certification Portal
      </p>
    </div>
  </section>
);

export const LoginForm = ({ onLoginSuccess, onRegisterClick }: { onLoginSuccess?: (role: string, user: any) => void, onRegisterClick?: () => void }) => {
  const [activeTab, setActiveTab] = React.useState<'owner' | 'admin'>('owner');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: activeTab })
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess?.(activeTab, data.user);
      } else {
        setError(data.error || 'Invalid credentials or portal selection.');
      }
    } catch (err) {
      setError('Connection failed. Please check your database connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="pb-24 bg-brand-surface relative z-10 -mt-10">
      <div className="max-w-md mx-auto px-6">
        <motion.div 
          className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border-t-8 border-brand-accent"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Tabs */}
          <div className="flex border-b border-brand-primary/5">
            <button 
              className={`flex-1 py-5 font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'owner' ? 'text-brand-primary border-b-2 border-brand-accent' : 'text-brand-primary/30 hover:bg-brand-primary/5'}`}
              onClick={() => { setActiveTab('owner'); setError(''); }}
            >
              Owner Login
            </button>
            <button 
              className={`flex-1 py-5 font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'text-brand-primary border-b-2 border-brand-accent' : 'text-brand-primary/30 hover:bg-brand-primary/5'}`}
              onClick={() => { setActiveTab('admin'); setError(''); }}
            >
              Admin Login
            </button>
          </div>

          <div className="p-8 md:p-10">
            {error && (
              <div className="mb-6 p-4 bg-status-error/10 border border-status-error/20 rounded-xl text-status-error text-xs font-bold uppercase tracking-wider text-center">
                {error}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Email Address / Username</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/20 w-5 h-5" />
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === 'owner' ? "e.g. elena@example.com" : "e.g. admin@adi.org"}
                    className="w-full pl-12 pr-4 py-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Password</label>
                  <button type="button" className="text-[10px] font-black text-brand-accent uppercase tracking-widest hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/20 w-5 h-5" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-brand-surface border border-brand-primary/5 rounded-xl focus:ring-2 focus:ring-brand-primary transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" className="w-5 h-5 rounded border-brand-primary/10 text-brand-primary focus:ring-brand-accent transition-all shrink-0 cursor-pointer" />
                <span className="text-xs text-brand-primary/40 font-bold uppercase tracking-widest select-none">Remember me</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 rounded-2xl text-lg shadow-xl shadow-brand-primary/10 group disabled:opacity-50 bg-brand-primary text-white hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? 'Signing In...' : activeTab === 'owner' ? 'Sign In' : 'Admin Portal Login'}
                {!isLoading && <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-brand-primary/5 text-center">
              <p className="text-sm text-brand-primary/60 font-light">
                Need an account? <button onClick={onRegisterClick} className="text-brand-accent font-bold hover:underline">Register your dog</button>
              </p>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-8 flex items-center justify-center gap-2 opacity-30">
          <ShieldCheck className="w-4 h-4 text-brand-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Secure Encrypted Environment</span>
        </div>
      </div>
    </section>
  );
};

export const RegionalMembers = ({ onNavigate }: { onNavigate?: (page: string) => void }) => (
  <section className="py-24 max-w-7xl mx-auto px-6">
    <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 text-center md:text-left">
      <div>
        <h2 className="text-4xl font-bold mb-4 tracking-tight">ADI Member Programs</h2>
        <p className="text-xl text-brand-primary/60 font-light">Our global network of accredited training facilities.</p>
      </div>
      <Button 
        variant="primary" 
        className="px-12 py-4 rounded-2xl shadow-xl shadow-brand-primary/10"
        href="#/members"
      >
        Browse All Members
      </Button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { region: 'North America', desc: 'Over 150 ADI-accredited programs across the US and Canada providing guide, service, and hearing dogs.' },
        { region: 'Europe', desc: '80+ member organizations across the UK, Germany, France, Netherlands, and Scandinavia.' },
        { region: 'Asia Pacific', desc: 'Growing network of 40+ programs across Japan, Australia, New Zealand, and Southeast Asia.' }
      ].map((item, i) => (
        <div key={i} className="bg-white p-10 rounded-[2.5rem] border-l-[10px] border-brand-primary shadow-sm card-hover-lift">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 bg-brand-primary/5 rounded-lg text-brand-primary">
              <Building2 className="w-7 h-7" />
            </div>
            <h5 className="text-2xl font-bold tracking-tight">{item.region}</h5>
          </div>
          <p className="text-brand-primary/60 leading-relaxed text-lg font-light">{item.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export const GuideHero = () => (
  <section className="relative min-h-[65vh] flex items-center pt-56 pb-16 bg-brand-primary overflow-hidden">
    <div className="absolute inset-0 opacity-40">
      <img 
        src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1600" 
        alt="Training" 
        className="w-full h-full object-cover grayscale"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-brand-primary/90 to-transparent"></div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-primary/95 to-transparent"></div>
    
    <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
      <div className="max-w-2xl">
        <span className="inline-block px-4 py-1 rounded-full bg-brand-accent text-brand-primary font-bold text-xs uppercase tracking-widest mb-6 shadow-lg shadow-brand-accent/20">
          Official Standards 2024
        </span>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-[1.1] tracking-tight uppercase">
          ADI Training <br /> Standards Guide
        </h1>
        <p className="text-xl text-white/70 mb-10 leading-relaxed font-light">
          Comprehensive guide to Assistance Dogs International standards, training requirements, and the rigorous certification process for global service animals.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button href="#/apply" variant="secondary" className="px-10 py-4 shadow-xl shadow-brand-accent/10">
            <FileText className="w-5 h-5" />
            Apply for Certification
          </Button>
          <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10 px-10 py-4 backdrop-blur-md">
            <Activity className="w-5 h-5" />
            View Standards Video
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export const WhatIsAdi = () => (
  <section className="py-24 bg-brand-surface overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeading 
            subtitle="About the Authority"
            title="What is ADI?"
            description="Assistance Dogs International (ADI) is a worldwide coalition of nonprofit programs that train and place assistance dogs. Founded in 1991, ADI promotes the highest standards for assistance dog training, behavior, welfare, and ethics."
          />
          <p className="text-brand-primary/60 text-lg leading-relaxed mb-12 font-light">
            ADI member organizations must undergo rigorous accreditation processes and adhere to strict standards covering every aspect of assistance dog training—from breeding and socialization to task training and post-placement support.
          </p>
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-brand-primary/10">
            {[
              { label: 'Member Programs', value: '300+' },
              { label: 'Countries', value: '30+' },
              { label: 'Years Service', value: '33+' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-brand-primary mb-1 tracking-tighter">{stat.value}</div>
                <div className="text-[10px] uppercase font-black tracking-widest text-brand-primary/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
        
        <div className="relative">
          <motion.div 
            className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <img 
              src="https://images.unsplash.com/photo-1523626797181-8c5ae80d40c2?auto=format&fit=crop&q=80&w=1000" 
              alt="ADI Authority" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.div 
            className="absolute -bottom-8 -left-8 glass-effect p-8 rounded-3xl shadow-2xl max-w-xs border-brand-accent/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-accent rounded-full flex items-center justify-center text-brand-primary shadow-lg shadow-brand-accent/20">
                <Verified className="w-8 h-8" />
              </div>
              <div>
                <p className="font-black text-xs uppercase tracking-widest text-brand-primary/40 mb-1">Status</p>
                <p className="font-bold text-brand-primary leading-tight">Global Authority on Training & Welfare</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

export const TrainingStandardsVisual = () => (
  <section className="py-24 bg-brand-primary text-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col lg:flex-row gap-20">
        <div className="lg:w-1/3">
          <SectionHeading 
            title="ADI Training Standards" 
            description="The rigorous requirements ensure that every ADI-certified team operates at the peak of reliability and safety."
            inverse
          />
          <motion.div 
            className="p-10 rounded-[2.5rem] bg-brand-accent text-brand-primary shadow-2xl shadow-brand-accent/10"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="text-6xl font-black mb-2 tracking-tighter">120+</div>
            <div className="font-black text-xs uppercase tracking-[0.2em] mb-4 opacity-70">Minimum Hours Required</div>
            <p className="text-lg font-medium leading-snug">Includes at least 30 hours of rigorous public access training in diverse real-world environments.</p>
          </motion.div>
        </div>
        
        <div className="lg:w-2/3 grid sm:grid-cols-2 gap-8">
          {[
            { icon: <Workflow />, title: 'Handler Training', desc: 'Comprehensive education on commands, care, and public access etiquette.' },
            { icon: <Activity />, title: 'Health Requirements', desc: 'Hip/elbow evaluations, eye exams, and genetic testing as standard protocols.' },
            { icon: <Brain />, title: 'Behavioral Standards', desc: 'Evaluations for stability, confidence, and appropriate social behavior.' },
            { icon: <Users />, title: 'Lifetime Support', desc: 'Ongoing behavioral consultation and team replacement if necessary.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              className="bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-white/10 transition-all group"
              whileHover={{ y: -5 }}
            >
              <div className="text-brand-accent mb-6 group-hover:scale-110 transition-transform">
                {React.cloneElement(item.icon as React.ReactElement, { className: 'w-10 h-10' })}
              </div>
              <h4 className="text-2xl font-bold mb-4 tracking-tight">{item.title}</h4>
              <p className="text-white/60 text-lg leading-relaxed font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export const PublicAccessSection = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-12">
        <motion.div 
          className="bg-brand-surface p-12 rounded-[3rem] shadow-sm border border-brand-primary/5"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-5 mb-10">
            <div className="w-16 h-16 bg-green-500/10 text-green-600 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-3xl font-bold tracking-tight">Public Access Allowed</h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            {[
              'Restaurants & Cafes',
              'Hotels & Lodging',
              'Public Transit',
              'Shopping Centers',
              'Hospitals & Clinics',
              'Schools & Work'
            ].map((place, i) => (
              <li key={i} className="flex items-center gap-3 text-lg font-medium text-brand-primary/80">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></span> 
                {place}
              </li>
            ))}
          </ul>
        </motion.div>
        
        <motion.div 
          className="bg-brand-primary/5 p-12 rounded-[3rem] border border-brand-primary/5"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-5 mb-10">
            <div className="w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-2xl flex items-center justify-center">
              <Activity className="w-9 h-9" />
            </div>
            <h3 className="text-3xl font-bold tracking-tight">Access May Be Limited</h3>
          </div>
          <ul className="space-y-6">
            {[
              'Sterile medical environments (ORs)',
              'Specific religious requirements',
              'Private residences',
              'Legitimate health/safety hazards'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-lg font-medium text-brand-primary/80">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-accent shadow-sm shadow-brand-accent/50"></span> 
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-12 p-6 bg-white/50 rounded-2xl text-sm text-brand-primary/50 italic border border-brand-primary/5 leading-relaxed">
            **Note:** Businesses may ask if the dog is a service animal and what tasks it performs, but cannot require medical documentation.
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export const ProcessTimeline = () => (
  <section className="py-24 bg-white overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <SectionHeading title="Training Process Timeline" centered />
      
      <div className="relative mt-20">
        <div className="hidden lg:block absolute top-[28px] left-0 w-full h-1 bg-brand-primary/5 -z-0"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 relative z-10">
          {[
            { step: 1, title: 'Breeding', desc: 'Careful selection for health and temperament (0-8 wks).' },
            { step: 2, title: 'Socialization', desc: 'Exposure to environments and foundational training (8-16 wks).' },
            { step: 3, title: 'Obedience', desc: 'Mastering sit, stay, heel, and building reliability (4-12 mo).' },
            { step: 4, title: 'Task-Specific', desc: 'Deep training in specialized roles and public access (12-18 mo).' },
            { step: 5, title: 'Handler Match', desc: 'Intensive joint training and final team evaluation (2-3 wks).' },
            { step: 6, title: 'Placement', desc: 'Ongoing lifetime support and follow-up consultation.' }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              className="lg:text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-14 h-14 bg-brand-primary text-white rounded-full flex items-center justify-center mb-6 lg:mx-auto border-[6px] border-white shadow-xl shadow-brand-primary/10 group-hover:bg-brand-accent group-hover:text-brand-primary transition-all duration-300 font-bold text-xl">
                {item.step}
              </div>
              <h4 className="text-xl font-bold mb-3 tracking-tight">{item.title}</h4>
              <p className="text-brand-primary/60 text-sm leading-relaxed font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export const AccreditationSection = () => (
  <section className="py-24 bg-brand-surface">
    <div className="max-w-7xl mx-auto px-6">
      <div className="bg-brand-primary text-white rounded-[4rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(2,36,72,0.4)] flex flex-col md:flex-row">
        <div className="md:w-1/2 p-12 lg:p-20">
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="w-6 h-6 text-brand-accent" />
            <span className="text-brand-accent font-black tracking-[0.2em] uppercase text-xs">ADI Accreditation</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight tracking-tight">Highest Excellence <br /> in Certification</h2>
          <p className="text-white/60 mb-12 text-xl font-light leading-relaxed italic">ADI accreditation ensures that programs meet the highest global benchmarks through rigorous evaluations conducted every 3-5 years.</p>
          
          <div className="space-y-6">
            {[
              'Compliance with ADI Standards Manual',
              'Facility Inspections & Welfare Protocols',
              'Client Outcome & Feedback Monitoring'
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-400 mt-1 shrink-0" />
                <span className="text-lg font-medium text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="md:w-1/2 relative min-h-[500px]">
          <img 
            src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=1200" 
            alt="Puppy" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 to-transparent"></div>
        </div>
      </div>
    </div>
  </section>
);

export const JoinFamilySection = ({ inverse = false, onNavigate }: { inverse?: boolean, onNavigate?: (page: string) => void }) => (
  <section className={`py-24 ${inverse ? 'bg-brand-primary text-white' : 'bg-brand-surface'} overflow-hidden relative`}>
    <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
      <motion.h2 
        className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
      >
        Join the ADI Family
      </motion.h2>
      <p className={`text-xl md:text-2xl ${inverse ? 'text-white/60' : 'text-brand-primary/60'} max-w-2xl mx-auto mb-12 font-light leading-relaxed`}>
        Whether you need a service animal, want to verify certification, or are looking for training resources, we're here to help.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <Button 
          variant="secondary" 
          href="#/verify"
          className="w-full sm:w-auto px-12 py-5 text-xl rounded-2xl shadow-2xl shadow-brand-accent/20 flex items-center justify-center gap-3"
        >
          <Verified className="w-6 h-6" />
          Verify Certificate
        </Button>
        <Button 
          variant="ghost" 
          href="#/apply"
          className={`w-full sm:w-auto px-12 py-5 text-xl rounded-2xl border ${inverse ? 'border-white/20 text-white hover:bg-white/10' : 'border-brand-primary/10 text-brand-primary hover:bg-brand-primary/5'} backdrop-blur-md flex items-center justify-center gap-3`}
        >
          <Workflow className="w-6 h-6" />
          Apply Now
        </Button>
      </div>
    </div>
    
    <div className={`absolute -right-20 -bottom-20 ${inverse ? 'text-white/5' : 'text-brand-primary/5'}`}>
      <PawPrint className="w-[600px] h-[600px] rotate-12" />
    </div>
  </section>
);
