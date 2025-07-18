import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Book } from "@shared/schema";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "issued":
        return "bg-red-100 text-red-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Available";
      case "issued":
        return "Checked Out";
      case "reserved":
        return "Reserved";
      default:
        return status;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Book Cover - Using a placeholder for now */}
        <div className="w-full h-48 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <div className="text-2xl mb-2">📚</div>
            <div className="text-sm">No Cover</div>
          </div>
        </div>
        
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2" title={book.title}>
          {book.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2 line-clamp-1" title={book.author}>
          {book.author}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(book.status)}>
            {getStatusText(book.status)}
          </Badge>
          <span className="text-xs text-gray-500">{book.category}</span>
        </div>
      </CardContent>
    </Card>
  );
}
