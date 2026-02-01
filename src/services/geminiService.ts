
export const getInvestmentExplanation = async (symbol: string, amount: number, isRedDay: boolean, progress: number): Promise<string> => {
    // Mock response for now
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isRedDay) {
        if (progress < 50) return "Market dip detected. Accelerating deployment to capture lower averages.";
        return "Red day opportunity. Top-up recommended to balance cost basis.";
    }

    if (progress > 80) return "Nearing full deployment. Conservative tranches advised.";
    return "Standard partition execution. Maintaining dollar-cost average velocity.";
};
