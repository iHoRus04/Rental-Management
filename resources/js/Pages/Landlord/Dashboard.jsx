import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Dashboard() {
    const { stats } = usePage().props;
    const [pendingReminders, setPendingReminders] = useState(0);

    useEffect(() => {
        // Fetch pending reminders count
        fetch(route('landlord.reminders.pendingCount'))
            .then(res => res.json())
            .then(data => setPendingReminders(data.count))
            .catch(err => console.error('Error fetching reminders:', err));
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-600 mt-1">Welcome back! Here's your property overview</p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={route('landlord.reminders.create')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Reminder
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Key Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Properties */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 rounded-lg p-3">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <p className="text-white/80 text-sm font-medium">Total Properties</p>
                            <p className="text-4xl font-bold mt-1">{stats?.totalHouses || 0}</p>
                            <Link href={route('landlord.houses.index')} className="text-sm text-white/90 hover:text-white mt-2 inline-flex items-center">
                                View all
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Total Rooms */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 rounded-lg p-3">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <p className="text-white/80 text-sm font-medium">Total Rooms</p>
                            <p className="text-4xl font-bold mt-1">{stats?.totalRooms || 0}</p>
                            <p className="text-sm text-white/90 mt-2">
                                <span className="font-semibold">{stats?.occupiedRooms || 0}</span> occupied · 
                                <span className="font-semibold"> {stats?.vacantRooms || 0}</span> vacant
                            </p>
                        </div>
                    </div>

                    {/* Active Contracts */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 rounded-lg p-3">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <p className="text-white/80 text-sm font-medium">Active Contracts</p>
                            <p className="text-4xl font-bold mt-1">{stats?.activeContracts || 0}</p>
                            <p className="text-sm text-white/90 mt-2">
                                {stats?.totalRenters || 0} total renters
                            </p>
                        </div>
                    </div>

                    {/* Pending Reminders */}
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 rounded-lg p-3">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            {pendingReminders > 0 && (
                                <span className="bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                                    {pendingReminders}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-white/80 text-sm font-medium">Pending Reminders</p>
                            <p className="text-4xl font-bold mt-1">{pendingReminders}</p>
                            <Link href={route('landlord.reminders.index')} className="text-sm text-white/90 hover:text-white mt-2 inline-flex items-center">
                                View reminders
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Revenue Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
                            <div className="bg-blue-100 rounded-lg p-2">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {(stats?.monthlyRevenue || 0).toLocaleString('vi-VN')} ₫
                        </p>
                        <p className="text-sm text-gray-600 mt-2">This month's total</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Collected</h3>
                            <div className="bg-green-100 rounded-lg p-2">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            {(stats?.collectedAmount || 0).toLocaleString('vi-VN')} ₫
                        </p>
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${stats?.collectionRate || 0}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{stats?.collectionRate || 0}% collection rate</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
                            <div className="bg-orange-100 rounded-lg p-2">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-orange-600">
                            {(stats?.pendingAmount || 0).toLocaleString('vi-VN')} ₫
                        </p>
                        <p className="text-sm text-gray-600 mt-2">{stats?.unpaidBills || 0} unpaid bills</p>
                    </div>
                </div>

                {/* Quick Actions & Reports */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Quick Actions
                        </h2>
                        <div className="space-y-2">
                            <Link
                                href={route('landlord.houses.create')}
                                className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all group"
                            >
                                <div className="bg-blue-600 rounded-lg p-2 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="ml-3 font-medium text-gray-900">Add New Property</span>
                            </Link>
                            
                            <Link
                                href={route('landlord.renters.create')}
                                className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all group"
                            >
                                <div className="bg-green-600 rounded-lg p-2 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <span className="ml-3 font-medium text-gray-900">Add New Renter</span>
                            </Link>
                            
                            <Link
                                href={route('landlord.payments.index')}
                                className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition-all group"
                            >
                                <div className="bg-purple-600 rounded-lg p-2 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <span className="ml-3 font-medium text-gray-900">Manage Payments</span>
                            </Link>
                            
                            <Link
                                href={route('landlord.meter-logs.index')}
                                className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-lg transition-all group"
                            >
                                <div className="bg-orange-600 rounded-lg p-2 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <span className="ml-3 font-medium text-gray-900">Utility Meters</span>
                            </Link>
                        </div>
                    </div>

                    {/* Reports */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Reports & Analytics
                        </h2>
                        <div className="space-y-2">
                            <Link
                                href={route('landlord.reports.monthly')}
                                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all group"
                            >
                                <div className="flex items-center">
                                    <div className="bg-blue-100 rounded-lg p-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                    </div>
                                    <span className="ml-3 font-medium text-gray-900">Monthly Revenue</span>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            
                            <Link
                                href={route('landlord.reports.yearToDate')}
                                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all group"
                            >
                                <div className="flex items-center">
                                    <div className="bg-green-100 rounded-lg p-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="ml-3 font-medium text-gray-900">Year to Date</span>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            
                            <Link
                                href={route('landlord.reports.paymentHistory')}
                                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all group"
                            >
                                <div className="flex items-center">
                                    <div className="bg-purple-100 rounded-lg p-2">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="ml-3 font-medium text-gray-900">Payment History</span>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            
                            <Link
                                href={route('landlord.bills.index')}
                                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all group"
                            >
                                <div className="flex items-center">
                                    <div className="bg-orange-100 rounded-lg p-2">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <span className="ml-3 font-medium text-gray-900">All Bills</span>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
