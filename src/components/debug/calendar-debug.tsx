"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CalendarDebug() {
  const [currentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data, isLoading } =
    api.lunarCalendar.getVietnameseCalendarMonth.useQuery({
      year,
      month,
    });

  const { data: lunarEvents } = api.lunarEvents.getAll.useQuery({
    includeInactive: false,
  });

  if (isLoading) return <div>Loading debug info...</div>;

  const daysWithEvents = data?.days?.filter(
    (day) => day.events && day.events.length > 0,
  );

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Calendar Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold">Total Lunar Events:</h4>
          <p>{lunarEvents?.length ?? 0} events found</p>
        </div>

        <div>
          <h4 className="font-semibold">Days with Events in Calendar:</h4>
          <p>{daysWithEvents?.length ?? 0} days have events</p>
        </div>

        {daysWithEvents && daysWithEvents.length > 0 && (
          <div>
            <h4 className="font-semibold">Events on Calendar:</h4>
            {daysWithEvents.map((day, index) => (
              <div key={index} className="mb-2 rounded border p-2">
                <p>
                  <strong>Date:</strong> {day.gregorianDate.toDateString()}
                </p>
                <p>
                  <strong>Events:</strong>
                </p>
                <ul className="ml-4">
                  {day.events?.map((event, eventIndex) => (
                    <li key={eventIndex}>• {event.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {lunarEvents && lunarEvents.length > 0 && (
          <div>
            <h4 className="font-semibold">All Lunar Events:</h4>
            {lunarEvents.map((event) => (
              <div key={event.id} className="mb-2 rounded border p-2">
                <p>
                  <strong>Title:</strong> {event.title}
                </p>
                <p>
                  <strong>Lunar Date:</strong> {event.lunarDay}/
                  {event.lunarMonth}/{event.lunarYear}
                </p>
                <p>
                  <strong>Recurring:</strong> {event.isRecurring ? "Yes" : "No"}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
