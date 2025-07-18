import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  language: text("language").notNull(),
  price: integer("price").notNull(), // in cents
  publisher: text("publisher").notNull(),
  ddc: text("ddc").notNull(),
  coverImage: text("cover_image"),
  status: text("status").notNull().default("available"), // available, issued, reserved
  createdAt: timestamp("created_at").defaultNow(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  class: text("class").notNull(),
  registrationNo: text("registration_no").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookSuggestions = pgTable("book_suggestions", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id).notNull(),
  bookTitle: text("book_title").notNull(),
  author: text("author").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookReviews = pgTable("book_reviews", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  memberId: integer("member_id").references(() => members.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  review: text("review").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const circulation = pgTable("circulation", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  memberId: integer("member_id").references(() => members.id).notNull(),
  action: text("action").notNull(), // borrow, return
  date: timestamp("date").defaultNow(),
  dueDate: timestamp("due_date"),
  returnDate: timestamp("return_date"),
  status: text("status").notNull().default("active"), // active, returned, overdue
});

// Insert schemas
export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertBookSuggestionSchema = createInsertSchema(bookSuggestions).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertBookReviewSchema = createInsertSchema(bookReviews).omit({
  id: true,
  createdAt: true,
});

export const insertCirculationSchema = createInsertSchema(circulation).omit({
  id: true,
  date: true,
  status: true,
});

// Types
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type BookSuggestion = typeof bookSuggestions.$inferSelect;
export type InsertBookSuggestion = z.infer<typeof insertBookSuggestionSchema>;
export type BookReview = typeof bookReviews.$inferSelect;
export type InsertBookReview = z.infer<typeof insertBookReviewSchema>;
export type Circulation = typeof circulation.$inferSelect;
export type InsertCirculation = z.infer<typeof insertCirculationSchema>;
