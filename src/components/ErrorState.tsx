import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  title?: string;
  className?: string;
}

export const ErrorState = ({
  message,
  title,
  className = "",
}: ErrorStateProps) => {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <Alert variant="destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
