import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Users, Edit, Save, X, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Member, InsertMember } from "@shared/schema";

const memberSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  class: z.string().min(1, "Class is required"),
  registrationNo: z.string().min(1, "Registration number is required"),
});

type MemberForm = z.infer<typeof memberSchema>;

export default function MembersTab() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMember, setEditingMember] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Member>>({});

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const form = useForm<MemberForm>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      fullName: "",
      class: "",
      registrationNo: "",
    },
  });

  const createMember = useMutation({
    mutationFn: async (data: InsertMember) => {
      const response = await apiRequest("POST", "/api/members", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: "Success",
        description: "Member added successfully!",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMember = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Member> }) => {
      const response = await apiRequest("PUT", `/api/members/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: "Success",
        description: "Member updated successfully!",
      });
      setEditingMember(null);
      setEditForm({});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: "Success",
        description: "Member deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MemberForm) => {
    createMember.mutate(data);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member.id);
    setEditForm({ ...member });
  };

  const handleSaveEdit = () => {
    if (editingMember && editForm) {
      updateMember.mutate({ 
        id: editingMember, 
        data: editForm 
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditForm({});
  };

  const filteredMembers = members.filter(member =>
    searchQuery === "" ||
    member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.registrationNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Manage Members</h2>
      </div>
      
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-8">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 10th A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="registrationNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration No.</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter registration number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={createMember.isPending}>
              {createMember.isPending ? "Adding..." : "Add Member"}
            </Button>
          </form>
        </Form>
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Members</h3>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search members by name, reg no, etc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {filteredMembers.length > 0 ? (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-4">
                  {editingMember === member.id ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <Input
                            value={editForm.fullName || ""}
                            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                          <Input
                            value={editForm.class || ""}
                            onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Registration No</label>
                          <Input
                            value={editForm.registrationNo || ""}
                            onChange={(e) => setEditForm({ ...editForm, registrationNo: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={handleCancelEdit}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={updateMember.isPending}>
                          <Save className="w-4 h-4 mr-2" />
                          {updateMember.isPending ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-semibold text-gray-900">{member.fullName}</h3>
                          <Badge variant="secondary">{member.class}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Registration No:</span> {member.registrationNo}
                        </div>
                        {member.createdAt && (
                          <div className="mt-1 text-xs text-gray-500">
                            Joined: {new Date(member.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMember(member)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMember.mutate(member.id)}
                          disabled={deleteMember.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {searchQuery ? "No members match your search." : "No members found."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
