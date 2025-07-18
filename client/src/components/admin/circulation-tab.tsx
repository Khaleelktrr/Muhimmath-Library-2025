import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Book, Member } from "@shared/schema";

export default function CirculationTab() {
  const [activeTab, setActiveTab] = useState<"available" | "issued" | "overdue">("available");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const { data: issuedBooks = [] } = useQuery<{ book: Book; member: Member; dueDate: Date | null }[]>({
    queryKey: ["/api/analytics/issued-books"],
  });

  const availableBooks = books.filter(book => book.status === "available");
  const overdueBooks = issuedBooks.filter(item => 
    item.dueDate && new Date(item.dueDate) < new Date()
  );

  const getTabCount = (tab: string) => {
    switch (tab) {
      case "available":
        return availableBooks.length;
      case "issued":
        return issuedBooks.length;
      case "overdue":
        return overdueBooks.length;
      default:
        return 0;
    }
  };

  const getDisplayData = () => {
    switch (activeTab) {
      case "available":
        return availableBooks.filter(book => 
          searchQuery === "" || 
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case "issued":
        return issuedBooks.filter(item => 
          searchQuery === "" || 
          item.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.member.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case "overdue":
        return overdueBooks.filter(item => 
          searchQuery === "" || 
          item.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.member.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      default:
        return [];
    }
  };

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Borrow & Return Books</h2>
      </div>
      
      <CardContent className="p-6">
        {/* Status Tabs */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === "available" ? "default" : "outline"}
            onClick={() => setActiveTab("available")}
            className="text-sm"
          >
            Available ({getTabCount("available")})
          </Button>
          <Button
            variant={activeTab === "issued" ? "default" : "outline"}
            onClick={() => setActiveTab("issued")}
            className="text-sm"
          >
            Issued ({getTabCount("issued")})
          </Button>
          <Button
            variant={activeTab === "overdue" ? "default" : "outline"}
            onClick={() => setActiveTab("overdue")}
            className="text-sm"
          >
            Overdue ({getTabCount("overdue")})
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by title, author, or member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === "available" && (
            <>
              {getDisplayData().length > 0 ? (
                <div className="grid gap-4">
                  {(getDisplayData() as Book[]).map((book) => (
                    <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{book.title}</h3>
                        <p className="text-sm text-gray-600">{book.author}</p>
                        <p className="text-xs text-gray-500">{book.category}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                        <Button size="sm">Issue Book</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📚</div>
                  <p className="text-gray-600">No available books match your criteria.</p>
                </div>
              )}
            </>
          )}

          {activeTab === "issued" && (
            <>
              {getDisplayData().length > 0 ? (
                <div className="grid gap-4">
                  {(getDisplayData() as { book: Book; member: Member; dueDate: Date | null }[]).map((item) => (
                    <div key={`${item.book.id}-${item.member.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.book.title}</h3>
                        <p className="text-sm text-gray-600">{item.book.author}</p>
                        <p className="text-xs text-gray-500">Borrowed by {item.member.fullName}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-red-100 text-red-800">Issued</Badge>
                        {item.dueDate && (
                          <Badge variant="outline">
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </Badge>
                        )}
                        <Button size="sm" variant="outline">Return Book</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📖</div>
                  <p className="text-gray-600">No issued books match your criteria.</p>
                </div>
              )}
            </>
          )}

          {activeTab === "overdue" && (
            <>
              {getDisplayData().length > 0 ? (
                <div className="grid gap-4">
                  {(getDisplayData() as { book: Book; member: Member; dueDate: Date | null }[]).map((item) => (
                    <div key={`${item.book.id}-${item.member.id}`} className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.book.title}</h3>
                        <p className="text-sm text-gray-600">{item.book.author}</p>
                        <p className="text-xs text-gray-500">Borrowed by {item.member.fullName}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                        {item.dueDate && (
                          <Badge variant="destructive">
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </Badge>
                        )}
                        <Button size="sm" variant="outline">Return Book</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">✅</div>
                  <p className="text-gray-600">No overdue books found.</p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
