import type { Transaction } from "@/types";

const today = new Date();
const now = today.toISOString();
const formatDate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const generateMockTransactions = (): Transaction[] => {
  const txns: Transaction[] = [];
  let idCounter = 1;

  for (let i = 0; i < 6; i++) {
    // Target month is 'i' months ago
    const targetMonthDate = new Date(
      today.getFullYear(),
      today.getMonth() - i,
      15,
    );

    // 1. Salary (Income) - 1st of the month
    const salaryDate = new Date(
      targetMonthDate.getFullYear(),
      targetMonthDate.getMonth(),
      1,
    );
    if (salaryDate <= today) {
      txns.push({
        id: `demo-txn-${idCounter++}`,
        userId: "demo-user",
        type: "income",
        amount: 15000000,
        category: "Lương",
        description: "Lương tháng",
        transactionDate: formatDate(salaryDate),
        recurring: true,
        recurringFreq: "monthly",
        syncStatus: "synced",
        createdAt: now,
        updatedAt: now,
      });
    }

    // 2. Rent/Bills - 5th of the month
    const rentDate = new Date(
      targetMonthDate.getFullYear(),
      targetMonthDate.getMonth(),
      5,
    );
    if (rentDate <= today) {
      txns.push({
        id: `demo-txn-${idCounter++}`,
        userId: "demo-user",
        type: "expense",
        amount: 5000000,
        category: "Hóa đơn",
        description: "Tiền thuê nhà",
        transactionDate: formatDate(rentDate),
        recurring: true,
        recurringFreq: "monthly",
        syncStatus: "synced",
        createdAt: now,
        updatedAt: now,
      });
    }

    // 3. Random expenses
    const categories = [
      "Ăn uống",
      "Di chuyển",
      "Giải trí",
      "Mua sắm",
      "Sức khỏe",
    ];
    // 10 to 15 random expenses per month
    const numExpenses = 10 + Math.floor(Math.random() * 6);

    for (let j = 0; j < numExpenses; j++) {
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const expenseDate = new Date(
        targetMonthDate.getFullYear(),
        targetMonthDate.getMonth(),
        randomDay,
      );

      // Skip future dates
      if (expenseDate > today) continue;

      const category =
        categories[Math.floor(Math.random() * categories.length)];
      let amount = 0;
      let desc = "";

      switch (category) {
        case "Ăn uống":
          amount = 50000 + Math.floor(Math.random() * 450000);
          desc = ["Highlands Coffee", "Cơm tấm", "Phở", "Lẩu Thái", "Trà sữa"][
            Math.floor(Math.random() * 5)
          ];
          break;
        case "Di chuyển":
          amount = 30000 + Math.floor(Math.random() * 70000);
          desc = ["Grab", "Đổ xăng", "Be", "Gửi xe"][
            Math.floor(Math.random() * 4)
          ];
          break;
        case "Giải trí":
          amount = 100000 + Math.floor(Math.random() * 400000);
          desc = ["Xem phim CGV", "Mua game", "Spotify", "Netflix"][
            Math.floor(Math.random() * 4)
          ];
          break;
        case "Mua sắm":
          amount = 200000 + Math.floor(Math.random() * 1800000);
          desc = ["Shopee", "Quần áo", "Siêu thị", "Circle K"][
            Math.floor(Math.random() * 4)
          ];
          break;
        case "Sức khỏe":
          amount = 150000 + Math.floor(Math.random() * 350000);
          desc = ["Mua thuốc Pharmacity", "Khám răng", "Yoga"][
            Math.floor(Math.random() * 3)
          ];
          break;
      }

      txns.push({
        id: `demo-txn-${idCounter++}`,
        userId: "demo-user",
        type: "expense",
        amount,
        category,
        description: desc,
        transactionDate: formatDate(expenseDate),
        recurring: false,
        syncStatus: "synced",
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // Sort descending by date
  return txns.sort(
    (a, b) =>
      new Date(b.transactionDate).getTime() -
      new Date(a.transactionDate).getTime(),
  );
};

export const mockStore: {
  transactions: Transaction[];
  aiRateLimit: Map<string, { date: string; count: number }>;
} = {
  transactions: generateMockTransactions(),
  aiRateLimit: new Map(),
};
