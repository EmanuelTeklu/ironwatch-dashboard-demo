import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryLoadingProps {
  readonly message?: string;
}

export function QueryLoading({ message = "Loading..." }: QueryLoadingProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

interface QueryErrorProps {
  readonly message: string;
  readonly onRetry?: () => void;
}

export function QueryError({ message, onRetry }: QueryErrorProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <div>
          <p className="text-sm font-medium text-foreground">Failed to load data</p>
          <p className="mt-1 text-xs text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
