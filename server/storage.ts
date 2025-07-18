import { 
  Book, InsertBook, Member, InsertMember, Category, InsertCategory,
  BookSuggestion, InsertBookSuggestion, BookReview, InsertBookReview,
  Circulation, InsertCirculation
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private books: Map<number, Book> = new Map();
  private members: Map<number, Member> = new Map();
  private categories: Map<number, Category> = new Map();
  private bookSuggestions: Map<number, BookSuggestion> = new Map();
  private bookReviews: Map<number, BookReview> = new Map();
  private circulation: Map<number, Circulation> = new Map();
  private currentId = 1;

  // Books
  async getBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async createBook(book: InsertBook): Promise<Book> {
    const id = this.currentId++;
    const newBook: Book = {
      ...book,
      id,
      status: "available",
      createdAt: new Date(),
    };
    this.books.set(id, newBook);
    return newBook;
  }

  async updateBook(id: number, updates: Partial<Book>): Promise<Book | undefined> {
    const book = this.books.get(id);
    if (!book) return undefined;
    
    const updatedBook = { ...book, ...updates };
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }

  async searchBooks(query: string): Promise<Book[]> {
    const books = Array.from(this.books.values());
    const lowerQuery = query.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Members
  async getMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  async getMember(id: number): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async createMember(member: InsertMember): Promise<Member> {
    const id = this.currentId++;
    const newMember: Member = {
      ...member,
      id,
      createdAt: new Date(),
    };
    this.members.set(id, newMember);
    return newMember;
  }

  async updateMember(id: number, updates: Partial<Member>): Promise<Member | undefined> {
    const member = this.members.get(id);
    if (!member) return undefined;
    
    const updatedMember = { ...member, ...updates };
    this.members.set(id, updatedMember);
    return updatedMember;
  }

  async deleteMember(id: number): Promise<boolean> {
    return this.members.delete(id);
  }

  async searchMembers(query: string): Promise<Member[]> {
    const members = Array.from(this.members.values());
    const lowerQuery = query.toLowerCase();
    return members.filter(member => 
      member.fullName.toLowerCase().includes(lowerQuery) ||
      member.class.toLowerCase().includes(lowerQuery) ||
      member.registrationNo.toLowerCase().includes(lowerQuery)
    );
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentId++;
    const newCategory: Category = {
      ...category,
      id,
      createdAt: new Date(),
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...updates };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Book Suggestions
  async getBookSuggestions(): Promise<BookSuggestion[]> {
    return Array.from(this.bookSuggestions.values());
  }

  async getBookSuggestion(id: number): Promise<BookSuggestion | undefined> {
    return this.bookSuggestions.get(id);
  }

  async createBookSuggestion(suggestion: InsertBookSuggestion): Promise<BookSuggestion> {
    const id = this.currentId++;
    const newSuggestion: BookSuggestion = {
      ...suggestion,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.bookSuggestions.set(id, newSuggestion);
    return newSuggestion;
  }

  async updateBookSuggestion(id: number, updates: Partial<BookSuggestion>): Promise<BookSuggestion | undefined> {
    const suggestion = this.bookSuggestions.get(id);
    if (!suggestion) return undefined;
    
    const updatedSuggestion = { ...suggestion, ...updates };
    this.bookSuggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }

  // Book Reviews
  async getBookReviews(): Promise<BookReview[]> {
    return Array.from(this.bookReviews.values());
  }

  async getBookReview(id: number): Promise<BookReview | undefined> {
    return this.bookReviews.get(id);
  }

  async createBookReview(review: InsertBookReview): Promise<BookReview> {
    const id = this.currentId++;
    const newReview: BookReview = {
      ...review,
      id,
      createdAt: new Date(),
    };
    this.bookReviews.set(id, newReview);
    return newReview;
  }

  async updateBookReview(id: number, updates: Partial<BookReview>): Promise<BookReview | undefined> {
    const review = this.bookReviews.get(id);
    if (!review) return undefined;
    
    const updatedReview = { ...review, ...updates };
    this.bookReviews.set(id, updatedReview);
    return updatedReview;
  }

  async getBookReviewsByBook(bookId: number): Promise<BookReview[]> {
    return Array.from(this.bookReviews.values()).filter(review => review.bookId === bookId);
  }

  // Circulation
  async getCirculation(): Promise<Circulation[]> {
    return Array.from(this.circulation.values());
  }

  async getCirculationRecord(id: number): Promise<Circulation | undefined> {
    return this.circulation.get(id);
  }

  async createCirculationRecord(circulation: InsertCirculation): Promise<Circulation> {
    const id = this.currentId++;
    const newCirculation: Circulation = {
      ...circulation,
      id,
      date: new Date(),
      status: "active",
    };
    this.circulation.set(id, newCirculation);
    return newCirculation;
  }

  async updateCirculationRecord(id: number, updates: Partial<Circulation>): Promise<Circulation | undefined> {
    const record = this.circulation.get(id);
    if (!record) return undefined;
    
    const updatedRecord = { ...record, ...updates };
    this.circulation.set(id, updatedRecord);
    return updatedRecord;
  }

  async getActiveCirculation(): Promise<Circulation[]> {
    return Array.from(this.circulation.values()).filter(c => c.status === "active");
  }

  async getOverdueCirculation(): Promise<Circulation[]> {
    const now = new Date();
    return Array.from(this.circulation.values()).filter(c => 
      c.status === "active" && c.dueDate && new Date(c.dueDate) < now
    );
  }

  // Analytics
  async getMostReadBooks(): Promise<{ book: Book; borrowCount: number }[]> {
    const borrowCounts = new Map<number, number>();
    
    Array.from(this.circulation.values()).forEach(record => {
      if (record.action === "borrow") {
        borrowCounts.set(record.bookId, (borrowCounts.get(record.bookId) || 0) + 1);
      }
    });

    const results: { book: Book; borrowCount: number }[] = [];
    for (const [bookId, count] of borrowCounts) {
      const book = this.books.get(bookId);
      if (book) {
        results.push({ book, borrowCount: count });
      }
    }

    return results.sort((a, b) => b.borrowCount - a.borrowCount);
  }

  async getMostActiveReaders(): Promise<{ member: Member; borrowCount: number }[]> {
    const borrowCounts = new Map<number, number>();
    
    Array.from(this.circulation.values()).forEach(record => {
      if (record.action === "borrow") {
        borrowCounts.set(record.memberId, (borrowCounts.get(record.memberId) || 0) + 1);
      }
    });

    const results: { member: Member; borrowCount: number }[] = [];
    for (const [memberId, count] of borrowCounts) {
      const member = this.members.get(memberId);
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
      const book = this.books.get(record.bookId);
      const member = this.members.get(record.memberId);
      
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

export const storage = new MemStorage();
