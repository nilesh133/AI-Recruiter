// Server-side utilities - contains Node.js dependencies (googleapis, nodemailer)
import { CalendarDate, CalendarDateTime } from "@internationalized/date";
import nodemailer from "nodemailer";
import { google } from "googleapis";

export const formatCalendarDateToDDMMYYYY = (date: CalendarDate): string => {
    const day = String(date.day).padStart(2, "0");
    const month = String(date.month).padStart(2, "0");
    const year = String(date.year);
    return `${year}-${month}-${day}`;
  };

  export const formatCalendarTime = (time: CalendarDateTime): string => {
    const hour = String(time.hour).padStart(2, "0");
    const minute = String(time.minute).padStart(2, "0");
    // const year = String(date.year);
    return `${hour}:${minute}`;
  };

  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URIS
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// Function to send email using OAuth2
export const sendMail = async ({ emailTo, subject, text, cc, bcc, attachments }: { emailTo: string, subject: string, text: string, cc: string[], bcc: string[], attachments: any[] }) => {
    try {
        const ACCESS_TOKEN = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.GMAIL_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN,
            },
        } as any);

        const mailOptions = {
            from: `"Nilesh" <${process.env.GMAIL_USER}>`,
            to: emailTo,
            subject: subject,
            text: text,
            attachments: attachments,
            cc: cc,
            bcc: bcc,
        };

        if (cc) {
            mailOptions.cc = cc;
        }

        if (bcc) {
            mailOptions.bcc = bcc;
        }

        const result = await transport.sendMail(mailOptions);
        return { status: true, result };
    } catch (err) {
      console.log(err);
        return { status: false, error: err as string };
    }
};