import { z } from "zod";
import { sendEmail } from "../send";
import { InvitationEmail } from "@/emails/invitation-email";
import { routes, getRoute } from "@/lib/routes";

const SendInvitationEmailParamsSchema = z.object({
  to: z.string().email(),
  organizationName: z.string().min(1),
  inviterName: z.string().min(1),
  role: z.string().min(1),
  token: z.string().min(1),
  expiresAt: z.date(),
});

type SendInvitationEmailParams = z.infer<typeof SendInvitationEmailParamsSchema>;

export async function sendInvitationEmail(params: SendInvitationEmailParams) {
  const validated = SendInvitationEmailParamsSchema.parse(params);

  const inviteLink = getRoute(routes.organization.acceptInvite, { token: validated.token }, true);

  await sendEmail({
    to: validated.to,
    subject: `You've been invited to join ${validated.organizationName}`,
    react: InvitationEmail({
      organizationName: validated.organizationName,
      inviterName: validated.inviterName,
      role: validated.role,
      inviteLink,
      expiresAt: validated.expiresAt,
    }),
  });
}
