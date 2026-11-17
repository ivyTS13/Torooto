import React from "react";
import PileHistoryView from "../components/piles/PileHistoryView";

export default function PileList() {
  return (
    <PileHistoryView
      basePath="/admin/piles"
      title="Saved Readings"
      subtitle="Chronological archive of saved Tarot spreads"
    />
  );
}
