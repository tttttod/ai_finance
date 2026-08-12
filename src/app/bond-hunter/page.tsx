import { BondHunterGame } from "@/components/bond-hunter/BondHunterGame";

export const metadata = {
  title: "Bond Hunter: Fixed Income Challenge",
  description: "A fixed income investment simulation game",
};

export default function BondHunterPage() {
  return (
    <div className="min-h-screen bg-[#0B0E14]">
      <BondHunterGame />
    </div>
  );
}
