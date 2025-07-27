import { 
  Book, InsertBook, Member, InsertMember, Category, InsertCategory,
  BookSuggestion, InsertBookSuggestion, BookReview, InsertBookReview,
  Circulation, InsertCirculation,
  books, members, categories, bookSuggestions, bookReviews, circulation
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, or, lt } from "drizzle-orm";

export interface IStorage {
  // Books
  getBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, updates: Partial<Book>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  searchBooks(query: string): Promise<Book[]>;
  
  // Members
  getMembers(): Promise<Member[]>;
  getMember(id: number): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, updates: Partial<Member>): Promise<Member | undefined>;
  deleteMember(id: number): Promise<boolean>;
  searchMembers(query: string): Promise<Member[]>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Book Suggestions
  getBookSuggestions(): Promise<BookSuggestion[]>;
  getBookSuggestion(id: number): Promise<BookSuggestion | undefined>;
  createBookSuggestion(suggestion: InsertBookSuggestion): Promise<BookSuggestion>;
  updateBookSuggestion(id: number, updates: Partial<BookSuggestion>): Promise<BookSuggestion | undefined>;
  
  // Book Reviews
  getBookReviews(): Promise<BookReview[]>;
  getBookReview(id: number): Promise<BookReview | undefined>;
  createBookReview(review: InsertBookReview): Promise<BookReview>;
  updateBookReview(id: number, updates: Partial<BookReview>): Promise<BookReview | undefined>;
  getBookReviewsByBook(bookId: number): Promise<BookReview[]>;
  
  // Circulation
  getCirculation(): Promise<Circulation[]>;
  getCirculationRecord(id: number): Promise<Circulation | undefined>;
  createCirculationRecord(circulation: InsertCirculation): Promise<Circulation>;
  updateCirculationRecord(id: number, updates: Partial<Circulation>): Promise<Circulation | undefined>;
  getActiveCirculation(): Promise<Circulation[]>;
  getOverdueCirculation(): Promise<Circulation[]>;
  
  // Analytics
  getMostReadBooks(): Promise<{ book: Book; borrowCount: number }[]>;
  getMostActiveReaders(): Promise<{ member: Member; borrowCount: number }[]>;
  getIssuedBooks(): Promise<{ book: Book; member: Member; dueDate: Date | null }[]>;
}

export class DatabaseStorage implements IStorage {
  // Books
  async getBooks(): Promise<Book[]> {
    return await db.select().from(books);
  }

  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book || undefined;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db
      .insert(books)
      .values({
        ...book,
        status: "available",
        createdAt: new Date(),
      })
      .returning();
    return newBook;
  }

  async updateBook(id: number, updates: Partial<Book>): Promise<Book | undefined> {
    const [updatedBook] = await db
      .update(books)
      .set(updates)
      .where(eq(books.id, id))
      .returning();
    return updatedBook || undefined;
  }

  async deleteBook(id: number): Promise<boolean> {
    const result = await db.delete(books).where(eq(books.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchBooks(query: string): Promise<Book[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    return await db
      .select()
      .from(books)
      .where(
        or(
          like(books.title, lowerQuery),
          like(books.author, lowerQuery),
          like(books.category, lowerQuery)
        )
      );
  }

  // Members
  async getMembers(): Promise<Member[]> {
    return await db.select().from(members);
  }

  async getMember(id: number): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member || undefined;
  }

  async createMember(member: InsertMember): Promise<Member> {
    const [newMember] = await db
      .insert(members)
      .values({
        ...member,
        createdAt: new Date(),
      })
      .returning();
    return newMember;
  }

  async updateMember(id: number, updates: Partial<Member>): Promise<Member | undefined> {
    const [updatedMember] = await db
      .update(members)
      .set(updates)
      .where(eq(members.id, id))
      .returning();
    return updatedMember || undefined;
  }

  async deleteMember(id: number): Promise<boolean> {
    const result = await db.delete(members).where(eq(members.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchMembers(query: string): Promise<Member[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    return await db
      .select()
      .from(members)
      .where(
        or(
          like(members.fullName, lowerQuery),
          like(members.class, lowerQuery),
          like(members.registrationNo, lowerQuery)
        )
      );
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values({
        ...category,
        createdAt: new Date(),
      })
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Book Suggestions
  async getBookSuggestions(): Promise<BookSuggestion[]> {
    return await db.select().from(bookSuggestions);
  }

  async getBookSuggestion(id: number): Promise<BookSuggestion | undefined> {
    const [suggestion] = await db.select().from(bookSuggestions).where(eq(bookSuggestions.id, id));
    return suggestion || undefined;
  }

  async createBookSuggestion(suggestion: InsertBookSuggestion): Promise<BookSuggestion> {
    const [newSuggestion] = await db
      .insert(bookSuggestions)
      .values({
        ...suggestion,
        status: "pending",
        createdAt: new Date(),
      })
      .returning();
    return newSuggestion;
  }

  async updateBookSuggestion(id: number, updates: Partial<BookSuggestion>): Promise<BookSuggestion | undefined> {
    const [updatedSuggestion] = await db
      .update(bookSuggestions)
      .set(updates)
      .where(eq(bookSuggestions.id, id))
      .returning();
    return updatedSuggestion || undefined;
  }

  // Book Reviews
  async getBookReviews(): Promise<BookReview[]> {
    return await db.select().from(bookReviews);
  }

  async getBookReview(id: number): Promise<BookReview | undefined> {
    const [review] = await db.select().from(bookReviews).where(eq(bookReviews.id, id));
    return review || undefined;
  }

  async createBookReview(review: InsertBookReview): Promise<BookReview> {
    const [newReview] = await db
      .insert(bookReviews)
      .values({
        ...review,
        createdAt: new Date(),
      })
      .returning();
    return newReview;
  }

  async updateBookReview(id: number, updates: Partial<BookReview>): Promise<BookReview | undefined> {
    const [updatedReview] = await db
      .update(bookReviews)
      .set(updates)
      .where(eq(bookReviews.id, id))
      .returning();
    return updatedReview || undefined;
  }

  async getBookReviewsByBook(bookId: number): Promise<BookReview[]> {
    return await db.select().from(bookReviews).where(eq(bookReviews.bookId, bookId));
  }

  // Circulation
  async getCirculation(): Promise<Circulation[]> {
    return await db.select().from(circulation);
  }

  async getCirculationRecord(id: number): Promise<Circulation | undefined> {
    const [record] = await db.select().from(circulation).where(eq(circulation.id, id));
    return record || undefined;
  }

  async createCirculationRecord(circulationData: InsertCirculation): Promise<Circulation> {
    const [newCirculation] = await db
      .insert(circulation)
      .values({
        ...circulationData,
        date: new Date(),
        status: circulationData.action === "return" ? "returned" : "active",
      })
      .returning();
    return newCirculation;
  }

  async updateCirculationRecord(id: number, updates: Partial<Circulation>): Promise<Circulation | undefined> {
    const [updatedRecord] = await db
      .update(circulation)
      .set(updates)
      .where(eq(circulation.id, id))
      .returning();
    return updatedRecord || undefined;
  }

  async getActiveCirculation(): Promise<Circulation[]> {
    return await db.select().from(circulation).where(eq(circulation.status, "active"));
  }

  async getOverdueCirculation(): Promise<Circulation[]> {
    const now = new Date();
    return await db
      .select()
      .from(circulation)
      .where(
        and(
          eq(circulation.status, "active"),
          lt(circulation.dueDate, now)
        )
      );
  }

  // Analytics
  async getMostReadBooks(): Promise<{ book: Book; borrowCount: number }[]> {
    const borrowRecords = await db
      .select()
      .from(circulation)
      .where(eq(circulation.action, "borrow"));

    const borrowCounts = new Map<number, number>();
    borrowRecords.forEach(record => {
      borrowCounts.set(record.bookId, (borrowCounts.get(record.bookId) || 0) + 1);
    });

    const results: { book: Book; borrowCount: number }[] = [];
    const entries = Array.from(borrowCounts.entries());
    for (const [bookId, count] of entries) {
      const book = await this.getBook(bookId);
      if (book) {
        results.push({ book, borrowCount: count });
      }
    }

    return results.sort((a, b) => b.borrowCount - a.borrowCount);
  }

  async getMostActiveReaders(): Promise<{ member: Member; borrowCount: number }[]> {
    const borrowRecords = await db
      .select()
      .from(circulation)
      .where(eq(circulation.action, "borrow"));

    const borrowCounts = new Map<number, number>();
    borrowRecords.forEach(record => {
      borrowCounts.set(record.memberId, (borrowCounts.get(record.memberId) || 0) + 1);
    });

    const results: { member: Member; borrowCount: number }[] = [];
    const entries = Array.from(borrowCounts.entries());
    for (const [memberId, count] of entries) {
      const member = await this.getMember(memberId);
      if (member) {
        results.push({ member, borrowCount: count });
      }
    }

    return results.sort((a, b) => b.borrowCount - a.borrowCount);
  }

  async getIssuedBooks(): Promise<{ book: Book; member: Member; dueDate: Date | null }[]> {
    const activeCirculation = await this.getActiveCirculation();
    const results: { book: Book; member: Member; dueDate: Date | null }[] = [];
    
    for (const record of activeCirculation) {
      const book = await this.getBook(record.bookId);
      const member = await this.getMember(record.memberId);
      
      if (book && member) {
        results.push({
          book,
          member,
          dueDate: record.dueDate,
        });
      }
    }

    return results;
  }
}

export const storage = new DatabaseStorage();
