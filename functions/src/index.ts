import cors from "cors";
import { DateTime } from "luxon";
import { z } from "zod";
import { google } from "googleapis";
import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

initializeApp();

const requestSchema = z.object({
  fullName: z.string().min(3),
  phoneNumber: z.string().min(8),
  appointmentDate: z.string().min(1),
  timeZone: z.string().min(1)
});

const corsHandler = cors({
  origin: true,
  methods: ["POST"],
  allowedHeaders: ["Content-Type"]
});

const googleCalendarClientId = defineSecret("GOOGLE_CALENDAR_CLIENT_ID");
const googleCalendarClientSecret = defineSecret("GOOGLE_CALENDAR_CLIENT_SECRET");
const googleCalendarRefreshToken = defineSecret("GOOGLE_CALENDAR_REFRESH_TOKEN");

export const createBookingEvent = onRequest(
  { secrets: [googleCalendarClientId, googleCalendarClientSecret, googleCalendarRefreshToken] },
  (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ ok: false, error: "Method not allowed" });
      return;
    }

    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: "Invalid payload" });
      return;
    }

    const {
      fullName,
      phoneNumber,
      appointmentDate,
      timeZone
    } = parsed.data;

    const start = DateTime.fromISO(appointmentDate, { zone: timeZone });
    if (!start.isValid) {
      res.status(400).json({ ok: false, error: "Invalid appointmentDate or timeZone" });
      return;
    }

    const end = start.plus({ minutes: 15 });

    const clientId = googleCalendarClientId.value();
    const clientSecret = googleCalendarClientSecret.value();
    const refreshToken = googleCalendarRefreshToken.value();
    const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";

    if (!clientId || !clientSecret || !refreshToken) {
      res.status(500).json({ ok: false, error: "Calendar credentials not configured" });
      return;
    }

    try {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const result = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `استشارة مجانية - ${fullName}`,
          description: `رقم الهاتف: ${phoneNumber}\nالموعد: ${appointmentDate} (${timeZone})`,
          start: {
            dateTime: start.toISO(),
            timeZone
          },
          end: {
            dateTime: end.toISO(),
            timeZone
          }
        }
      });

      res.status(200).json({ ok: true, eventId: result.data.id });
    } catch (error) {
      console.error("Failed to create calendar event", error);
      res.status(500).json({ ok: false, error: "Failed to create calendar event" });
    }
  });
});
