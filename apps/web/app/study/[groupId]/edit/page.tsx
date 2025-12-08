"use client";

import { useParams } from "next/navigation";
import { StudyEditPage } from "@/features/study";

export default function StudyEditRoute() {
  const params = useParams();
  const groupId = params.groupId as string;

  return <StudyEditPage groupId={groupId} />;
}



