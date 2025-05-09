import { Budget, BudgetItem, InsertBudget, InsertUser, User, budgets, users } from "@shared/schema";

// Define the storage interface
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  calculateBudget(budget: Budget): Promise<Budget>;
  saveBudget(budget: Budget): Promise<Budget>;
  getBudget(id: number): Promise<Budget | undefined>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private budgets: Map<number, Budget>;
  userCurrentId: number;
  budgetCurrentId: number;

  constructor() {
    this.users = new Map();
    this.budgets = new Map();
    this.userCurrentId = 1;
    this.budgetCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async calculateBudget(budget: Budget): Promise<Budget> {
    const totalIncome = budget.income + (budget.additionalIncome || 0);
    
    // Calculate ideal amounts based on 50/30/20 rule
    const idealNeeds = totalIncome * 0.5;
    const idealWants = totalIncome * 0.3;
    const idealSavings = totalIncome * 0.2;
    
    // Calculate current amounts
    const needsTotal = budget.needs ? budget.needs.reduce((sum, item) => sum + item.amount, 0) : 0;
    const wantsTotal = budget.wants ? budget.wants.reduce((sum, item) => sum + item.amount, 0) : 0;
    const savingsTotal = budget.savings ? budget.savings.reduce((sum, item) => sum + item.amount, 0) : 0;
    
    // Calculate adjustments needed
    const needsAdjustment = idealNeeds - needsTotal;
    const wantsAdjustment = idealWants - wantsTotal;
    const savingsAdjustment = idealSavings - savingsTotal;
    
    // Calculate percentages
    const needsPercentage = (needsTotal / totalIncome) * 100;
    const wantsPercentage = (wantsTotal / totalIncome) * 100;
    const savingsPercentage = (savingsTotal / totalIncome) * 100;
    
    // Add calculated values to the budget object
    const calculatedBudget = {
      ...budget,
      calculations: {
        totalIncome,
        idealNeeds,
        idealWants,
        idealSavings,
        needsTotal,
        wantsTotal,
        savingsTotal,
        needsAdjustment,
        wantsAdjustment,
        savingsAdjustment,
        needsPercentage,
        wantsPercentage,
        savingsPercentage,
        totalExpenses: needsTotal + wantsTotal + savingsTotal,
        remaining: totalIncome - (needsTotal + wantsTotal + savingsTotal)
      }
    };
    
    return calculatedBudget;
  }

  async saveBudget(budget: Budget): Promise<Budget> {
    // Calculate the budget before saving
    const calculatedBudget = await this.calculateBudget(budget);
    
    const id = this.budgetCurrentId++;
    const budgetToSave = {
      ...calculatedBudget,
      id,
      createdAt: new Date()
    };
    
    this.budgets.set(id, budgetToSave);
    return budgetToSave;
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }
}

export const storage = new MemStorage();
