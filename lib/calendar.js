import { google } from "googleapis";

// Build an authenticated Google Calendar client
function getCalendarClient(accessToken) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}

/**
 * Create a Google Calendar event.
 * eventData shape:
 * { title, date (YYYY-MM-DD), time (HH:MM), participants: [], description }
 */
export async function createCalendarEvent(accessToken, eventData, userEmail) {
  const calendar = getCalendarClient(accessToken);

  const { title, date, time, participants, description } = eventData;

  // Build start/end datetime — default to 1-hour duration
  let startDateTime, endDateTime;

  if (date && time) {
    startDateTime = new Date(`${date}T${time}:00`).toISOString();
    endDateTime = new Date(`${date}T${time}:00`);
    endDateTime.setHours(endDateTime.getHours() + 1);
    endDateTime = endDateTime.toISOString();
  } else if (date) {
    // All-day event
    startDateTime = date;
    endDateTime = date;
  } else {
    throw new Error("Event date is required to create a calendar event.");
  }

  // Filter to valid email addresses only, fallback to logged-in user if none
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmails = (participants || []).filter((p) => emailRegex.test(p));
  const attendeeEmails = validEmails.length > 0 ? validEmails : (userEmail ? [userEmail] : []);
  const attendees = attendeeEmails.map((email) => ({ email }));

  const event = {
    summary: title,
    description: description || "",
    attendees,
    ...(time
      ? {
          start: { dateTime: startDateTime, timeZone: "UTC" },
          end: { dateTime: endDateTime, timeZone: "UTC" },
        }
      : {
          start: { date: date },
          end: { date: date },
        }),
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
    sendUpdates: "all", // Send invite emails to attendees
  });

  return response.data;
}
