import { useQuery } from "@tanstack/react-query";
import { BookOpen, Users, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Book, Member } from "@shared/schema";

interface ViewReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewReportsModal({ open, onOpenChange }: ViewReportsModalProps) {
  const { data: mostReadBooks = [] } = useQuery<{ book: Book; borrowCount: number }[]>({
    queryKey: ["/api/analytics/most-read-books"],
    enabled: open,
  });

  const { data: mostActiveReaders = [] } = useQuery<{ member: Member; borrowCount: number }[]>({
    queryKey: ["/api/analytics/most-active-readers"],
    enabled: open,
  });

  const { data: issuedBooks = [] } = useQuery<{ book: Book; member: Member; dueDate: Date | null }[]>({
    queryKey: ["/api/analytics/issued-books"],
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Library Analytics</DialogTitle>
        </DialogHeader>
        
        <p className="text-gray-600 mb-6">Select a report to view details.</p>
        
        <div className="space-y-6">
          {/* Most Read Books */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Most Read Books</h3>
                  <p className="text-gray-600">Books with highest circulation</p>
                </div>
              </div>
              
              {mostReadBooks.length > 0 ? (
                <div className="space-y-3">
                  {mostReadBooks.slice(0, 5).map((item, index) => (
                    <div key={item.book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 mr-3">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.book.title}</p>
                          <p className="text-sm text-gray-600">{item.book.author}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{item.borrowCount} borrows</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No borrowing data available</p>
              )}
            </CardContent>
          </Card>

          {/* Most Active Readers */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Most Active Readers</h3>
                  <p className="text-gray-600">Members with most borrows</p>
                </div>
              </div>
              
              {mostActiveReaders.length > 0 ? (
                <div className="space-y-3">
                  {mostActiveReaders.slice(0, 5).map((item, index) => (
                    <div key={item.member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 mr-3">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.member.fullName}</p>
                          <p className="text-sm text-gray-600">{item.member.class}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{item.borrowCount} borrows</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No reader data available</p>
              )}
            </CardContent>
          </Card>

          {/* Issued Books */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Issued Books</h3>
                  <p className="text-gray-600">Currently borrowed books</p>
                </div>
              </div>
              
              {issuedBooks.length > 0 ? (
                <div className="space-y-3">
                  {issuedBooks.map((item) => (
                    <div key={`${item.book.id}-${item.member.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.book.title}</p>
                        <p className="text-sm text-gray-600">Borrowed by {item.member.fullName}</p>
                      </div>
                      {item.dueDate && (
                        <Badge variant="outline">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No books currently issued</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
