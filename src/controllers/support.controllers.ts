import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { UserAuthSchema } from "../schemas/user.schema";
import {
  CreateSupportTicketSchema,
  GetSupportTicketByUidSchema,
  UpdateSupportTicketSchema,
  DeleteSupportTicketSchema,
  CreateTicketMessageSchema,
  DeleteTicketMessageSchema,
} from "../schemas/support.schema";
import { v4 as uuidv4 } from "uuid";
import { AdminAuthSchema } from "../schemas/admin.schema";
import { sendUserEmail, sendEmailToAdmins } from "../emails";

export const getAllTickets = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
      include: {
        messages: true,
      },
    });

    res.status(200).json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllTicketsForUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = authParsed.data;

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userUid: uid },
      orderBy: { createdAt: "desc" },
      select: {
        uid: true,
        status: true,
        subject: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          select: {
            uid: true,
            message: true,
            senderType: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            email: true,
            fullName: true,
            image: true,
            username: true,
          },
        },
      },
    });

    res.status(200).json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createTicket = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const bodyParsed = CreateSupportTicketSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { shopId, uid } = authParsed.data;
  const reqData = bodyParsed.data;

  try {
    const ticket = await prisma.$transaction(async (tx) => {
      const counter = await tx.shopCounter.update({
        where: { shopId },
        data: { supportTicketCounter: { increment: 1 } },
      });

      const newTicket = await tx.supportTicket.create({
        data: {
          shopId,
          userUid: uid,
          shopScopedId: counter.supportTicketCounter,
          description: reqData.description,
          status: "OPEN",
          subject: reqData.subject,
          priority: reqData.priority,
          messages: {
            create: {
              uid: uuidv4(),
              senderUid: uid,
              message: reqData.message,
              senderType: "USER",
            },
          },
        },
      });

      return newTicket;
    });

    // Send confirmation email to user and notification to admins
    try {
      const user = await prisma.user.findUnique({ where: { uid } });
      const shop = await prisma.shop.findUnique({ where: { shopId } });
      const shopUrl = shop?.uid ? `https://${shop.uid}` : "";

      if (user?.email) {
        await sendUserEmail(shopId, user.email, "TICKET_CREATED", {
          userName: user.fullName || user.username,
          ticketNumber: `#${ticket.shopScopedId}`,
          subject: ticket.subject,
          priority: ticket.priority,
          ticketUrl: `${shopUrl}/support/ticket`,
        });
      }

      await sendEmailToAdmins(shopId, "NEW_TICKET_NOTIFICATION", {
        ticketNumber: `#${ticket.shopScopedId}`,
        customerName: user?.fullName || user?.username || "Customer",
        subject: ticket.subject,
        priority: ticket.priority,
        message: reqData.message.substring(0, 200),
        ticketUrl: `${shopUrl}/admin/support/ticket`,
      });
    } catch (emailError) {
      console.error("Failed to send ticket creation emails:", emailError);
    }

    res.status(200).json({
      success: "Ticket created successfully",
      uid: ticket.uid,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTicketByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const paramsParsed = GetSupportTicketByUidSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }

  const { uid: userUid } = authParsed.data;
  const { uid } = paramsParsed.data;

  try {
    const ticket = await prisma.supportTicket.findFirst({
      where: { uid, userUid },
      select: {
        uid: true,
        subject: true,
        description: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          select: {
            uid: true,
            message: true,
            senderType: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            email: true,
            fullName: true,
            image: true,
            username: true,
          },
        },
      },
    });

    res.status(200).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTicketByUidForAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = GetSupportTicketByUidSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }

  const { uid } = paramsParsed.data;
  const { shopId } = authParsed.data;

  try {
    const ticket = await prisma.supportTicket.findFirst({
      where: { uid, shopId },
      include: { messages: true, user: true },
    });

    res.status(200).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTicket = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = UpdateSupportTicketSchema.safeParse(req.body);
  const paramsParsed = GetSupportTicketByUidSchema.safeParse(req.params);

  if (!authParsed.success || !bodyParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: bodyParsed.error?.flatten(),
        params: paramsParsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid } = paramsParsed.data;
  const reqData = bodyParsed.data;
  const { shopId } = authParsed.data;

  try {
    const ticketBeforeUpdate = await prisma.supportTicket.findFirst({
      where: { uid, shopId },
      include: {
        user: { select: { email: true, fullName: true, username: true } },
      },
    });

    if (!ticketBeforeUpdate) {
      res.status(404).json({ error: "Ticket not found." });
      return;
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { uid, shopId },
      data: {
        status: reqData.status,
        priority: reqData.priority,
      },
    });

    // Send email if status changed to RESOLVED
    if (reqData.status === "RESOLVED" && ticketBeforeUpdate?.user?.email) {
      try {
        const shop = await prisma.shop.findUnique({
          where: { shopId: ticketBeforeUpdate.shopId },
        });
        const shopUrl = shop?.uid ? `https://${shop.uid}` : "";

        await sendUserEmail(
          ticketBeforeUpdate.shopId,
          ticketBeforeUpdate.user.email,
          "TICKET_RESOLVED",
          {
            userName:
              ticketBeforeUpdate.user.fullName ||
              ticketBeforeUpdate.user.username,
            ticketNumber: `#${ticketBeforeUpdate.shopScopedId}`,
            subject: ticketBeforeUpdate.subject,
            resolutionSummary:
              "Your support ticket has been resolved. If you have any further questions, feel free to create a new ticket.",
            ticketUrl: `${shopUrl}/support/tickets/${ticketBeforeUpdate.uid}`,
          },
        );
      } catch (emailError) {
        console.error("Failed to send ticket resolution email:", emailError);
      }
    }

    // Send email if status changed (updated)
    if (
      reqData.status &&
      reqData.status !== ticketBeforeUpdate?.status &&
      ticketBeforeUpdate?.user?.email
    ) {
      try {
        const shop = await prisma.shop.findUnique({
          where: { shopId: ticketBeforeUpdate.shopId },
        });
        const shopUrl = shop?.uid ? `https://${shop.uid}` : "";

        await sendUserEmail(
          ticketBeforeUpdate.shopId,
          ticketBeforeUpdate.user.email,
          "TICKET_UPDATED",
          {
            userName:
              ticketBeforeUpdate.user.fullName ||
              ticketBeforeUpdate.user.username,
            ticketNumber: `#${ticketBeforeUpdate.shopScopedId}`,
            updateType: "Status Update",
            updateDetails: `Your ticket status has been updated to: ${reqData.status}`,
            ticketUrl: `${shopUrl}/support/tickets/${ticketBeforeUpdate.uid}`,
          },
        );
      } catch (emailError) {
        console.error("Failed to send ticket update email:", emailError);
      }
    }

    res.status(200).json({ success: "Ticket updated successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTicket = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = DeleteSupportTicketSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        params: paramsParsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid } = paramsParsed.data;
  const { shopId } = authParsed.data;

  try {
    await prisma.supportTicket.delete({
      where: { uid, shopId },
    });

    res.status(200).json({ success: "Ticket deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const paramsParsed = GetSupportTicketByUidSchema.safeParse(req.params);
  const bodyParsed = CreateTicketMessageSchema.safeParse(req.body);

  if (!authParsed.success || !paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        params: paramsParsed.error?.flatten(),
        body: bodyParsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid: userUid } = authParsed.data;
  const { uid: ticketUid } = paramsParsed.data;
  const { message } = bodyParsed.data;

  try {
    const newMessage = await prisma.ticketMessage.create({
      data: {
        uid: uuidv4(),
        ticketUid,
        senderUid: userUid,
        message,
        senderType: "USER",
      },
    });

    res
      .status(200)
      .json({ success: "Message added successfully.", uid: newMessage.uid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addMessageForAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = GetSupportTicketByUidSchema.safeParse(req.params);
  const bodyParsed = CreateTicketMessageSchema.safeParse(req.body);

  if (!authParsed.success || !paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        params: paramsParsed.error?.flatten(),
        body: bodyParsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid: ticketUid } = paramsParsed.data;
  const { message } = bodyParsed.data;
  const { uid: adminUid } = authParsed.data;

  try {
    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketUid,
        senderUid: adminUid,
        message,
        senderType: "ADMIN",
      },
    });

    res.status(200).json({
      success: "Admin message added successfully.",
      uid: newMessage.uid,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = DeleteTicketMessageSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        params: paramsParsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid } = paramsParsed.data;
  const { shopId } = authParsed.data;

  try {
    // First verify the message belongs to a ticket in this shop
    const message = await prisma.ticketMessage.findUnique({
      where: { uid },
      include: { ticket: { select: { shopId: true } } },
    });

    if (!message || message.ticket.shopId !== shopId) {
      res.status(404).json({ error: "Message not found." });
      return;
    }

    await prisma.ticketMessage.delete({
      where: { uid },
    });

    res.status(200).json({ success: "Message deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
