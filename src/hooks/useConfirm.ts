import { useState } from "react";

export function useConfirm() {
  const [targetId, setTargetId] = useState<string | null>(null);

  return {
    targetId,
    isOpen: targetId !== null,
    request: (id: string) => setTargetId(id),
    close: () => setTargetId(null),
  };
}
