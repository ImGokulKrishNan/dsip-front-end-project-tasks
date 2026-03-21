import React, { useState } from "react";
import { Icons } from "../constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocSection {
  id: string;
  title: string;
  content: string;
}

const documentationSections: DocSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: `The DSIP (Daily/Weekly Strategic Investment Program) Engine is a sophisticated backtesting and simulation tool designed to optimize your investment strategy. It systematically deploys capital over time based on your conviction level and preferred deployment style.

Key Features:
• Systematic capital deployment based on your conviction period
• Multiple deployment strategies (Aggressive, Moderate, Gradual)
• Historical simulation and performance tracking
• Risk management and allocation optimization
• Real-time performance metrics and analytics

The DSIP Engine helps you make data-driven investment decisions by allowing you to test strategies before deploying real capital.`,
  },
  {
    id: "dsip-core",
    title: "DSIP Core Logic",
    content: `The DSIP Core Logic determines how your capital is deployed over time based on:

1. Conviction Period: The total time frame over which you believe in the investment
2. Investment Cycle: How frequently capital is deployed (monthly, quarterly, etc.)
3. Total Capital: The amount you wish to deploy
4. Deployment Style: The aggressiveness of your deployment strategy

Calculation Method:
- Conviction Period is divided into intervals equal to your Investment Cycle
- Each cycle receives a calculated portion of your total capital
- The deployment style modifier adjusts how much capital is deployed early vs late

Example: With $10,000 total and 4 monthly cycles:
- Gradual: Deploy $2,500 each month evenly
- Moderate: Deploy more in months 2-3 (bell curve)
- Aggressive: Deploy more in months 1-2 (front-loaded)`,
  },
  {
    id: "deployment",
    title: "Deployment Styles",
    content: `Three deployment styles are available to match your investment approach:

AGGRESSIVE (Front-Loaded):
- Deploy majority of capital in early periods
- Best for: Stocks you're highly confident in, capitalizing on growth early
- Risk: Less flexibility if market conditions change
- Capital curve: Steep decline over time

MODERATE (Bell Curve):
- Deploy more capital in middle periods
- Best for: Balanced approach, averaging into positions
- Risk: Medium risk, medium reward
- Capital curve: Peak in middle periods

GRADUAL (Steady):
- Deploy even amounts across all periods
- Best for: Risk-averse investors, volatile stocks
- Benefit: Maximum averaging benefit, reduced timing risk
- Capital curve: Flat across all periods

Select the style that matches your risk tolerance and market outlook.`,
  },
  {
    id: "risk",
    title: "Risk Management",
    content: `The DSIP Engine includes built-in risk management features:

Position Sizing:
- Allocate capital based on conviction level (0-100%)
- Higher conviction = larger initial positions
- Scale positions based on portfolio risk

Stop Loss & Take Profit:
- Set bounds on acceptable loss/gain ranges
- Automatic rebalancing when thresholds are met
- Exit signals based on technical indicators

Best Practices:
1. Never deploy entire capital at once
2. Use conviction levels conservatively
3. Monitor portfolio correlation
4. Review and rebalance regularly`,
  },
];

const DocumentationPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("introduction");

  const currentSection = documentationSections.find(
    (s) => s.id === activeSection,
  );

  return (
    <div className="flex h-full w-full bg-background">
      {/* Left Sidebar Menu */}
      <aside className="w-64 border-r border-border bg-muted/30 p-6 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-foreground">Content</h2>

        <nav className="space-y-2">
          {documentationSections.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left h-auto py-2 px-3 rounded-lg transition-colors",
                activeSection === section.id
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted",
              )}
              onClick={() => setActiveSection(section.id)}
            >
              {section.title}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Right Content Area */}
      <main className="flex-1 overflow-y-auto">
        {currentSection && (
          <div className="p-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-4xl font-black mb-2 text-foreground">
                {currentSection.title}
              </h1>
              <div className="h-1 w-16 bg-gradient-to-r from-primary to-blue-500 rounded-full" />
            </div>

            <Card className="bg-muted/30 border-primary/20">
              <CardContent className="prose prose-invert max-w-none p-6">
                <div className="space-y-4 text-foreground/90 leading-relaxed">
                  {currentSection.content.split("\n").map((paragraph, idx) => {
                    if (paragraph.trim() === "") {
                      return <div key={idx} className="h-2" />;
                    }

                    if (paragraph.startsWith("•")) {
                      return (
                        <div key={idx} className="flex gap-3 ml-4">
                          <span className="text-primary font-bold mt-1">•</span>
                          <p className="text-sm">
                            {paragraph.substring(1).trim()}
                          </p>
                        </div>
                      );
                    }

                    if (paragraph.match(/^\d+\./)) {
                      return (
                        <div key={idx} className="flex gap-3 ml-4">
                          <span className="text-primary font-bold">
                            {paragraph.match(/^\d+/)![0]}.
                          </span>
                          <p className="text-sm">
                            {paragraph.substring(2).trim()}
                          </p>
                        </div>
                      );
                    }

                    if (paragraph.includes(":") && paragraph.length < 50) {
                      const [label, value] = paragraph.split(":");
                      return (
                        <div key={idx} className="flex gap-2">
                          <span className="font-semibold text-primary">
                            {label}:
                          </span>
                          <span className="text-sm">{value.trim()}</span>
                        </div>
                      );
                    }

                    return (
                      <p key={idx} className="text-sm leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-3 mt-8 justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  const currentIdx = documentationSections.findIndex(
                    (s) => s.id === activeSection,
                  );
                  if (currentIdx > 0) {
                    setActiveSection(documentationSections[currentIdx - 1].id);
                  }
                }}
                disabled={
                  documentationSections.findIndex(
                    (s) => s.id === activeSection,
                  ) === 0
                }
              >
                <Icons.ArrowLeft size={16} className="mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const currentIdx = documentationSections.findIndex(
                    (s) => s.id === activeSection,
                  );
                  if (currentIdx < documentationSections.length - 1) {
                    setActiveSection(documentationSections[currentIdx + 1].id);
                  }
                }}
                disabled={
                  documentationSections.findIndex(
                    (s) => s.id === activeSection,
                  ) ===
                  documentationSections.length - 1
                }
              >
                Next
                <Icons.ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DocumentationPage;
