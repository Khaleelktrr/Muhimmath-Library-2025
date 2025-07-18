import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Category, InsertBook, InsertCategory } from "@shared/schema";

const bookSchema = z.object({
  title: z.string().min(1, "Book title is required"),
  author: z.string().min(1, "Author name is required"),
  category: z.string().min(1, "Category is required"),
  language: z.string().min(1, "Language is required"),
  price: z.number().min(0, "Price must be positive"),
  publisher: z.string().min(1, "Publisher is required"),
  ddc: z.string().min(1, "DDC is required"),
});

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

type BookForm = z.infer<typeof bookSchema>;
type CategoryForm = z.infer<typeof categorySchema>;

export default function LibraryTab() {
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const bookForm = useForm<BookForm>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      category: "",
      language: "",
      price: 0,
      publisher: "",
      ddc: "",
    },
  });

  const createBook = useMutation({
    mutationFn: async (data: InsertBook) => {
      const response = await apiRequest("POST", "/api/books", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({
        title: "Success",
        description: "Book added successfully!",
      });
      bookForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add book. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createCategory = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category added successfully!",
      });
      setNewCategory("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitBook = (data: BookForm) => {
    createBook.mutate(data);
  };

  const onSubmitCategory = () => {
    if (newCategory.trim()) {
      createCategory.mutate({ name: newCategory.trim() });
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Add New Book */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Book</h2>
        </div>
        
        <CardContent className="p-6">
          <Form {...bookForm}>
            <form onSubmit={bookForm.handleSubmit(onSubmitBook)} className="space-y-4">
              <FormField
                control={bookForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Book Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter book title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={bookForm.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter author's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book Category</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={bookForm.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book Price (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 813.6" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={bookForm.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publisher Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter publisher name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookForm.control}
                  name="ddc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DDC</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 813.6" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={createBook.isPending}>
                {createBook.isPending ? "Adding..." : "Add Book"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Manage Categories */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Manage Categories</h2>
        </div>
        
        <CardContent className="p-6">
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Add new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={onSubmitCategory}
              disabled={createCategory.isPending || !newCategory.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {filteredCategories.length > 0 ? (
            <div className="space-y-2">
              {filteredCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCategory.mutate(category.id)}
                    disabled={deleteCategory.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-3xl mb-3">📁</div>
              <p className="text-gray-600">
                {categorySearch ? "No categories match your search." : "No categories available."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
