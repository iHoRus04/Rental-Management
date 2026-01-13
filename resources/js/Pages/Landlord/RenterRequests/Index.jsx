import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function RenterRequestsIndex({ auth, requests }) {
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterContract, setFilterContract] = useState('all'); // Add contract filter
    const [searchTerm, setSearchTerm] = useState('');

    const requestsArray = Array.isArray(requests) ? requests : [];

    const getStatusConfig = (status) => {
        const config = {
            new: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Mới', icon: '✨', border: 'border-blue-200' },
            contacted: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Đã liên hệ', icon: '📞', border: 'border-yellow-200' },
            approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Đã duyệt', icon: '✅', border: 'border-emerald-200' },
            rejected: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Đã từ chối', icon: '❌', border: 'border-gray-200' },
        };
        return config[status] || { bg: 'bg-gray-50', text: 'text-gray-700', label: status, icon: '❔', border: 'border-gray-200' };
    };

    const filteredRequests = requestsArray.filter(request => {
        const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
        const matchesContract = filterContract === 'all' || 
                               (filterContract === 'renting' && request.has_active_contract) ||
                               (filterContract === 'not_renting' && !request.has_active_contract);
        const matchesSearch = (request.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (request.phone || '').includes(searchTerm) ||
                              (request.room?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesContract && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Yêu cầu thuê phòng" />
            
            <div className="max-w-[1200px] mx-auto">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div>
                        <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Hộp thư đến
                        </p>
                        <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Yêu cầu thuê phòng</h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>

                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full sm:w-auto py-2.5 pl-4 pr-10 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm cursor-pointer"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="new">✨ Mới</option>
                            <option value="contacted">📞 Đã liên hệ</option>
                            <option value="approved">✅ Đã duyệt</option>
                            <option value="rejected">❌ Đã từ chối</option>
                        </select>

                        <select 
                            value={filterContract}
                            onChange={(e) => setFilterContract(e.target.value)}
                            className="w-full sm:w-auto py-2.5 pl-4 pr-10 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm cursor-pointer"
                        >
                            <option value="all">Tất cả</option>
                            <option value="renting">🏠 Đang thuê</option>
                            <option value="not_renting">📋 Chưa thuê</option>
                        </select>

                        <Link
                            href={route('landlord.renter-requests.create')}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Tạo mới
                        </Link>
                    </div>
                </div>

                {/* --- LIST VIEW (HORIZONTAL CARDS) --- */}
                {filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                        </div>
                        <p className="text-gray-500 font-medium">Không tìm thấy yêu cầu nào.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.map((request) => {
                            const status = getStatusConfig(request.status || 'new');
                            
                            return (
                                <div 
                                    key={request.id || Math.random()} 
                                    className="group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex flex-col md:flex-row items-center gap-6"
                                >
                                    {/* Left Status Strip */}
                                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${status.bg.replace('50', '500')}`}></div>

                                    {/* 1. Identity Section */}
                                    <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[220px]">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 border border-white shadow-sm flex-shrink-0">
                                            {request.name ? request.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate" title={request.name}>{request.name || 'Không tên'}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {new Date(request.created_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Divider for mobile */}
                                    <div className="w-full h-px bg-gray-100 md:hidden"></div>

                                    {/* 2. Details Section (Middle) */}
                                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 md:border-l md:border-gray-100 md:pl-6">
                                        {/* Contact Info */}
                                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            </div>
                                            <span className="truncate font-medium">{request.phone || '---'}</span>
                                        </div>

                                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </div>
                                            <span className="truncate" title={request.email}>{request.email || '---'}</span>
                                        </div>

                                        {/* Room Info */}
                                        <div className="flex items-center gap-2.5 text-sm text-gray-600 sm:col-span-2 lg:col-span-1">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            </div>
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-xs text-gray-400 font-bold uppercase">Quan tâm</span>
                                                <span className="font-bold text-gray-900 truncate max-w-[150px]">{request.room?.name || '---'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Status & Action Section (Right) */}
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 w-full md:w-auto md:pl-6 md:border-l md:border-dashed md:border-gray-200">
                                        <div className="flex flex-col items-end gap-2">
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.text} ${status.border} flex items-center gap-1.5`}>
                                                <span>{status.icon}</span> {status.label}
                                            </div>
                                            
                                            {/* Show "Đang thuê" badge if has active contract */}
                                            {request.has_active_contract && (
                                                <div className="px-3 py-1 rounded-full text-xs font-bold border bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1.5">
                                                    <span>🏠</span> Đang thuê
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {/* Create Account button - show if approved & has contract but no user account */}
                                            {request.status === 'approved' && request.has_active_contract && !request.has_user_account && (
                                                <Link
                                                    href={route('landlord.renter-requests.create-account', request.id)}
                                                    method="post"
                                                    as="button"
                                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                                                    title="Tạo tài khoản đăng nhập"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    Tạo TK
                                                </Link>
                                            )}

                                            {/* Only show Services button for approved requests with active contract */}
                                            {request.status === 'approved' && request.has_active_contract && (
                                                <Link
                                                    href={route('landlord.renter-requests.services', request.id || '#')}
                                                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                                                    title="Quản lý dịch vụ"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                    Dịch vụ
                                                </Link>
                                            )}
                                            
                                            <Link
                                                href={route('landlord.renter-requests.show', request.id || '#')}
                                                className="px-4 py-2 bg-white text-gray-700 text-sm font-bold rounded-xl border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-2 group-hover:bg-emerald-50/50"
                                            >
                                                Chi tiết
                                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

RenterRequestsIndex.layout = (page) => <AuthenticatedLayout children={page} />;