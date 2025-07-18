import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BookSuggestion, BookReview, Member, Book } from "@shared/schema";

export default function FeedbackTab() {
  const [activeTab, setActiveTab] = useState<"suggestions" | "reviews">("suggestions");

  const { data: suggestions = [] } = useQuery<BookSuggestion[]>({
    queryKey: ["/api/book-suggestions"],
  });

  const { data: reviews = [] } = useQuery<BookReview[]>({
    queryKey: ["/api/book-reviews"],
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const getMemberName = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    return member?.fullName || "Unknown";
  };

  const getBookTitle = (bookId: number) => {
    const book = books.find(b => b.id === bookId);
    return book?.title || "Unknown";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex space-x-4">
          <Button
            variant={activeTab === "suggestions" ? "default" : "outline"}
            onClick={() => setActiveTab("suggestions")}
            className="text-sm"
          >
            Book Suggestions
          </Button>
          <Button
            variant={activeTab === "reviews" ? "default" : "outline"}
            onClick={() => setActiveTab("reviews")}
            className="text-sm"
          >
            Book Reviews
          </Button>
        </div>
      </div>
      
      <CardContent className="p-6">
        {activeTab === "suggestions" && (
          <>
            {suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{suggestion.bookTitle}</h3>
                        <p className="text-sm text-gray-600">by {suggestion.author}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Suggested by {getMemberName(suggestion.memberId)}
                        </p>
                      </div>
                      <Badge 
                        variant={suggestion.status === "pending" ? "secondary" : "default"}
                        className="ml-2"
                      >
                        {suggestion.status}
                      </Badge>
                    </div>
                    
                    {suggestion.reason && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{suggestion.reason}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <span className="text-xs text-gray-500">
                        {new Date(suggestion.createdAt).toLocaleDateString()}
                      </span>
                      
                      {suggestion.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No book suggestions have been submitted yet.</p>
              </div>
            )}
          </>
        )}

        {activeTab === "reviews" && (
          <>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{getBookTitle(review.bookId)}</h3>
                        <p className="text-sm text-gray-600">
                          Reviewed by {getMemberName(review.memberId)}
                        </p>
                        <div className="flex items-center mt-1">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-600">
                            {review.rating} out of 5
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{review.review}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No book reviews have been submitted yet.</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
