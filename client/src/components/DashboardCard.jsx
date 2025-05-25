export default function DashboardCard({ children, className = "" }) {
  return (
    <div
      className={`flex flex-col p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
}
