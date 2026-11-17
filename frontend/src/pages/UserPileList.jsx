import React from "react";
import UserLayout from "../components/User/UserLayout";
import PileHistoryView from "../components/piles/PileHistoryView";

export default function UserPileList() {
  return (
    <UserLayout>
      <PileHistoryView
        basePath="/piles"
        title="Reading History"
        subtitle="Chronological record of your saved spreads"
      />
    </UserLayout>
  );
}
