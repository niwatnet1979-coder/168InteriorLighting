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
                .order('Timestamp', { ascending: false });

            if (error) throw error;
            setTeams(data || []);
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
                    .select('Timestamp')
                    .eq('TID', teamData.TID)
                    .single();

                if (latestData && new Date(latestData.Timestamp).getTime() > new Date(currentTeam.Timestamp).getTime() + 1000) {
                    alert('ข้อมูลถูกแก้ไขโดยผู้ใช้อื่น กรุณาโหลดหน้าใหม่!');
                    fetchTeams();
                    setIsSaving(false);
                    return;
                }
            }

            const dataToSave = { ...teamData, Timestamp: new Date().toISOString() };

            const { error } = currentTeam
                ? await supabase.from('Team').update(dataToSave).eq('TID', teamData.TID)
                : await supabase.from('Team').insert([dataToSave]);

            if (error) throw error;

            setIsModalOpen(false);
            fetchTeams();

        } catch (error: any) {
            alert('Error saving team: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (tid: string) => {
        if (!confirm(`คุณต้องการลบทีมงาน ${tid} ใช่หรือไม่?`)) return;
        try {
            const { error } = await supabase.from('Team').delete().eq('TID', tid);
            if (error) throw error;
            fetchTeams();
        } catch (error: any) {
            alert('Error deleting: ' + error.message);
        }
    };

    const filteredTeams = teams.filter(t =>
        (t.TID && t.TID.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.TName && t.TName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.TNickName && t.TNickName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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

                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตาม TID, ชื่อ, ชื่อเล่น..."
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
                />
            </div>
        </div>
    );
}
