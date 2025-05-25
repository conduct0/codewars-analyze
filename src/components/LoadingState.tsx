import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  title?: string;
  className?: string;
  height?: number;
}

export const LoadingState = ({
  title,
  className = "",
  height = 200,
}: LoadingStateProps) => {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <Skeleton className="w-full" style={{ height }} />
      </CardContent>
    </Card>
  );
};
