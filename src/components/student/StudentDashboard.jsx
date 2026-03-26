import React, { useState, useEffect } from 'react';
import Home from './Home';
import BottomNav from './BottomNav';
import ScanScreen from './ScanScreen';
import EntryLogs from './EntryLogs';
import ProfileScreen from './ProfileScreen';
import Notifications from './Notifications';
import ActivationScreen from './ActivationScreen';
import { LogOut } from 'lucide-react';

const StudentDashboard = ({ studentData: initialStudentData, onLogout }) => {
    const [activeTab, setActiveTab] = useState('home');
    const [studentData, setStudentData] = useState(initialStudentData);

    useEffect(() => {
        setStudentData(initialStudentData);
    }, [initialStudentData]);

    const handleStatusChange = (newStatus) => {
        setStudentData(prev => ({ ...prev, status: newStatus }));
    };

    if (studentData?.status === 'Pending' || studentData?.status === 'Under Review') {
        return (
            <div className="flex flex-col h-screen bg-white max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-gray-100">
                 <ActivationScreen studentData={studentData} onStatusChange={handleStatusChange} onLogout={onLogout} />
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <Home studentData={studentData} onNotificationClick={() => setActiveTab('notifications')} />;
            case 'scan':
                return <ScanScreen studentData={studentData} onBack={() => setActiveTab('home')} />;
            case 'logs':
                return <EntryLogs studentData={studentData} />;
            case 'profile':
                return <ProfileScreen studentData={studentData} onLogout={onLogout} />;
            case 'notifications':
                return <Notifications studentData={studentData} onBack={() => setActiveTab('home')} />;
            default:
                return <Home studentData={studentData} onNotificationClick={() => setActiveTab('notifications')} />;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-gray-50">
            {/* Main View Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f8f9fb]">
                {renderContent()}
            </div>

            {/* Navigation */}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};

export default StudentDashboard;
