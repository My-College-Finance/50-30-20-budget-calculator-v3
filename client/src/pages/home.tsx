import { Helmet } from "react-helmet";
import { GraduationCap } from "lucide-react";

import { BudgetInputForm } from "@/components/ui/budget-input-form";
import { BudgetSummary } from "@/components/ui/budget-summary";
import { BudgetRecommendations } from "@/components/ui/budget-recommendations";
import { BudgetEducation } from "@/components/ui/budget-education";
import { IncomeExpensesChart } from "@/components/ui/income-expenses-chart";
import { ShareWidget } from "@/components/ui/share-widget";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>50/30/20 Budget Calculator | My College Finance</title>
        <meta name="description" content="Plan your finances wisely with the 50/30/20 rule - allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment." />
        <meta property="og:title" content="50/30/20 Budget Calculator | My College Finance" />
        <meta property="og:description" content="Plan your finances wisely with the 50/30/20 rule - allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mycollegefinance.com/budget-calculator" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary dark:text-primary-light">
            50/30/20 Budget Calculator
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-2 text-xl">
            Instantly break down your budget with our 50/30/20 calculator.
          </p>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-6 text-base">
            See our <a 
              href="https://www.mycollegefinance.com/online-finance-courses" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary dark:text-primary-light font-semibold hover:underline hover:text-primary-dark dark:hover:text-blue-300 transition-colors"
            >
              latest courses →
            </a>
          </p>
          <div className="flex justify-center">
            <p className="inline-flex items-center text-sm font-medium text-primary dark:text-primary-light">
              <GraduationCap className="mr-2 h-4 w-4" />
              <span>Educate • Motivate • Elevate</span>
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BudgetInputForm />
            <BudgetSummary />
            <IncomeExpensesChart />
          </div>
          
          <div className="lg:col-span-1">
            <BudgetRecommendations />
            <BudgetEducation />
            <ShareWidget />
          </div>
        </div>
      </div>
    </>
  );
}
