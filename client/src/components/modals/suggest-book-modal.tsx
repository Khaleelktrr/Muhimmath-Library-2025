import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Member, InsertBookSuggestion } from "@shared/schema";

const suggestionSchema = z.object({
  memberId: z.number().min(1, "Please select a member"),
  bookTitle: z.string().min(1, "Book title is required"),
  author: z.string().min(1, "Author name is required"),
  reason: z.string().optional(),
});

type SuggestionForm = z.infer<typeof suggestionSchema>;

interface SuggestBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SuggestBookModal({ open, onOpenChange }: SuggestBookModalProps) {
  const { toast } = useToast();

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const form = useForm<SuggestionForm>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      memberId: 0,
      bookTitle: "",
      author: "",
      reason: "",
    },
  });

  const createSuggestion = useMutation({
    mutationFn: async (data: InsertBookSuggestion) => {
      const response = await apiRequest("POST", "/api/book-suggestions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/book-suggestions"] });
      toast({
        title: "Success",
        description: "Book suggestion submitted successfully!",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit suggestion. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [popoverOpen, setPopoverOpen] = useState(false);

  const onSubmit = (data: SuggestionForm) => {
    createSuggestion.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suggest a Book</DialogTitle>
        </DialogHeader>
        
        <p className="text-gray-600 mb-6">Recommend a new book for our library collection.</p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild onOpenChange={setPopoverOpen}>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverOpen}
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
                                 setPopoverOpen(false);
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
              name="bookTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the book title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the author's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Suggestion (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Why should we add this book?" 
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
              <Button type="submit" disabled={createSuggestion.isPending}>
                {createSuggestion.isPending ? "Submitting..." : "Submit Suggestion"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
