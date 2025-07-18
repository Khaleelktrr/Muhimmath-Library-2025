import { useState } from "react";
import { useLocation } from "wouter";
import { ChartLine, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CirculationTab from "@/components/admin/circulation-tab";
import LibraryTab from "@/components/admin/library-tab";
import MembersTab from "@/components/admin/members-tab";
import FeedbackTab from "@/components/admin/feedback-tab";
import HistoryTab from "@/components/admin/history-tab";
import ViewReportsModal from "@/components/modals/view-reports-modal";

export default function Admin() {
  const [, navigate] = useLocation();
  const [showReportsModal, setShowReportsModal] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowReportsModal(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChartLine className="w-4 h-4 mr-2" />
                Reports
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <Bell className="w-4 h-4 mr-2" />
              </Button>
              <Button onClick={handleLogout} className="bg-primary hover:bg-primary/90">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="circulation" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white border-b mb-8">
            <TabsTrigger value="circulation">Circulation</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="circulation">
            <CirculationTab />
          </TabsContent>

          <TabsContent value="library">
            <LibraryTab />
          </TabsContent>

          <TabsContent value="members">
            <MembersTab />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackTab />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Reports Modal */}
      <ViewReportsModal open={showReportsModal} onOpenChange={setShowReportsModal} />
    </div>
  );
}
