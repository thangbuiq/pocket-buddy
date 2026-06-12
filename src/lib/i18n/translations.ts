export const translations = {
  vi: {
    // Common
    appName: "Pocket Buddy",
    appTagline: "Quản lý chi tiêu thông minh",
    save: "Lưu",
    cancel: "Hủy",
    delete: "Xóa",
    edit: "Sửa",
    add: "Thêm",
    loading: "Đang tải...",
    confirm: "Xác nhận",
    send: "Gửi",

    // Navigation
    dashboard: "Tổng quan",
    transactions: "Giao dịch",
    budgets: "Ngân sách",
    goals: "Mục tiêu",
    analytics: "Thống kê",
    assistant: "Trợ lý AI",
    settings: "Cài đặt",
    signOut: "Đăng xuất",

    // Smart Input
    smartInputPlaceholder: "Nhập giao dịch... VD: hôm nay mua cà phê 50k",
    parsing: "Đang xử lý...",
    previewTitle: "Xác nhận giao dịch",
    approve: "Đồng ý",
    reject: "Hủy bỏ",

    // Transaction types
    expense: "Chi tiêu",
    income: "Thu nhập",

    // Dashboard
    totalIncome: "Tổng thu",
    totalExpenses: "Tổng chi",
    netCashFlow: "Số dư",
    savingsRate: "Tỷ lệ tiết kiệm",
    recentTransactions: "Giao dịch gần đây",
    budgetUtilization: "Sử dụng ngân sách",
    noTransactions: "Chưa có giao dịch nào",
    noBudgets: "Chưa có ngân sách nào",

    // Transactions page
    addTransaction: "Thêm giao dịch",
    deleteConfirm: "Xóa giao dịch này?",

    // Budgets page
    addBudget: "Thêm ngân sách",
    category: "Danh mục",
    limit: "Hạn mức",
    deleteBudgetConfirm: "Xóa ngân sách này?",

    // Settings
    appearance: "Giao diện",
    themeLight: "Sáng",
    themeDark: "Tối",
    language: "Ngôn ngữ",
    account: "Tài khoản",

    // Auth
    signIn: "Đăng nhập",
    signUp: "Đăng ký",
    email: "Email",
    password: "Mật khẩu",
    welcomeBack: "Chào mừng trở lại",
    signInSubtitle: "Đăng nhập để quản lý chi tiêu",
    continueWithGoogle: "Tiếp tục với Google",
    or: "hoặc",
    invalidCredentials: "Email hoặc mật khẩu không đúng",

    // Categories
    food: "Ăn uống",
    transport: "Di chuyển",
    shopping: "Mua sắm",
    entertainment: "Giải trí",
    utilities: "Hóa đơn",
    health: "Sức khỏe",
    education: "Học tập",
    other: "Khác",
  },
  en: {
    // Common
    appName: "Pocket Buddy",
    appTagline: "Smart expense tracking",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    loading: "Loading...",
    confirm: "Confirm",
    send: "Send",

    // Navigation
    dashboard: "Dashboard",
    transactions: "Transactions",
    budgets: "Budgets",
    goals: "Goals",
    analytics: "Analytics",
    assistant: "AI Assistant",
    settings: "Settings",
    signOut: "Sign out",

    // Smart Input
    smartInputPlaceholder:
      "Type a transaction... e.g., bought coffee 50k today",
    parsing: "Parsing...",
    previewTitle: "Confirm transaction",
    approve: "Approve",
    reject: "Cancel",

    // Transaction types
    expense: "Expense",
    income: "Income",

    // Dashboard
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    netCashFlow: "Net Cash Flow",
    savingsRate: "Savings Rate",
    recentTransactions: "Recent Transactions",
    budgetUtilization: "Budget Utilization",
    noTransactions: "No transactions yet",
    noBudgets: "No budgets yet",

    // Transactions page
    addTransaction: "Add Transaction",
    deleteConfirm: "Delete this transaction?",

    // Budgets page
    addBudget: "Add Budget",
    category: "Category",
    limit: "Limit",
    deleteBudgetConfirm: "Delete this budget?",

    // Settings
    appearance: "Appearance",
    themeLight: "Light",
    themeDark: "Dark",
    language: "Language",
    account: "Account",

    // Auth
    signIn: "Sign in",
    signUp: "Sign up",
    email: "Email",
    password: "Password",
    welcomeBack: "Welcome back",
    signInSubtitle: "Sign in to manage your expenses",
    continueWithGoogle: "Continue with Google",
    or: "or",
    invalidCredentials: "Invalid email or password",

    // Categories
    food: "Food",
    transport: "Transport",
    shopping: "Shopping",
    entertainment: "Entertainment",
    utilities: "Utilities",
    health: "Health",
    education: "Education",
    other: "Other",
  },
} as const;

export type TranslationKey = keyof typeof translations.vi;
export type Language = "vi" | "en";
