import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Budget, BudgetItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BudgetContextType {
  budget: Budget & { calculations?: any } | null;
  isCalculated: boolean;
  updateBudget: (budget: Budget) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budget, setBudget] = useState<Budget & { calculations?: any } | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const { toast } = useToast();

  const updateBudget = useCallback(async (newBudget: Budget) => {
    try {
      const response = await apiRequest("POST", "/api/budget/calculate", newBudget);
      
      if (!response.ok) {
        throw new Error("Failed to calculate budget");
      }
      
      const calculatedBudget = await response.json();
      setBudget(calculatedBudget);
      setIsCalculated(true);
      
      toast({
        title: "Budget calculated",
        description: "Your budget has been calculated successfully."
      });
      
      return calculatedBudget;
    } catch (error) {
      console.error("Error calculating budget:", error);
      toast({
        title: "Calculation failed",
        description: "There was an error calculating your budget. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  return (
    <BudgetContext.Provider value={{ budget, isCalculated, updateBudget }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useBudgetContext() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudgetContext must be used within a BudgetProvider");
  }
  return context;
}
