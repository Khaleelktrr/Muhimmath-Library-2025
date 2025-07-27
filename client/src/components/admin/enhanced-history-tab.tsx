import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Circulation, Book, Member } from "@shared/schema";

interface CirculationPair {
  bookId: number;
  memberId: number;
  bookTitle: string;
  memberName: string;
  borrowDate: Date;
  returnDate: Date | null;
  dueDate: Date | null;
  isOverdue: boolean;
  isActive: boolean;
}

export default function EnhancedHistoryTab() {
  const [actionFilter, setActionFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  const { data: circulation = [] } = useQuery<Circulation[]>({
    queryKey: ["/api/circulation"],
  });

  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  // Helper functions
  const getBookTitle = (bookId: number) => {
    const book = books.find(b => b.id === bookId);
    return book ? book.title : "Unknown Book";
  };

  const getMemberName = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.fullName : "Unknown Member";
  };

  // Process circulation data into borrow-return pairs
  const circulationPairs = useMemo(() => {
    const pairs: CirculationPair[] = [];
    const borrowRecords = circulation.filter(record => record.action === "borrow");
    
    borrowRecords.forEach(borrowRecord => {
      // Find corresponding return record
      const returnRecord = circulation.find(record => 
        record.action === "return" && 
        record.bookId === borrowRecord.bookId && 
        record.memberId === borrowRecord.memberId &&
        new Date(record.date || 0) > new Date(borrowRecord.date || 0)
      );

      const borrowDate = new Date(borrowRecord.date || 0);
      const returnDate = returnRecord ? new Date(returnRecord.date || 0) : null;
      const dueDate = borrowRecord.dueDate ? new Date(borrowRecord.dueDate) : null;
      const isOverdue = dueDate && !returnDate && new Date() > dueDate;
      const isActive = borrowRecord.status === "active";

      pairs.push({
        bookId: borrowRecord.bookId,
        memberId: borrowRecord.memberId,
        bookTitle: getBookTitle(borrowRecord.bookId),
        memberName: getMemberName(borrowRecord.memberId),
        borrowDate,
        returnDate,
        dueDate,
        isOverdue: !!isOverdue,
        isActive: !!isActive
      });
    });

    return pairs.sort((a, b) => b.borrowDate.getTime() - a.borrowDate.getTime());
  }, [circulation, books, members, getBookTitle, getMemberName]);

  // Filter pairs based on selected filters
  const filteredPairs = circulationPairs.filter(pair => {
    const year = pair.borrowDate.getFullYear().toString();
    const month = pair.borrowDate.getMonth();
    
    const actionMatch = actionFilter === "all" || 
      (actionFilter === "completed" && pair.returnDate) ||
      (actionFilter === "active" && !pair.returnDate);
    
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

  const getStatusBadge = (pair: CirculationPair) => {
    if (pair.isOverdue) {
      return <Badge className="bg-red-500 text-white font-bold">🚨 OVERDUE</Badge>;
    }
    if (pair.isActive && !pair.returnDate) {
      return <Badge className="bg-orange-100 text-orange-800 font-bold">⚡ ACTIVE</Badge>;
    }
    if (pair.returnDate) {
      return <Badge className="bg-green-100 text-green-800">✅ COMPLETED</Badge>;
    }
    return <Badge variant="secondary">UNKNOWN</Badge>;
  };

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Circulation History</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="active">Active Loans</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
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
              <SelectTrigger className="w-36">
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
        {filteredPairs.length > 0 ? (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 py-3 border-b border-gray-200 text-sm font-medium text-gray-700">
              <div className="col-span-3">Book Title</div>
              <div className="col-span-2">Member</div>
              <div className="col-span-2">Borrow Date</div>
              <div className="col-span-2">Return Date</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-1">Status</div>
            </div>
            
            {/* Table Content */}
            <div className="space-y-2">
              {filteredPairs.map((pair, index) => (
                <div 
                  key={`${pair.bookId}-${pair.memberId}-${pair.borrowDate.getTime()}`} 
                  className={`grid grid-cols-12 gap-4 py-4 border-b border-gray-100 rounded-md px-2 ${
                    pair.isOverdue ? 'bg-red-50 border-red-200' : 
                    pair.isActive ? 'bg-orange-50 border-orange-200' : 
                    'hover:bg-gray-50'
                  }`}
                >
                  <div className="col-span-3">
                    <p className="font-medium text-gray-900">{pair.bookTitle}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-sm text-gray-700">{pair.memberName}</p>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      📅 {pair.borrowDate.toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    {pair.returnDate ? (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        ↩️ {pair.returnDate.toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs italic">
                        Not returned
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    {pair.dueDate && (
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        pair.isOverdue 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        ⏰ {pair.dueDate.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-1">
                    {getStatusBadge(pair)}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No History Found</h3>
            <p className="text-gray-600">
              {actionFilter !== "all" || yearFilter !== "all" || monthFilter !== "all"
                ? "No records match your selected filters."
                : "No circulation history available yet."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}