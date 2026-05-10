import { Plus, Minus } from "lucide-react";

type Props = {
  id: string;
  count: number;
  onToggle: () => void;
  onAdd: () => void;
  onRemove: () => void;
};

export function StickerCard({ id, count, onToggle, onAdd, onRemove }: Props) {
  const owned = count >= 1;
  const repeats = count > 1 ? count - 1 : 0;

  return (
    <div
      className={`group relative aspect-[3/4] select-none overflow-hidden rounded-xl border transition-all duration-200 active:scale-95 ${
        owned
          ? "border-success/50 bg-gradient-to-br from-success/30 to-success/10 shadow-[0_0_0_1px_var(--success)/0.3]"
          : "border-border/50 bg-muted/40 hover:border-primary/40"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex h-full w-full flex-col items-center justify-center gap-1 p-2"
        aria-label={`Alternar ${id}`}
      >
        <span
          className={`text-[10px] font-medium uppercase tracking-wider ${
            owned ? "text-success-foreground/70" : "text-muted-foreground"
          }`}
        >
          fig.
        </span>
        <span
          className={`text-base font-black leading-none tabular-nums sm:text-lg ${
            owned ? "text-success-foreground" : "text-foreground/70"
          }`}
        >
          {id}
        </span>
        {owned && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-success-foreground/80">
            tenho
          </span>
        )}
      </button>

      {repeats > 0 && (
        <div className="absolute left-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-black text-destructive-foreground shadow-lg">
          +{repeats}
        </div>
      )}

      <div className="absolute bottom-1.5 right-1.5 flex gap-1">
        {repeats > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md transition-all hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Remover repetida"
          >
            <Minus className="h-3 w-3" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:scale-110"
          aria-label="Adicionar repetida"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
