'use client';

import { useState, useEffect } from 'react';
import { supabase, subscribeToTable } from '@/lib/supabase';
import { Team } from '@/types/schema';
import TeamTable from '@/components/team/TeamTable';
import TeamModal from '@/components/team/TeamModal';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TeamPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [latestEID, setLatestEID] = useState<string>('');

    // Unique values for dropdowns
    const [uniqueTeamNames, setUniqueTeamNames] = useState<string[]>([]);
    const [uniqueTeamTypes, setUniqueTeamTypes] = useState<string[]>([]);
    const [uniqueJobs, setUniqueJobs] = useState<string[]>([]);
    const [uniqueLevels, setUniqueLevels] = useState<string[]>([]);
    const [uniqueWorkTypes, setUniqueWorkTypes] = useState<string[]>([]);
    const [uniquePayTypes, setUniquePayTypes] = useState<string[]>([]);
    const [uniquePayRates, setUniquePayRates] = useState<string[]>([]);
    const [uniqueIncentiveRates, setUniqueIncentiveRates] = useState<string[]>([]);

    useEffect(() => {
        fetchTeams();
        const channel = subscribeToTable('Team', (payload) => {
            console.log('Realtime Update:', payload);
            fetchTeams();
        });
        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchTeams = async () => {
        try {
            const { data, error } = await supabase
                .from('Team')
                .select('*')
                .order('EID', { ascending: true });

            if (error) throw error;
            setTeams(data || []);

            // Get latest EID for auto-generation
            if (data && data.length > 0) {
                const eids = data.map(t => t.EID).filter(Boolean).sort().reverse();
                if (eids.length > 0) {
                    setLatestEID(eids[0]);
                }

                // Extract unique values for dropdowns
                const teamNames = [...new Set(data.map(t => t.TeamName).filter(Boolean))];
                const teamTypes = [...new Set(data.map(t => t.TeamType).filter(Boolean))];
                const jobs = [...new Set(data.map(t => t.Job).filter(Boolean))];
                const levels = [...new Set(data.map(t => t.Level).filter(Boolean))];
                const workTypes = [...new Set(data.map(t => t.WorkType).filter(Boolean))];
                const payTypes = [...new Set(data.map(t => t.PayType).filter(Boolean))];
                const payRates = [...new Set(data.map(t => t.PayRate).filter(Boolean))];
                const incentiveRates = [...new Set(data.map(t => t.IncentiveRate).filter(Boolean))];

                setUniqueTeamNames(teamNames as string[]);
                setUniqueTeamTypes(teamTypes as string[]);
                setUniqueJobs(jobs as string[]);
                setUniqueLevels(levels as string[]);
                setUniqueWorkTypes(workTypes as string[]);
                setUniquePayTypes(payTypes as string[]);
                setUniquePayRates(payRates as string[]);
                setUniqueIncentiveRates(incentiveRates as string[]);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (teamData: Team) => {
        setIsSaving(true);
        try {
            if (currentTeam) {
                const { data: latestData } = await supabase
                    .from('Team')
                    .select('TimeStamp')
                    .eq('EID', teamData.EID)
                    .single();

                if (latestData && new Date(latestData.TimeStamp).getTime() > new Date(currentTeam.TimeStamp).getTime() + 1000) {
                    alert('ข้อมูลถูกแก้ไขโดยผู้ใช้อื่น กรุณาโหลดหน้าใหม่!');
                    fetchTeams();
                    setIsSaving(false);
                    return;
                }
            }

            const dataToSave = { ...teamData, TimeStamp: new Date().toISOString() };

            const { error } = currentTeam
                ? await supabase.from('Team').update(dataToSave).eq('EID', teamData.EID)
                : await supabase.from('Team').insert([dataToSave]);

            if (error) throw error;

            setIsModalOpen(false);
            fetchTeams();

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert('Error saving team: ' + errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (eid: string) => {
        if (!confirm(`คุณต้องการลบทีมงาน ${eid} ใช่หรือไม่?`)) return;
        try {
            const { error } = await supabase.from('Team').delete().eq('EID', eid);
            if (error) throw error;
            fetchTeams();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert('Error deleting: ' + errorMessage);
        }
    };

    const [activeTab, setActiveTab] = useState<'active' | 'resigned'>('active');

    const filteredTeams = teams.filter(t => {
        const matchesSearch = (t.EID && t.EID.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (t.NickName && t.NickName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (t.FullName && t.FullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (t.TeamName && t.TeamName.toLowerCase().includes(searchTerm.toLowerCase()));

        const isResigned = !!t.EndDate;
        const matchesTab = activeTab === 'active' ? !isResigned : isResigned;

        return matchesSearch && matchesTab;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">จัดการทีม (Team)</h1>
                    </div>
                    <button
                        onClick={() => { setCurrentTeam(null); setIsModalOpen(true); }}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                    >
                        <Plus size={20} className="mr-2" />
                        เพิ่มทีมงานใหม่
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mb-6 w-fit">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`w-40 rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${activeTab === 'active'
                                ? 'bg-white text-blue-700 shadow'
                                : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                            }`}
                    >
                        พนักงานปัจจุบัน
                    </button>
                    <button
                        onClick={() => setActiveTab('resigned')}
                        className={`w-40 rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${activeTab === 'resigned'
                                ? 'bg-white text-red-700 shadow'
                                : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                            }`}
                    >
                        พนักงานที่ลาออก
                    </button>
                </div>

                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตาม STID, ชื่อ, ทีม..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>
                ) : (
                    <TeamTable
                        teams={filteredTeams}
                        onEdit={(t) => { setCurrentTeam(t); setIsModalOpen(true); }}
                        onDelete={handleDelete}
                    />
                )}

                <TeamModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={currentTeam}
                    isSaving={isSaving}
                    latestEID={latestEID}
                    uniqueTeamNames={uniqueTeamNames}
                    uniqueTeamTypes={uniqueTeamTypes}
                    uniqueJobs={uniqueJobs}
                    uniqueLevels={uniqueLevels}
                    uniqueWorkTypes={uniqueWorkTypes}
                    uniquePayTypes={uniquePayTypes}
                    uniquePayRates={uniquePayRates}
                    uniqueIncentiveRates={uniqueIncentiveRates}
                />
            </div>
        </div>
    );
}
