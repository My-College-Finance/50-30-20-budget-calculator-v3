import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChartLine, TrendingUp } from "lucide-react";
import { useBudgetContext } from "@/context/budget-context";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

// We're using Chart.js for the visualizations
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTooltip,
  ChartLegend
);

export function IncomeExpensesChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { budget, isCalculated } = useBudgetContext();
  const [chartData, setChartData] = useState<any>(null);

  const setupChartData = () => {
    if (!budget?.calculations) return;

    const { totalIncome, totalExpenses } = budget.calculations;

    // Generate historical data for demonstration
    // In a real application, this would come from real historical data
    const incomeData = [
      totalIncome * 0.95,
      totalIncome * 0.97,
      totalIncome * 0.98,
      totalIncome * 0.99,
      totalIncome,
      totalIncome,
    ];

    const expenseData = [
      totalExpenses * 0.9,
      totalExpenses * 0.93,
      totalExpenses * 0.95,
      totalExpenses * 0.92,
      totalExpenses * 0.98,
      totalExpenses,
    ];

    // Create chart data
    const data = {
      labels: ["January", "February", "March", "April", "May", "June"],
      datasets: [
        {
          label: "Income",
          data: incomeData,
          backgroundColor: "rgba(79, 70, 229, 0.8)",
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 1,
        },
        {
          label: "Expenses",
          data: expenseData,
          backgroundColor: "rgba(239, 68, 68, 0.8)",
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 1,
        },
      ],
    };

    setChartData(data);
  };

  useEffect(() => {
    if (isCalculated) {
      setupChartData();
    }
  }, [isCalculated, budget]);

  if (!isCalculated || !chartData) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <ChartLine className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
            Income vs. Expenses
          </h2>
          <div className="text-center py-10 text-muted-foreground">
            <p>Calculate your budget to see the income vs. expenses chart</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { remaining } = budget.calculations!;
  const isSurplus = remaining > 0;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <ChartLine className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
          Income vs. Expenses
        </h2>
        
        <div className="relative h-64 mb-6">
          <Bar
            ref={chartRef}
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => formatCurrency(value as number)
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += formatCurrency(context.parsed.y);
                      }
                      return label;
                    }
                  }
                }
              }
            }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className={`p-4 ${isSurplus ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} rounded-lg`}>
            <h3 className={`text-sm font-medium ${isSurplus ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'} mb-1`}>
              Monthly Trend
            </h3>
            <p className={`text-lg font-semibold ${isSurplus ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {isSurplus 
                ? `+${formatCurrency(remaining)} Surplus` 
                : `-${formatCurrency(Math.abs(remaining))} Deficit`}
            </p>
            <p className={`text-xs ${isSurplus ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isSurplus 
                ? "Your budget has a surplus this month" 
                : "Your budget has a deficit this month"}
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Savings Goal</h3>
            <div className="w-full mb-2">
              <Progress value={35} className="h-2" />
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              $1,400 saved of $4,000 goal
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
