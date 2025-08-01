import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { X, Check } from "lucide-react";
import type { Book, Member, InsertBookReview } from "@shared/schema";

const reviewSchema = z.object({
  bookId: z.number().min(1, "Please select a book"),
  memberId: z.number().min(1, "Please select a member"),
  rating: z.number().min(1).max(5),
  review: z.string().min(1, "Review is required"),
});

type ReviewForm = z.infer<typeof reviewSchema>;

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WriteReviewModal({ open, onOpenChange }: WriteReviewModalProps) {
  const { toast } = useToast();

  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      bookId: 0,
      memberId: 0,
      rating: 5,
      review: "",
    },
  });

  const createReview = useMutation({
    mutationFn: async (data: InsertBookReview) => {
      const response = await apiRequest("POST", "/api/book-reviews", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/book-reviews"] });
      toast({
        title: "Success",
        description: "Review submitted successfully!",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [bookPopoverOpen, setBookPopoverOpen] = useState(false);
  const [memberPopoverOpen, setMemberPopoverOpen] = useState(false);

  const onSubmit = (data: ReviewForm) => {
    createReview.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Book Review</DialogTitle>
        </DialogHeader>
        
        <p className="text-gray-600 mb-6">Share your thoughts on a book you've read.</p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bookId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book Title</FormLabel>
                  <Popover open={bookPopoverOpen} onOpenChange={setBookPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={bookPopoverOpen}
                          className="w-full justify-between"
                        >
                          {field.value
                            ? books.find((book) => book.id === field.value)?.title
                            : "Select a book..."}
                          <X className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search book..." />
                        <CommandEmpty>No book found.</CommandEmpty>
                        <CommandGroup>
                          {books.map((book) => (
                            <CommandItem
                              value={book.title}
                              key={book.id}
                              onSelect={() => {
                                form.setValue("bookId", book.id);
                                setBookPopoverOpen(false);
                              }}
                            >
                              {book.title}
                              <Check
                                className={
                                  `ml-auto h-4 w-4 ${book.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                  }`
                                }
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <Popover open={memberPopoverOpen} onOpenChange={setMemberPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={memberPopoverOpen}
                          className="w-full justify-between"
                        >
                          {field.value
                            ? members.find(
                                (member) => member.id === field.value
                              )?.fullName
                            : "Select member..."}
                          <X className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search member..." />
                        <CommandEmpty>No member found.</CommandEmpty>
                        <CommandGroup>
                          {members.map((member) => (
                            <CommandItem
                              value={member.fullName}
                              key={member.id}
                              onSelect={() => {
                                form.setValue("memberId", member.id);
                                setMemberPopoverOpen(false);
                              }}
                            >
                              {member.fullName}
                              <Check
                                className={
                                  `ml-auto h-4 w-4 ${member.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                  }`
                                }
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (1-5)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What did you think about the book?" 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createReview.isPending}>
                {createReview.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
