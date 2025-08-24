import { SeatDetailPage } from "@/features/seat-finder";

interface SeatDetailPageProps {
  params: Promise<{
    roomNo: string;
  }>;
}

export default async function SeatDetailPageRoute({
  params,
}: SeatDetailPageProps) {
  const { roomNo } = await params;
  return <SeatDetailPage roomNo={roomNo} />;
}
