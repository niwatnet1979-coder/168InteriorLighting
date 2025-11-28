'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DataPage() {
    const [activeTab, setActiveTab] = useState('Customer');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const tables = ['Customer', 'Bill', 'Sale', 'CShip', 'CTax', 'Installation_Ship'];

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    const fetchData = async (table: string) => {
        setLoading(true);
        try {
            const { data: result, error } = await supabase
                .from(table)
                .select('*')
                .limit(100); // Limit for performance

            if (error) throw error;
            setData(result || []);
        } catch (error) {
            console.error(`Error fetching ${table}:`, error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Data Overview</h1>

            {/* Tabs */}
            <div className="flex border-b mb-6 overflow-x-auto">
                {tables.map((table) => (
                    <button
                        key={table}
                        onClick={() => setActiveTab(table)}
                        className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === table
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {table}
                    </button>
                ))}
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="overflow-x-auto bg-white shadow rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {data.length > 0 && Object.keys(data[0]).map((key) => (
                                    <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((row, idx) => (
                                <tr key={idx}>
                                    {Object.values(row).map((val: any, i) => (
                                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={100} className="px-6 py-10 text-center text-gray-500">
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
