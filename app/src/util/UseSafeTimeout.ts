import { useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

export function useSafeTimeout() {
  const timeoutsRef = useRef<Set<number>>(new Set());
  const cycleRef = useRef(0); // token para invalidar callbacks de ciclos anteriores

  const nextCycle = useCallback(() => {
    cycleRef.current += 1;
  }, []);

  const safeSetTimeout = useCallback(
    (fn: () => void, ms: number) => {
      const token = cycleRef.current;
      const id = setTimeout(() => {
        // si cambió el ciclo, no ejecutes
        if (token !== cycleRef.current) return;
        // ejecuta protegido
        fn();
        timeoutsRef.current.delete(id as unknown as number);
      }, ms) as unknown as number;

      timeoutsRef.current.add(id);
      return id;
    },
    []
  );

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current.clear();
  }, []);

  // Limpia en unmount
  useEffect(() => clearAllTimeouts, [clearAllTimeouts]);

  // Limpia cada vez que la pantalla pierde foco (salís o navegás)
  useFocusEffect(
    useCallback(() => {
      // al ganar foco, nada
      return () => {
        nextCycle();         // invalida callbacks pendientes
        clearAllTimeouts();  // cancela timers
      };
    }, [clearAllTimeouts, nextCycle])
  );

  return { safeSetTimeout, clearAllTimeouts, nextCycle, cycleRef };
}
