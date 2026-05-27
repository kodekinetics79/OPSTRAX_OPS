// Common components
export {
  CommonButton,
  CustomInput,
  Card,
  DynamicTable,
  Logo,
  NotificationDropdown,
  ProfileDropdown,
  Dropdown,
  InfoCard,
  StatusBadge,
  Modal,
  PageHeader,
  EmptyState,
  ConfirmDialog,
  Badge,
  GradeBadge,
} from "./common";

// Admin-specific components (screen-level pieces)
export * from "./admin";

// Shared layout components
export { SharedHeader, Sidebar, SidebarNavItem } from "./shared";

// Auth components
export { Input } from "./auth";

// Decoupled UI components
export * from "./headers";
export * from "./stats";
export * from "./modals";
