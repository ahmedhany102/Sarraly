
import React from 'react';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface WorkingHoursProps {
  settings: any;
}

const WorkingHours: React.FC<WorkingHoursProps> = ({ settings }) => {
  const workingHours = settings?.working_hours || 'السبت - الخميس: 9:00 ص - 10:00 م\nالجمعة: 2:00 م - 10:00 م';

  // Don't render if no working hours
  if (!workingHours || workingHours.trim() === '') return null;

  return (
    <Card className="mt-4 p-4 rounded-xl bg-muted/50">
      <div className="flex items-center gap-3 mb-3 flex-row-reverse">
        <div className="bg-primary/10 p-2 rounded-full">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold">ساعات العمل</h3>
      </div>
      <div className="space-y-1 text-right text-muted-foreground whitespace-pre-line text-sm">
        {workingHours}
      </div>
    </Card>
  );
};

export default WorkingHours;
