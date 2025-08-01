import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Download, Lightbulb, Pen, ChartBar, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BookCard from "@/components/public/book-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SuggestBookModal from "@/components/modals/suggest-book-modal";
import WriteReviewModal from "@/components/modals/write-review-modal";
import ViewReportsModal from "@/components/modals/view-reports-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import type { Book } from "@shared/schema";

export default function Home() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);

  const { data: books = [], isLoading: booksLoading } = useQuery<Book[]>({ 
    queryKey: ["/api/books"],
  });

  const { data: issuedBooks = [] } = useQuery<{ book: Book; member: { id: number; fullName: string; class: string; registrationNo: string }; dueDate: Date | null }[]>({
    queryKey: ["/api/analytics/issued-books"],
  });

  const { data: searchResults = [], isLoading: searchLoading } = useQuery<Book[]>({
    queryKey: ["/api/books/search", searchQuery],
    enabled: searchQuery.length > 0,
    queryFn: async () => {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Failed to search books");
      return response.json();
    },
  });

  const displayBooks = searchQuery ? searchResults : books;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Muhimmath Library</h1>
            <div className="flex items-center space-x-4">

              <Button onClick={() => navigate("/login")} className="bg-primary hover:bg-primary/90">
                <Shield className="w-4 h-4 mr-2" />
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowSuggestModal(true)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Suggest a Book</h3>
              <p className="text-gray-600">Recommend books for our collection</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowReviewModal(true)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Pen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Write a Review</h3>
              <p className="text-gray-600">Share your thoughts on books</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowReportsModal(true)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <ChartBar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">View Reports</h3>
              <p className="text-gray-600">Library analytics and statistics</p>
            </CardContent>
          </Card>
        </div>

        {/* Library Collection */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Library Collection</h2>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export / Print
              </Button>
            </div>
          </div>
          
          <CardContent className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by title, author, book no, DDC, member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Loading State */}
            {(booksLoading || searchLoading) && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            {/* Books Table */}
            {!booksLoading && !searchLoading && displayBooks.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book No.</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>DDC</TableHead>
                      <TableHead>Publisher</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayBooks.map((book) => {
                      const borrower = issuedBooks.find(item => item.book.id === book.id)?.member;
                      return (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.id}</TableCell>
                          <TableCell>{book.title}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{book.ddc}</TableCell>
                          <TableCell>{book.publisher}</TableCell>
                          <TableCell>${book.price}</TableCell>
                          <TableCell>{book.category}</TableCell>
                          <TableCell>
                            {borrower ? (
                              <span className="text-red-600">Issued to {borrower.fullName}</span>
                            ) : (
                              <span className="text-green-600">Available</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Empty State */}
            {!booksLoading && !searchLoading && displayBooks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📚</div>
                <p className="text-gray-600">
                  {searchQuery ? "No books match your search criteria." : "No books available in the library."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <SuggestBookModal open={showSuggestModal} onOpenChange={setShowSuggestModal} />
      <WriteReviewModal open={showReviewModal} onOpenChange={setShowReviewModal} />
      <ViewReportsModal open={showReportsModal} onOpenChange={setShowReportsModal} />
    </div>
  );
}
