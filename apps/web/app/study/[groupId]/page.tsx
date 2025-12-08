"use client";

import { useParams } from "next/navigation";
import { StudyDetailPage } from "@/features/study";

export default function StudyDetailRoute() {
  const params = useParams();
  const groupId = params.groupId as string;

  return <StudyDetailPage groupId={groupId} />;
}
