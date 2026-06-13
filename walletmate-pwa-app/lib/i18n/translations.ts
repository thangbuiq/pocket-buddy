export const translations = {
  vi: {
    // Common
    appName: "walletmate",
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
    dashboard: "Ví của bạn",
    transactions: "Giao dịch",
    settings: "Cài đặt",
    signOut: "Đăng xuất",

    // Smart Input
    smartInputPlaceholder: "Nhập giao dịch... VD: hôm nay mua cà phê 50k",
    parsing: "Đang xử lý...",
    previewTitle: "Xác nhận giao dịch",
    approve: "Đồng ý",
    reject: "Hủy bỏ",
    cameraButtonAria: "Chụp ảnh hóa đơn",
    uploadButtonAria: "Tải ảnh lên",
    removeImage: "Xóa ảnh",
    imagePreviewAlt: "Ảnh xem trước",
    invalidFileType: "Định dạng ảnh không hợp lệ. Vui lòng chọn file ảnh.",
    fileTooLarge: "Ảnh quá lớn (tối đa 4MB)",
    parseError: "Có lỗi xảy ra khi xử lý. Vui lòng thử lại.",
    imageAttachedPlaceholder: "Ảnh đã được chọn. Nhấn Gửi để xử lý.",

    // Transaction types
    expense: "Chi tiêu",
    income: "Thu nhập",

    // Dashboard
    totalIncome: "Tổng thu",
    totalExpenses: "Tổng chi",
    netCashFlow: "Số dư",
    savingsRate: "Tỷ lệ tiết kiệm",
    recentTransactions: "Giao dịch gần đây",
    noTransactions: "Chưa có giao dịch nào",

    // Transactions page
    addTransaction: "Thêm giao dịch",
    deleteConfirm: "Xóa giao dịch này?",
    category: "Danh mục",

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
    appName: "walletmate",
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
    dashboard: "Your Wallet",
    transactions: "Transactions",
    settings: "Settings",
    signOut: "Sign out",

    // Smart Input
    smartInputPlaceholder:
      "Type a transaction... e.g., bought coffee 50k today",
    parsing: "Parsing...",
    previewTitle: "Confirm transaction",
    approve: "Approve",
    reject: "Cancel",
    cameraButtonAria: "Take photo of receipt",
    uploadButtonAria: "Upload image",
    removeImage: "Remove image",
    imagePreviewAlt: "Image preview",
    invalidFileType: "Invalid file format. Please select an image.",
    fileTooLarge: "Image too large (max 4MB)",
    parseError: "An error occurred while processing. Please try again.",
    imageAttachedPlaceholder: "Image attached. Press Send to process.",

    // Transaction types
    expense: "Expense",
    income: "Income",

    // Dashboard
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    netCashFlow: "Net Cash Flow",
    savingsRate: "Savings Rate",
    recentTransactions: "Recent Transactions",
    noTransactions: "No transactions yet",

    // Transactions page
    addTransaction: "Add Transaction",
    deleteConfirm: "Delete this transaction?",
    category: "Category",

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
