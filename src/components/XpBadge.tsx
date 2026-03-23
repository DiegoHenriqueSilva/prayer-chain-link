import { getLevel, getNextLevel, getLevelProgress } from "@/lib/xp";
import { Progress } from "@/components/ui/progress";

interface XpBadgeProps {
  totalXp: number;
  compact?: boolean;
}

export function XpBadge({ totalXp, compact = false }: XpBadgeProps) {
  const level = getLevel(totalXp);
  const next = getNextLevel(totalXp);
  const progress = getLevelProgress(totalXp);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-lg">{level.emoji}</span>
        <span className="font-semibold text-primary">{level.name}</span>
        <span className="text-muted-foreground">• {totalXp} XP</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{level.emoji}</span>
          <div>
            <p className="font-semibold text-primary">{level.name}</p>
            <p className="text-xs text-muted-foreground">{totalXp} XP</p>
          </div>
        </div>
        {next && (
          <p className="text-xs text-muted-foreground">
            Próximo: {next.emoji} {next.name} ({next.minXp} XP)
          </p>
        )}
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
