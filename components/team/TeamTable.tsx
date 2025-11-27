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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อเล่น</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ตำแหน่ง</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เบอร์โทร</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
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
                            <tr key={team.TID} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.TID}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.TName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.TNickName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.TPosition}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.TTel}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${team.TStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {team.TStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(team)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => onDelete(team.TID)} className="text-red-600 hover:text-red-900">
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
