import { SiteHeader } from "@/widgets/header";
import { WeatherDashboard } from "@/widgets/weather-dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <SiteHeader />
        <WeatherDashboard />
      </div>
    </div>
  );
}
