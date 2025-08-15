"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CalendarDebug() {
  const [currentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data, isLoading } = api.lunarCalendar.getVietnameseCalendarMonth.useQuery({
    year,
    month,
  });

  const { data: events } = api.event.list.useQuery();

  if (isLoading) return <div>Loading debug info...</div>;

  const daysWithEvents = data?.days?.filter(day => day.events && day.events.length > 0);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Calendar Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold">Total Personal Events:</h4>
          <p>{events?.length || 0} events found</p>
        </div>

        <div>
          <h4 className="font-semibold">Days with Events in Calendar:</h4>
          <p>{daysWithEvents?.length || 0} days have events</p>
        </div>

        {daysWithEvents && daysWithEvents.length > 0 && (
          <div>
            <h4 className="font-semibold">Events on Calendar:</h4>
            {daysWithEvents.map((day, index) => (
              <div key={index} className="border p-2 rounded mb-2">
                <p><strong>Date:</strong> {day.gregorianDate.toDateString()}</p>
                <p><strong>Events:</strong></p>
                <ul className="ml-4">
                  {day.events?.map((event, eventIndex) => (
                    <li key={eventIndex}>• {event.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {events && events.length > 0 && (
          <div>
            <h4 className="font-semibold">All Personal Events:</h4>
            {events.map((event) => (
              <div key={event.id} className="border p-2 rounded mb-2">
                <p><strong>Title:</strong> {event.title}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}