import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBookSchema, insertMemberSchema, insertCategorySchema,
  insertBookSuggestionSchema, insertBookReviewSchema, insertCirculationSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Books
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  app.get("/api/books/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Search query is required" });
      }
      const books = await storage.searchBooks(q);
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to search books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch book" });
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      const data = insertBookSchema.parse(req.body);
      const book = await storage.createBook(data);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid book data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create book" });
    }
  });

  app.put("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const book = await storage.updateBook(id, updates);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: "Failed to update book" });
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBook(id);
      if (!deleted) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete book" });
    }
  });

  // Members
  app.get("/api/members", async (req, res) => {
    try {
      const members = await storage.getMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.get("/api/members/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Search query is required" });
      }
      const members = await storage.searchMembers(q);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to search members" });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const data = insertMemberSchema.parse(req.body);
      const member = await storage.createMember(data);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid member data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create member" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid category data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Book Suggestions
  app.get("/api/book-suggestions", async (req, res) => {
    try {
      const suggestions = await storage.getBookSuggestions();
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch book suggestions" });
    }
  });

  app.post("/api/book-suggestions", async (req, res) => {
    try {
      const data = insertBookSuggestionSchema.parse(req.body);
      const suggestion = await storage.createBookSuggestion(data);
      res.status(201).json(suggestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid suggestion data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create suggestion" });
    }
  });

  // Book Reviews
  app.get("/api/book-reviews", async (req, res) => {
    try {
      const reviews = await storage.getBookReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch book reviews" });
    }
  });

  app.get("/api/book-reviews/book/:bookId", async (req, res) => {
    try {
      const bookId = parseInt(req.params.bookId);
      const reviews = await storage.getBookReviewsByBook(bookId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch book reviews" });
    }
  });

  app.post("/api/book-reviews", async (req, res) => {
    try {
      const data = insertBookReviewSchema.parse(req.body);
      const review = await storage.createBookReview(data);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid review data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Circulation
  app.get("/api/circulation", async (req, res) => {
    try {
      const circulation = await storage.getCirculation();
      res.json(circulation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch circulation records" });
    }
  });

  app.get("/api/circulation/active", async (req, res) => {
    try {
      const activeCirculation = await storage.getActiveCirculation();
      res.json(activeCirculation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active circulation" });
    }
  });

  app.get("/api/circulation/overdue", async (req, res) => {
    try {
      const overdueCirculation = await storage.getOverdueCirculation();
      res.json(overdueCirculation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch overdue circulation" });
    }
  });

  app.post("/api/circulation", async (req, res) => {
    try {
      const data = insertCirculationSchema.parse(req.body);
      const circulation = await storage.createCirculationRecord(data);
      res.status(201).json(circulation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid circulation data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create circulation record" });
    }
  });

  // Analytics
  app.get("/api/analytics/most-read-books", async (req, res) => {
    try {
      const mostReadBooks = await storage.getMostReadBooks();
      res.json(mostReadBooks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch most read books" });
    }
  });

  app.get("/api/analytics/most-active-readers", async (req, res) => {
    try {
      const mostActiveReaders = await storage.getMostActiveReaders();
      res.json(mostActiveReaders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch most active readers" });
    }
  });

  app.get("/api/analytics/issued-books", async (req, res) => {
    try {
      const issuedBooks = await storage.getIssuedBooks();
      res.json(issuedBooks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch issued books" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
