import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  message: string;
  title?: string;
  className?: string;
}

export const EmptyState = ({
  message,
  title,
  className = "",
}: EmptyStateProps) => {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
