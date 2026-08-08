import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import ConfirmModal from '@/Components/ConfirmModal';

export default function RenterRequestsIndex({ auth, requests = [], houses = [] }) {
    const user = auth?.user;
    const isLandlord = user?.role === 'landlord';
    const userPerms = auth?.permissions || user?.permissions || [];
    const canCreateRenter = isLandlord || userPerms.includes('renter_requests.create');
    const canEditRenter = isLandlord || userPerms.includes('renter_requests.edit');

    const [selectedHouse, setSelectedHouse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'new' | 'renting' | 'former' | 'archived'
    const [confirmArchive, setConfirmArchive] = useState({ show: false, id: null });

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

    // Calculate house statistics
    const getHouseStats = (houseId) => {
        const houseRequests = requestsArray.filter(r => r.room && r.room.house_id === houseId);
        const total = houseRequests.filter(r => !r.is_archived).length;
        const newCount = houseRequests.filter(r => r.status === 'new' && !r.is_archived && !r.has_active_contract).length;
        const rentingCount = houseRequests.filter(r => r.has_active_contract && !r.is_archived).length;
        return { total, newCount, rentingCount };
    };

    // Filter logic for selected house
    const houseRequests = selectedHouse
        ? requestsArray.filter(r => r.room && r.room.house_id === selectedHouse.id)
        : [];

    // Categorized lists for counts
    const countAll = houseRequests.filter(r => !r.is_archived).length;
    const countNew = houseRequests.filter(r => !r.is_archived && !r.has_active_contract && !r.is_former_tenant).length;
    const countRenting = houseRequests.filter(r => !r.is_archived && r.has_active_contract).length;
    const countFormer = houseRequests.filter(r => !r.is_archived && r.is_former_tenant).length;
    const countArchived = houseRequests.filter(r => r.is_archived).length;

    const filteredRequests = houseRequests.filter(request => {
        // Search filter
        const matchesSearch = (request.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (request.phone || '').includes(searchTerm) ||
            (request.room?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Tab filter
        if (activeTab === 'all') {
            return !request.is_archived;
        }
        if (activeTab === 'new') {
            return !request.is_archived && !request.has_active_contract && !request.is_former_tenant;
        }
        if (activeTab === 'renting') {
            return !request.is_archived && request.has_active_contract;
        }
        if (activeTab === 'former') {
            return !request.is_archived && request.is_former_tenant;
        }
        if (activeTab === 'archived') {
            return request.is_archived;
        }

        return true;
    });

    return (
        <div className="min-h-screen bg-emerald-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Yêu cầu thuê phòng" />

            <div className="max-w-[1400px] mx-auto">

                {/* HOUSE LIST GRID VIEW */}
                {!selectedHouse ? (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                            <div>
                                <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Hộp thư đến
                                </p>
                                <h1 className="text-3xl font-extrabold text-teal-900 tracking-tight">Yêu cầu thuê phòng</h1>
                                <p className="text-gray-500 mt-1 text-sm">Chọn nhà trọ/căn hộ để xem các yêu cầu thuê phòng từ khách hàng</p>
                            </div>
                        </div>

                        {houses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border-2 border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium">Bạn chưa quản lý nhà nào.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {houses.map((house) => {
                                    const { total, newCount, rentingCount } = getHouseStats(house.id);

                                    return (
                                        <div
                                            key={house.id}
                                            onClick={() => setSelectedHouse(house)}
                                            className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-100 transition-colors"></div>

                                            <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                                                <div>
                                                    <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider mb-2">
                                                        {house.type === 'apartment' ? 'Chung cư' : house.type === 'boarding_house' ? 'Nhà trọ' : 'Căn hộ'}
                                                    </span>
                                                    <h3 className="text-xl font-extrabold text-teal-900 leading-snug group-hover:text-emerald-700 transition-colors">
                                                        {house.name}
                                                    </h3>
                                                </div>
                                                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-all">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-500 flex items-center gap-1 mb-6 relative z-10">
                                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="truncate">{house.address || 'Chưa cập nhật địa chỉ'}</span>
                                            </p>

                                            <div className="pt-4 border-t border-gray-50 flex flex-col gap-2 relative z-10 text-xs font-semibold text-gray-600">
                                                <div className="flex justify-between">
                                                    <span>🆕 Yêu cầu chưa thuê:</span>
                                                    <span className="text-blue-600 font-bold">{newCount} khách</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>🏠 Đang thuê:</span>
                                                    <span className="text-emerald-600 font-bold">{rentingCount} khách</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* DRILL-DOWN HEADER */}
                        <div className="mb-6">
                            <button
                                onClick={() => {
                                    setSelectedHouse(null);
                                    setSearchTerm('');
                                    setActiveTab('all');
                                }}
                                className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-emerald-600 mb-4 transition-colors group"
                            >
                                <svg className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Quay lại danh sách nhà
                            </button>

                            <div className="bg-white rounded-[24px] shadow-xl shadow-emerald-900/5 border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold uppercase tracking-wider">
                                                {selectedHouse.type === 'apartment' ? 'Chung cư' : selectedHouse.type === 'boarding_house' ? 'Nhà trọ' : 'Căn hộ'}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-xs text-gray-400 font-semibold">{houseRequests.length} yêu cầu thuê tổng cộng</span>
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-900 tracking-tight">
                                            {selectedHouse.name}
                                        </h1>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {selectedHouse.address}
                                        </p>
                                    </div>

                                    {canCreateRenter && (
                                        <Link
                                            href={route('landlord.renter-requests.create')}
                                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Tạo yêu cầu mới
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* TAB BAR FOR SEGMENTATION */}
                        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2 text-sm font-bold">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'all' ? 'bg-teal-800 text-white shadow-sm' : 'text-gray-500 hover:text-teal-800'}`}
                            >
                                👥 Tất cả <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{countAll}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('new')}
                                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'new' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                                🆕 Yêu cầu mới <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'new' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>{countNew}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('renting')}
                                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'renting' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-emerald-600'}`}
                            >
                                🏠 Khách đang thuê <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'renting' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>{countRenting}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('former')}
                                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'former' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-500 hover:text-amber-600'}`}
                            >
                                ⏳ Khách thuê cũ <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'former' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'}`}>{countFormer}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('archived')}
                                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'archived' ? 'bg-slate-600 text-white shadow-sm' : 'text-gray-500 hover:text-slate-600'}`}
                            >
                                📁 Đã lưu trữ <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'archived' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{countArchived}</span>
                            </button>

                            {/* Search bar insideSelectedHouse */}
                            <div className="relative w-full sm:w-64 ml-auto self-center">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-none"
                                />
                                <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>

                        {/* LIST VIEW (HORIZONTAL CARDS) */}
                        {filteredRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium">Không tìm thấy yêu cầu hoặc khách thuê nào thuộc tab này.</p>
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
                                            <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${request.is_archived ? 'bg-slate-400' :
                                                request.has_active_contract ? 'bg-emerald-500' :
                                                    request.is_former_tenant ? 'bg-amber-500' : 'bg-blue-500'
                                                }`}></div>

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
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 00-2.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    </div>
                                                    <span className="truncate" title={request.email}>{request.email || '---'}</span>
                                                </div>

                                                {/* Room Info */}
                                                <div className="flex items-center gap-2.5 text-sm text-gray-600 sm:col-span-2 lg:col-span-1">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                    </div>
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="text-xs text-gray-400 font-bold uppercase">Phòng thuê</span>
                                                        <span className="font-bold text-gray-900 truncate max-w-[150px]">Phòng {request.room?.name || '---'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3. Status & Action Section (Right) */}
                                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 w-full md:w-auto md:pl-6 md:border-l md:border-dashed md:border-gray-200">
                                                <div className="flex flex-col items-end gap-2">
                                                    {/* Trạng thái yêu cầu ban đầu */}
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.text} ${status.border} flex items-center gap-1.5`}>
                                                        <span>{status.icon}</span> {status.label}
                                                    </div>

                                                    {/* Phân loại cụ thể */}
                                                    {request.has_active_contract && !request.is_archived && (
                                                        <div className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5">
                                                            <span>🏠</span> Đang thuê
                                                        </div>
                                                    )}
                                                    {request.is_former_tenant && !request.is_archived && (
                                                        <div className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5">
                                                            <span>⏳</span> Khách cũ
                                                        </div>
                                                    )}
                                                    {request.is_archived && (
                                                        <div className="px-3 py-1 rounded-full text-xs font-bold border bg-slate-100 text-slate-600 border-slate-200 flex items-center gap-1.5">
                                                            <span>📁</span> Đã lưu trữ
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    {request.is_archived ? (
                                                        <Link
                                                            href={route('landlord.renter-requests.restore', request.id)}
                                                            method="post"
                                                            as="button"
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-600/10"
                                                        >
                                                            Khôi phục
                                                        </Link>
                                                    ) : (
                                                        <>
                                                            {/* Create Account button */}
                                                            {request.status === 'approved' && request.has_active_contract && !request.has_user_account && (
                                                                <Link
                                                                    href={route('landlord.renter-requests.create-account', request.id)}
                                                                    method="post"
                                                                    as="button"
                                                                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                                                                    title="Tạo tài khoản đăng nhập"
                                                                >
                                                                    Tạo TK
                                                                </Link>
                                                            )}


                                                            <Link
                                                                href={route('landlord.renter-requests.show', request.id)}
                                                                className="px-3 py-1.5 bg-white text-gray-700 text-xs font-bold rounded-xl border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-1.5"
                                                            >
                                                                Chi tiết
                                                            </Link>

                                                            {/* Archive Button */}
                                                            {canEditRenter && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setConfirmArchive({ show: true, id: request.id })}
                                                                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                                                                    title="Lưu trữ khách hàng"
                                                                >
                                                                    Lưu trữ
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            <ConfirmModal
                show={confirmArchive.show}
                onClose={() => setConfirmArchive({ show: false, id: null })}
                onConfirm={() => {
                    router.delete(route('landlord.renter-requests.destroy', confirmArchive.id), {
                        onFinish: () => setConfirmArchive({ show: false, id: null }),
                    });
                }}
                title="Lưu trữ yêu cầu"
                message="Bạn có chắc chắn muốn di chuyển khách thuê/yêu cầu này vào mục lưu trữ không?"
                confirmText="Lưu trữ"
                type="danger"
            />
        </div>
    );
}

RenterRequestsIndex.layout = (page) => <AuthenticatedLayout children={page} />;