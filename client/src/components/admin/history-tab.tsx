import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Download, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Circulation, Book, Member } from "@shared/schema";

export default function HistoryTab() {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  const { data: circulation = [] } = useQuery<Circulation[]>({
    queryKey: ["/api/circulation"],
  });

  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const getBookTitle = (bookId: number) => {
    const book = books.find(b => b.id === bookId);
    return book?.title || "Unknown";
  };

  const getMemberName = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    return member?.fullName || "Unknown";
  };

  const filteredCirculation = circulation.filter(record => {
    const recordDate = new Date(record.date);
    const year = recordDate.getFullYear().toString();
    const month = recordDate.getMonth();
    
    const actionMatch = actionFilter === "all" || record.action === actionFilter;
    const yearMatch = yearFilter === "all" || year === yearFilter;
    const monthMatch = monthFilter === "all" || month === parseInt(monthFilter);
    
    return actionMatch && yearMatch && monthMatch;
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getActionBadge = (action: string) => {
    switch (action) {
      case "borrow":
        return <Badge className="bg-blue-100 text-blue-800">Borrow</Badge>;
      case "return":
        return <Badge className="bg-green-100 text-green-800">Return</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <History className="w-5 h-5 text-gray-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Borrow & Return History</h2>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="borrow">Borrow</SelectItem>
                <SelectItem value="return">Return</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month, index) => (
                  <SelectItem key={month} value={index.toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        {filteredCirculation.length > 0 ? (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 py-3 border-b border-gray-200 text-sm font-medium text-gray-700">
              <div>Book</div>
              <div>Member</div>
              <div>Action</div>
              <div>Date</div>
            </div>
            
            {/* Table Content */}
            <div className="space-y-2">
              {filteredCirculation.map((record) => (
                <div key={record.id} className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">{getBookTitle(record.bookId)}</p>
                  </div>
                  <div>
                    <p className="text-gray-900">{getMemberName(record.memberId)}</p>
                  </div>
                  <div>
                    {getActionBadge(record.action)}
                  </div>
                  <div>
                    <p className="text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                    {record.dueDate && (
                      <p className="text-xs text-gray-500">
                        Due: {new Date(record.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No borrow or return history found for the selected period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
