'use client';

import { Team } from '@/types/schema';
import { Edit, Trash2 } from 'lucide-react';

interface TeamTableProps {
    teams: Team[];
    onEdit: (team: Team) => void;
    onDelete: (tid: string) => void;
}

export default function TeamTable({ teams, onEdit, onDelete }: TeamTableProps) {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อเล่น</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ทีม</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {teams.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                ไม่พบข้อมูลทีมงาน
                            </td>
                        </tr>
                    ) : (
                        teams.map((team) => (
                            <tr key={team.EID} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.EID}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.NickName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.FullName} {team.LastName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.TeamName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.TeamType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.Email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(team)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => onDelete(team.EID)} className="text-red-600 hover:text-red-900">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
