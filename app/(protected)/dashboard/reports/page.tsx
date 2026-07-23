import { DispatchConsole } from "./DispatchConsole";

export const metadata = {
  title: "Dispatch Console | CivicX",
  description: "Manage, review, and process municipal waste reports.",
};

export default function ReportsPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <DispatchConsole />
    </div>
  );
}
